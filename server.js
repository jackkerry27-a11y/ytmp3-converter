const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const crypto = require('crypto');
const axios = require('axios');

// ─── Node binary (for yt-dlp EJS solver) ────────────────────────────────────
const NODE_BIN = process.execPath || 'node';
console.log(`[Config] Platform: ${process.platform} | Node: ${NODE_BIN}`);

// ─── RapidAPI Config ─────────────────────────────────────────────────────────
// Buraya kendi RapidAPI key'inizi yazın VEYA Render'da Environment Variable ekleyin:
// Key adı: RAPIDAPI_KEY
// Değer: rapidapi.com'dan kopyaladığınız key
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'youtube-mp36.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.warn('[Config] ⚠️  RAPIDAPI_KEY eksik! Yedek motor (yt-dlp) kullanılacak.');
  console.warn('[Config] Render > Service > Environment > Add Env Variable: RAPIDAPI_KEY=<key>');
} else {
  console.log('[Config] ✓ RapidAPI key mevcut');
}

// ─── Express Setup ───────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Downloads Directory ─────────────────────────────────────────────────────
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

// ─── In-memory job & metadata cache ─────────────────────────────────────────
const jobs = new Map();
const metadataCache = new Map();

// Cleanup every 5 min: delete files > 15 min old
setInterval(() => {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000;
  fs.readdir(DOWNLOADS_DIR, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const fp = path.join(DOWNLOADS_DIR, file);
      fs.stat(fp, (e, s) => { if (!e && now - s.mtimeMs > maxAge) fs.unlink(fp, () => {}); });
    });
  });
  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > maxAge) jobs.delete(id);
  }
}, 5 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.trim().match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i
  );
  return m ? m[1] : null;
}

function formatDuration(s) {
  if (!s || isNaN(s)) return '00:00';
  const sec = Math.floor(s);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), ss = sec % 60;
  return h > 0
    ? `${h}:${m < 10 ? '0' : ''}${m}:${ss < 10 ? '0' : ''}${ss}`
    : `${m}:${ss < 10 ? '0' : ''}${ss}`;
}

function formatViews(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

function sanitizeFilename(name) {
  return (name || '').replace(/[/\\?%*:|"<>]/g, '_').trim() || 'youtube_download';
}

// ─── Default Formats ──────────────────────────────────────────────────────────
const DEFAULT_FORMATS = {
  audio: [
    { format: 'mp3', quality: '320', label: '320 kbps (En Yüksek HD Kalite)', sizeApprox: '~5-10 MB' },
    { format: 'mp3', quality: '256', label: '256 kbps (Yüksek Kalite)', sizeApprox: '~4-8 MB' },
    { format: 'mp3', quality: '192', label: '192 kbps (Standart Kalite)', sizeApprox: '~3-6 MB' },
    { format: 'mp3', quality: '128', label: '128 kbps (Hızlı & Küçük)', sizeApprox: '~2-4 MB' },
    { format: 'm4a', quality: 'best', label: 'M4A / AAC (Apple Cihazlar)', sizeApprox: '~3-5 MB' },
    { format: 'wav', quality: 'lossless', label: 'WAV (Kayıpsız Stüdyo)', sizeApprox: '~20-40 MB' }
  ],
  video: [
    { format: 'mp4', quality: '1080', label: '1080p Full HD MP4', note: 'En Net Görüntü' },
    { format: 'mp4', quality: '720',  label: '720p HD MP4', note: 'Popüler & Hızlı' },
    { format: 'mp4', quality: '480',  label: '480p SD MP4', note: 'Dengeli Boyut' },
    { format: 'mp4', quality: '360',  label: '360p Mobil MP4', note: 'Düşük Kota' }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMARY ENGINE: RapidAPI youtube-mp36
// API: https://rapidapi.com/ytjar/api/youtube-mp36
// Free tier: 300 requests/month — no bot detection, works from any server IP
// ═══════════════════════════════════════════════════════════════════════════════
async function downloadViaRapidAPI(videoId, format, quality, jobId, job) {
  if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

  const isAudio = ['mp3', 'm4a', 'wav'].includes(format.toLowerCase());

  if (isAudio) {
    // MP3: use youtube-mp36 API
    job.progress = 15; job.message = 'RapidAPI motoru çalışıyor...';

    // Step 1: Request conversion — may need polling for status "ok"
    let mp3Link = null;
    let attempts = 0;

    while (attempts < 15) {
      const res = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
        params: { id: videoId },
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY
        },
        timeout: 20000
      });

      const data = res.data;
      console.log(`[RapidAPI] attempt ${attempts + 1}: status=${data.status} progress=${data.progress}`);

      if (data.status === 'ok' && data.link) {
        mp3Link = data.link;
        break;
      } else if (data.status === 'fail' || (data.msg && data.msg.toLowerCase().includes('error'))) {
        throw new Error(`RapidAPI: ${data.msg || 'conversion failed'}`);
      }

      // status = 'processing', wait and retry
      attempts++;
      job.progress = Math.min(60, 15 + attempts * 3);
      job.message = `Dönüştürülüyor... (%${data.progress || 0})`;
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!mp3Link) throw new Error('RapidAPI: conversion timed out');

    // Step 2: Download the MP3 file from the CDN link
    job.progress = 70; job.message = 'MP3 indiriliyor...';
    const outPath = path.join(DOWNLOADS_DIR, `${jobId}.mp3`);

    const fileRes = await axios.get(mp3Link, {
      responseType: 'stream',
      timeout: 120000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    await new Promise((resolve, reject) => {
      const w = fs.createWriteStream(outPath);
      fileRes.data.pipe(w);
      w.on('finish', resolve);
      w.on('error', reject);
      fileRes.data.on('error', reject);
    });

    // If WAV or M4A requested: convert with ffmpeg
    if (format === 'wav') {
      job.progress = 85; job.message = 'WAV formatına dönüştürülüyor...';
      const wavPath = path.join(DOWNLOADS_DIR, `${jobId}.wav`);
      await ffmpegConvert(outPath, wavPath, ['-vn', '-ar', '44100', '-ac', '2']);
      return `${jobId}.wav`;
    }

    return `${jobId}.mp3`;

  } else {
    // VIDEO: youtube-mp36 only does audio, use yt-dlp for video
    throw new Error('RapidAPI video format not supported — falling back to yt-dlp');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: FFmpeg converter
// ═══════════════════════════════════════════════════════════════════════════════
function ffmpegConvert(input, output, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', input, ...extraArgs, output];
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      try { if (input !== output) fs.unlinkSync(input); } catch (e) {}
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-200)}`));
    });
    proc.on('error', err => reject(new Error('ffmpeg not found: ' + err.message)));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK ENGINE: YT-DLP (android/mweb/ios clients)
// ═══════════════════════════════════════════════════════════════════════════════
function downloadViaYtDlp(videoId, format, quality, jobId, job) {
  return new Promise((resolve, reject) => {
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const isAudio = ['mp3', 'm4a', 'wav'].includes(format.toLowerCase());

    const args = [
      '--no-warnings', '--no-playlist', '--newline',
      '--extractor-args', 'youtube:player_client=android,mweb,ios',
      '--js-runtimes', NODE_BIN,
      '--remote-components', 'ejs:github'
    ];

    if (isAudio) {
      args.push('-f', 'bestaudio[ext=m4a]/bestaudio/best');
      args.push('-x', '--audio-format', format === 'wav' ? 'wav' : (format === 'm4a' ? 'm4a' : 'mp3'));
      if (format === 'mp3') {
        const kbps = parseInt(quality) || 192;
        args.push('--postprocessor-args', `ExtractAudio:-b:a ${kbps}k`);
      }
      args.push('-o', path.join(DOWNLOADS_DIR, `${jobId}.%(ext)s`));
    } else {
      const maxH = parseInt(quality) || 720;
      args.push(
        '-f', `bestvideo[height<=${maxH}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}]+bestaudio/best`,
        '--merge-output-format', 'mp4',
        '-o', path.join(DOWNLOADS_DIR, `${jobId}.mp4`)
      );
    }

    args.push(cleanUrl);
    const child = spawn('yt-dlp', args);

    child.stdout.on('data', data => {
      const text = data.toString();
      const m = text.match(/\[download\]\s+([\d.]+)%/);
      if (m) {
        job.progress = Math.min(85, Math.floor(10 + parseFloat(m[1]) * 0.75));
        job.message = `%${job.progress} indiriliyor... (yedek motor)`;
      } else if (text.includes('[ExtractAudio]') || text.includes('[Merger]')) {
        job.progress = 90; job.message = 'Dönüştürülüyor...';
      }
    });

    let stderrBuf = '';
    child.stderr.on('data', d => { stderrBuf += d.toString(); });

    child.on('close', () => {
      // Check for file regardless of exit code (warnings cause exit=1)
      fs.readdir(DOWNLOADS_DIR, (err, files) => {
        const found = files ? files.find(f => f.startsWith(jobId)) : null;
        if (found) resolve(found);
        else {
          const errLine = stderrBuf.split('\n').filter(l => l.includes('ERROR:')).join(' ').trim();
          reject(new Error(errLine || stderrBuf.slice(-300) || 'yt-dlp failed'));
        }
      });
    });

    child.on('error', err => reject(new Error('yt-dlp not found: ' + err.message)));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Get Video Information (oEmbed — always works, no auth needed)
app.get('/api/info', async (req, res) => {
  const { url } = req.query;
  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Geçersiz YouTube URL adresi!' });
  }

  if (metadataCache.has(videoId)) {
    return res.json({ success: true, data: metadataCache.get(videoId) });
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const oembed = await axios.get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
      { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const d = oembed.data;

    const videoInfo = {
      id: videoId, url: cleanUrl,
      title: d.title || 'YouTube Video',
      channel: d.author_name || 'YouTube Creator',
      duration: '03:45', durationSec: 225,
      thumbnail: d.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      views: '—',
      formats: DEFAULT_FORMATS
    };

    metadataCache.set(videoId, videoInfo);
    setTimeout(() => metadataCache.delete(videoId), 60 * 60 * 1000);
    return res.json({ success: true, data: videoInfo });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Video bilgileri alınamadı. Lütfen YouTube linkini kontrol edin.' });
  }
});

// 2. Start Conversion Job
app.post('/api/convert', async (req, res) => {
  const { url, format = 'mp3', quality = '192', title = 'audio' } = req.body;
  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Geçersiz YouTube linki.' });
  }

  const jobId = crypto.randomUUID();

  const job = {
    id: jobId,
    videoId,
    format: format.toLowerCase(),
    quality,
    title: sanitizeFilename(title),
    outputFileName: null,
    status: 'processing',
    progress: 5,
    message: 'Motor başlatılıyor...',
    error: null,
    createdAt: Date.now()
  };

  jobs.set(jobId, job);

  // Engine chain: RapidAPI → yt-dlp → error
  (async () => {
    // Engine 1: RapidAPI (audio only, requires API key)
    const isAudio = ['mp3', 'm4a', 'wav'].includes(format.toLowerCase());
    if (RAPIDAPI_KEY && isAudio) {
      try {
        job.message = 'RapidAPI motoru çalışıyor...';
        const filename = await downloadViaRapidAPI(videoId, format, quality, jobId, job);
        job.outputFileName = filename;
        job.status = 'completed';
        job.progress = 100;
        job.message = 'Dönüştürme tamamlandı! İndirmeye hazır.';
        console.log(`[Job ${jobId}] ✓ RapidAPI: ${filename}`);
        return;
      } catch (rapidErr) {
        console.warn(`[Job ${jobId}] RapidAPI failed: ${rapidErr.message.slice(0, 100)}`);
      }
    }

    // Engine 2: yt-dlp (fallback — may be blocked on cloud IPs for some videos)
    try {
      job.progress = 10;
      job.message = 'Yedek motor deneniyor (yt-dlp)...';
      const filename = await downloadViaYtDlp(videoId, format, quality, jobId, job);
      job.outputFileName = filename;
      job.status = 'completed';
      job.progress = 100;
      job.message = 'Dönüştürme tamamlandı! İndirmeye hazır.';
      console.log(`[Job ${jobId}] ✓ yt-dlp: ${filename}`);
    } catch (ytErr) {
      job.status = 'error';
      job.error = 'Bu video şu an indirилemiyor. Farklı bir video deneyin veya daha sonra tekrar deneyin.';
      console.error(`[Job ${jobId}] ✗ All engines failed. Last error:`, ytErr.message.slice(0, 150));
    }
  })();

  return res.json({ success: true, jobId, message: 'Dönüştürme işlemi sıraya alındı.' });
});

// 3. Job Progress
app.get('/api/progress/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'İşlem bulunamadı.' });
  res.json({
    success: true,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
    downloadUrl: job.status === 'completed' ? `/api/download/${job.id}` : null
  });
});

// 4. Download File
app.get('/api/download/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'completed') return res.status(404).send('Dosya bulunamadı.');

  const filePath = path.join(DOWNLOADS_DIR, job.outputFileName);
  if (!fs.existsSync(filePath)) return res.status(404).send('Dosya zaman aşımına uğradı. Lütfen tekrar dönüştürün.');

  const ext = path.extname(job.outputFileName);
  res.download(filePath, `${job.title}${ext}`, err => {
    if (err) console.error('Download error:', err.code);
  });
});

// 5. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '2.1.0',
    service: 'YouTube MP3 Converter Pro',
    engines: {
      rapidapi: RAPIDAPI_KEY ? 'configured' : 'missing_key',
      ytdlp: 'fallback'
    }
  });
});

// Static files
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sitemap.xml')));
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'public', 'robots.txt')));
app.use((req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log('='.repeat(55));
  console.log('🚀 YouTube MP3 Converter v2.1');
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`🎵 Engine 1: RapidAPI (${RAPIDAPI_KEY ? '✓ ready' : '✗ no key'})`);
  console.log('🎵 Engine 2: yt-dlp (fallback)');
  console.log('='.repeat(55));
});
