/**
 * YouTube MP3 Converter Pro - Client-side Logic & Monetization Engine
 */

// ==========================================================================
// 1. MONETIZATION & AD CONFIGURATION (Para Kazanma Ayarları)
// ==========================================================================
// ★ REKLAM AYARLARI ★
// Adsterra SmartLink / Direct Link URL'nizi buraya yapıştırın:
// Adsterra → Yeni Kampanya → Direct Link / SmartLink → URL'yi kopyalayın
const MONETIZATION_CONFIG = {
  // İndir butonuna basıldığında yeni sekmede reklam aç (Adsterra DirectLink)
  // Adsterra panelinden aldığınız SmartLink URL'sini directLinkUrl'ye yapıştırın!
  enableDirectLinkOnDownload: true,
  directLinkUrl: 'https://www.profitableratecpmnetwork.com/click/xyz-placeholder',
  // ↑↑ BURAYI KENDİ ADSTERRA SmartLink URL'NİZLE DEĞİŞTİRİN ↑↑

  // Sayfa kaydırıldığında veya dönüştür butonuna basıldığında extra reklam tetikle
  enableScrollAd: true,
  scrollAdUrl: 'https://www.profitableratecpmnetwork.com/click/xyz-placeholder',
  // ↑↑ İKİNCİ ADSTERRA SmartLink URL'NİZİ BURAYA YAPIŞTIRIN ↑↑

  // İndirme başlamadan önce geri sayım (saniye) - 0 ise doğrudan başlar
  countdownSeconds: 0,

  // Kaç kez tıklamadan sonra reklam tekrar açılsın (spam önleme)
  adCooldownMs: 30000  // 30 saniye
};

// Reklam tetikleyici (cooldown korumalı)
const _adState = { lastFired: 0, scrollFired: false };
function triggerDirectAd(url) {
  if (!url || url.includes('placeholder')) return;
  const now = Date.now();
  if (now - _adState.lastFired < MONETIZATION_CONFIG.adCooldownMs) return;
  _adState.lastFired = now;
  try {
    const w = window.open(url, '_blank', 'noopener,noreferrer,width=1,height=1');
    // Bazı tarayıcılar popup'ı engeller; link elementi ile fallback
    if (!w || w.closed || typeof w.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  } catch(e) { /* Popup blocker */ }
}

// ==========================================================================
// 2. MULTI-LANGUAGE DICTIONARY (Çok Dilli SEO & Global Trafik)
// ==========================================================================
const TRANSLATIONS = {
  tr: {
    heroBadge: 'En Hızlı YouTube MP3 & MP4 Dönüştürücü v2.4',
    heroTitle: 'YouTube <span class="gradient-text">MP3 Dönüştürücü</span>',
    heroSubtitle: 'YouTube videolarını ve Shorts kliplerini saniyeler içinde <strong>320kbps stüdyo kalitesinde</strong> MP3 veya Full HD MP4 olarak ücretsiz indirin.',
    paste: 'Yapıştır',
    convert: 'Dönüştür',
    popular: 'Popüler:',
    installApp: 'Uygulamayı Yükle',
    audioTab: 'Ses (MP3)',
    videoTab: 'Video (MP4)',
    downloadNow: 'Hemen İndir',
    saveFile: 'Dosyayı Kaydet',
    converting: 'Dönüştürülüyor...',
    completed: 'Dönüştürme Tamamlandı!',
    featuresTitle: 'Neden En İyi YouTube MP3 Dönüştürücüyüz?',
    featuresDesc: 'Milyonlarca kullanıcının tercih ettiği lider müzik ve video dönüştürme platformu.',
    feat1Title: 'Ultra Hızlı Dönüştürme',
    feat1Desc: 'Gelişmiş bulut motorumuz sayesinde videoları beklemeden, saniyeler içinde MP3 ses formatına dönüştürüp indirin.',
    feat2Title: '320kbps HD Ses Kalitesi',
    feat2Desc: 'Ses kaybı olmadan en yüksek 320kbps stüdyo kalitesinde MP3 indirin. Kristal netliğinde bas ve tiz deneyimi yaşayın.',
    feat3Title: '%100 Ücretsiz & Sınırsız',
    feat3Desc: 'Kayıt olmak, kredi kartı girmek veya program yüklemek yok. İstediğiniz kadar şarkıyı sınırsızca indirin.',
    feat4Title: 'Tüm Cihazlarla Uyumlu',
    feat4Desc: 'iPhone, iPad, Android, Windows ve Mac cihazların tüm tarayıcılarında kesintisiz ve akıcı bir şekilde çalışır.',
    howtoTitle: "YouTube'dan MP3 Nasıl İndirilir? (3 Kolay Adım)",
    step1Title: 'YouTube Bağlantısını Kopyalayın',
    step1Desc: "YouTube uygulamasından veya web sitesinden indirmek istediğiniz videonun 'Paylaş' butonuna basıp linki kopyalayın.",
    step2Title: 'Linki Yapıştırın & Formatı Seçin',
    step2Desc: 'Kopyaladığınız linki yukarıdaki arama kutusuna yapıştırın. İstediğiniz MP3 bitrate (320k) veya MP4 kalitesini belirleyin.',
    step3Title: "'İndir' Butonuna Tıklayın",
    step3Desc: 'Dönüştürme işlemi birkaç saniye içinde tamamlanır ve ses dosyanız doğrudan cihazınıza kaydedilir.',
    faqTitle: 'Sıkça Sorulan Sorular (SSS)',
    faqDesc: 'YouTube MP3 ve video indirme hakkında merak edilen tüm sorular ve cevapları.',
    faq1Q: 'YouTube MP3 indirmek yasal ve güvenli mi?',
    faq1A: 'Kişisel kullanım, telifsiz müzikler ve eğitim amaçlı YouTube içeriklerini indirmek tamamen güvenlidir. Web sitemiz hiçbir dosyanızı saklamaz, hiçbir virüs veya zararlı yazılım barındırmaz.',
    faq2Q: '320kbps MP3 kalitesi gerçekten orijinal mi?',
    faq2A: 'Evet! Sunucularımız YouTube akışındaki en yüksek kaliteli Opus/AAC ses parçasını LAME MP3 enkoderi kullanarak 320kbps sabit bitrate ile işler, böylece kayıpsız ses deneyimi sunar.',
    faq3Q: 'YouTube Shorts videolarını indirebilir miyim?',
    faq3A: 'Evet! Tüm dikey YouTube Shorts videoları tam olarak desteklenmektedir. Shorts linkini yapıştırmanız yeterlidir.',
    faq4Q: "iPhone veya iPad'e nasıl müzik indirilir?",
    faq4A: "iOS 13 ve üzeri Safari tarayıcısında 'İndir' butonuna bastığınızda dosya doğrudan Apple 'Dosyalar' (Files) uygulamasına iner ve internetsiz dinlenebilir.",
    faq5Q: 'İndirme limiti veya günlük kısıtlama var mı?',
    faq5A: 'Hayır! Sistemimizde herhangi bir indirme kotası, adet sınırı veya bekleme süresi bulunmamaktadır.',
    footerDesc: 'Dünyanın en hızlı ve güvenli YouTube MP3 ve MP4 dönüştürme aracı.',
    navHome: 'Ana Sayfa',
    navConverter: 'Dönüştürücü',
    navFaq: 'SSS',
    disclaimer: '<strong>Yasal Uyarı:</strong> Bu web sitesi YouTube veya Google LLC ile hiçbir resmi bağlantıya sahip değildir. Servisimiz yalnızca kamuya açık içeriklerin kişisel ve telifsiz kullanımı için tasarlanmıştır. Kullanıcılar telif haklarına uymaktan kendileri sorumludur.',
    metaTitle: 'YouTube MP3 Dönüştürücü - 320kbps Hızlı & Ücretsiz İndir',
    metaDesc: 'YouTube videolarını ve shorts içeriklerini en yüksek 320kbps ses kalitesinde ücretsiz, hızlı ve programsız MP3 & MP4 formatında indirin.'
  },
  en: {
    heroBadge: 'Fastest YouTube MP3 & MP4 Converter v2.4',
    heroTitle: 'YouTube <span class="gradient-text">to MP3 Converter</span>',
    heroSubtitle: 'Download YouTube videos and Shorts clips in <strong>320kbps studio quality</strong> MP3 audio or Full HD MP4 for free in seconds.',
    paste: 'Paste',
    convert: 'Convert',
    popular: 'Popular:',
    installApp: 'Install App',
    audioTab: 'Audio (MP3)',
    videoTab: 'Video (MP4)',
    downloadNow: 'Download Now',
    saveFile: 'Save File',
    converting: 'Converting...',
    completed: 'Conversion Completed!',
    featuresTitle: 'Why We Are The Best YouTube Converter',
    featuresDesc: 'The trusted music and video conversion platform chosen by millions worldwide.',
    feat1Title: 'Ultra Fast Conversion',
    feat1Desc: 'Convert and download videos into MP3 audio within seconds with our high-speed cloud engine.',
    feat2Title: '320kbps HD Audio Quality',
    feat2Desc: 'Enjoy crystal-clear bass and treble with highest 320kbps bitrate MP3 downloads without quality loss.',
    feat3Title: '100% Free & Unlimited',
    feat3Desc: 'No registration, no credit card, no software installation needed. Download unlimited music completely free.',
    feat4Title: 'Compatible With All Devices',
    feat4Desc: 'Seamlessly works across iPhone, iPad, Android, Windows, Mac, and all modern web browsers.',
    howtoTitle: 'How to Download MP3 from YouTube? (3 Simple Steps)',
    step1Title: 'Copy YouTube URL',
    step1Desc: "Open YouTube, find the video or Shorts you want, click 'Share' and copy the link.",
    step2Title: 'Paste Link & Choose Format',
    step2Desc: 'Paste the link into the search box above and select your desired audio quality (320k) or video format.',
    step3Title: "Click 'Download'",
    step3Desc: 'Conversion finishes in seconds and your file is saved directly to your device storage.',
    faqTitle: 'Frequently Asked Questions (FAQ)',
    faqDesc: 'Everything you need to know about YouTube MP3 conversion and downloading.',
    faq1Q: 'Is downloading YouTube MP3 legal and safe?',
    faq1A: 'Downloading royalty-free, creative commons, and public educational content for personal offline listening is safe. Our website never stores your files and is 100% free of viruses.',
    faq2Q: 'Is the 320kbps audio quality genuine?',
    faq2A: 'Yes! Our servers extract the highest stream quality directly from YouTube and re-encode with LAME MP3 encoder at fixed 320kbps.',
    faq3Q: 'Can I convert YouTube Shorts to MP3?',
    faq3A: 'Yes! Vertical YouTube Shorts are fully supported. Just paste the Shorts URL to extract audio.',
    faq4Q: 'How do I download music on iPhone or iPad?',
    faq4A: "On iOS Safari, tap 'Download' and the file will save directly into Apple's Files app for offline playback.",
    faq5Q: 'Is there any download limit?',
    faq5A: 'No! There are no daily quotas, rate limits, or hidden fees. Enjoy unlimited conversions.',
    footerDesc: 'The fastest, cleanest and most reliable YouTube MP3 and MP4 audio converter online.',
    navHome: 'Home',
    navConverter: 'Converter',
    navFaq: 'FAQ',
    disclaimer: '<strong>Disclaimer:</strong> This website is not affiliated with YouTube or Google LLC. This tool is intended for personal and non-commercial fair use of public media only.',
    metaTitle: 'YouTube to MP3 Converter - 320kbps High Speed & Free Downloader',
    metaDesc: 'Convert and download YouTube videos and Shorts to 320kbps high-quality MP3 audio and MP4 video online for free.'
  },
  es: {
    heroBadge: 'El Convertidor de YouTube a MP3 Más Rápido',
    heroTitle: 'Convertidor de <span class="gradient-text">YouTube a MP3</span>',
    heroSubtitle: 'Descarga videos de YouTube y Shorts en <strong>calidad de estudio 320kbps</strong> en MP3 o MP4 gratis.',
    paste: 'Pegar',
    convert: 'Convertir',
    popular: 'Popular:',
    installApp: 'Instalar App',
    audioTab: 'Audio (MP3)',
    videoTab: 'Video (MP4)',
    downloadNow: 'Descargar Ahora',
    saveFile: 'Guardar Archivo',
    converting: 'Convirtiendo...',
    completed: '¡Conversión Completada!',
    featuresTitle: '¿Por qué elegir nuestro convertidor?',
    featuresDesc: 'La plataforma líder para convertir música y video en segundos.',
    feat1Title: 'Conversión Ultra Rápida',
    feat1Desc: 'Nuestros servidores procesan audio en alta velocidad sin esperas.',
    feat2Title: 'Audio HD 320kbps',
    feat2Desc: 'Máxima calidad de sonido sin pérdida para tus canciones favoritas.',
    feat3Title: '100% Gratis e Ilimitado',
    feat3Desc: 'Sin registros ni tarjetas de crédito. Descargas ilimitadas.',
    feat4Title: 'Compatible con Móviles y PC',
    feat4Desc: 'Funciona perfecto en iPhone, Android, Windows y Mac.',
    howtoTitle: '¿Cómo descargar MP3 de YouTube? (3 Pasos)',
    step1Title: 'Copia el enlace de YouTube',
    step1Desc: 'Busca el video en YouTube y copia la URL desde compartir.',
    step2Title: 'Pega el enlace y elige calidad',
    step2Desc: 'Pega el link arriba y selecciona MP3 320k o MP4.',
    step3Title: 'Haz clic en Descargar',
    step3Desc: 'Tu archivo se descargará directamente en tu dispositivo.',
    faqTitle: 'Preguntas Frecuentes',
    faqDesc: 'Todo lo que necesitas saber sobre cómo descargar canciones.',
    faq1Q: '¿Es seguro y gratuito?',
    faq1A: 'Sí, 100% seguro, sin virus ni tarifas ocultas.',
    faq2Q: '¿Funciona con Shorts?',
    faq2A: '¡Totalmente! Pega cualquier link de YouTube Shorts.',
    faq3Q: '¿Puedo descargar en iPhone?',
    faq3A: 'Sí, compatible con Safari en iOS 13+ y la app Archivos.',
    faq4Q: '¿Hay límite de descargas?',
    faq4A: 'No hay ningún límite de descarga.',
    faq5Q: '¿Qué formatos soporta?',
    faq5A: 'MP3 en 320k, 256k, 128k y video MP4 en 1080p y 720p.',
    footerDesc: 'El convertidor de YouTube a MP3 más rápido y confiable.',
    navHome: 'Inicio',
    navConverter: 'Convertidor',
    navFaq: 'Preguntas',
    disclaimer: '<strong>Descargo de responsabilidad:</strong> Este sitio no está afiliado a YouTube o Google LLC.',
    metaTitle: 'Convertidor YouTube a MP3 - Descargar Audio 320kbps Gratis',
    metaDesc: 'Convierte videos de YouTube a MP3 en 320kbps de alta calidad gratis y sin programas.'
  },
  de: {
    heroBadge: 'Schnellster YouTube zu MP3 Konverter',
    heroTitle: 'YouTube zu <span class="gradient-text">MP3 Konverter</span>',
    heroSubtitle: 'Lade YouTube Videos und Shorts in <strong>320kbps Studioqualität</strong> kostenlos als MP3 oder MP4 herunter.',
    paste: 'Einfügen',
    convert: 'Konvertieren',
    popular: 'Beliebt:',
    installApp: 'App Installieren',
    audioTab: 'Audio (MP3)',
    videoTab: 'Video (MP4)',
    downloadNow: 'Jetzt Herunterladen',
    saveFile: 'Datei Speichern',
    converting: 'Wird konvertiert...',
    completed: 'Konvertierung abgeschlossen!',
    featuresTitle: 'Warum unser YouTube Konverter?',
    featuresDesc: 'Die vertrauenswürdige Plattform für Musik- und Video-Downloads.',
    feat1Title: 'Ultraschnell',
    feat1Desc: 'Konvertiere Videos in wenigen Sekunden ohne lange Wartezeiten.',
    feat2Title: '320kbps HD Audio',
    feat2Desc: 'Genieße beste Soundqualität mit 320kbps Bitrate.',
    feat3Title: '100% Kostenlos',
    feat3Desc: 'Keine Registrierung, keine Software nötig.',
    feat4Title: 'Für alle Geräte',
    feat4Desc: 'Kompatibel mit iPhone, Android, PC und Mac.',
    howtoTitle: 'Wie funktioniert es? (3 Schritte)',
    step1Title: 'Link kopieren',
    step1Desc: 'Kopiere die YouTube Video-URL aus der App oder dem Browser.',
    step2Title: 'Einfügen & Format wählen',
    step2Desc: 'Füge den Link oben ein und wähle MP3 320k oder MP4.',
    step3Title: 'Herunterladen',
    step3Desc: 'In wenigen Sekunden ist deine Musik auf deinem Gerät gespeichert.',
    faqTitle: 'Häufig gestellte Fragen',
    faqDesc: 'Wissenswertes rund um YouTube Downloads.',
    faq1Q: 'Ist es kostenlos?',
    faq1A: 'Ja, unser Service ist vollkommen kostenlos.',
    faq2Q: 'Unterstützt es YouTube Shorts?',
    faq2A: 'Ja, Shorts werden vollständig unterstützt.',
    faq3Q: 'Funktioniert es auf dem Smartphone?',
    faq3A: 'Ja, direkt über Safari oder Chrome auf jedem Handy.',
    faq4Q: 'Gibt es Download-Limits?',
    faq4A: 'Nein, lade so viele Lieder herunter wie du möchtest.',
    faq5Q: 'Welche Qualität erhalte ich?',
    faq5A: 'Echte 320kbps MP3 Audioqualität mit LAME Kodierung.',
    footerDesc: 'Der schnellste YouTube zu MP3 und MP4 Konverter online.',
    navHome: 'Startseite',
    navConverter: 'Konverter',
    navFaq: 'FAQ',
    disclaimer: '<strong>Haftungsausschluss:</strong> Diese Webseite steht in keiner Verbindung zu YouTube oder Google LLC.',
    metaTitle: 'YouTube zu MP3 Konverter - Kostenlos 320kbps Audio Download',
    metaDesc: 'YouTube Videos und Shorts schnell und kostenlos in 320kbps MP3 Audio umwandeln.'
  }
};

let currentLang = 'tr';

// ==========================================================================
// 3. APPLICATION STATE
// ==========================================================================
const state = {
  videoData: null,
  selectedTab: 'audio', // 'audio' | 'video'
  selectedFormat: 'mp3',
  selectedQuality: '320',
  selectedLabel: '320 kbps (En Yüksek HD Kalite)',
  currentJobId: null,
  pollTimer: null,
  isProcessing: false
};

// ==========================================================================
// 4. DOM ELEMENTS
// ==========================================================================
const videoUrlInput = document.getElementById('videoUrl');
const btnPaste = document.getElementById('btnPaste');
const btnConvert = document.getElementById('btnConvert');
const alertBox = document.getElementById('alertBox');

const resultCard = document.getElementById('resultCard');
const videoThumb = document.getElementById('videoThumb');
const videoDuration = document.getElementById('videoDuration');
const videoTitle = document.getElementById('videoTitle');
const channelText = document.getElementById('channelText');
const viewsText = document.getElementById('viewsText');

const tabAudio = document.getElementById('tabAudio');
const tabVideo = document.getElementById('tabVideo');
const qualityList = document.getElementById('qualityList');

const btnStartDownload = document.getElementById('btnStartDownload');
const btnDownloadText = document.getElementById('btnDownloadText');
const progressContainer = document.getElementById('progressContainer');
const progressStatus = document.getElementById('progressStatus');
const progressPct = document.getElementById('progressPct');
const progressBar = document.getElementById('progressBar');
const btnReadyDownload = document.getElementById('btnReadyDownload');

// Lang elements
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const currentLangFlag = document.getElementById('currentLangFlag');
const currentLangCode = document.getElementById('currentLangCode');

// Sticky ad close
const stickyAdBar = document.getElementById('stickyAdBar');
const btnCloseStickyAd = document.getElementById('btnCloseStickyAd');

// PWA
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
let deferredPrompt = null;

// ==========================================================================
// 5. INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initEventListeners();
  initFaqAccordion();
  initPwa();
  initScrollAd();
});

// ==========================================================================
// 6. EVENT LISTENERS
// ==========================================================================
function initEventListeners() {
  // Convert Button Click
  btnConvert.addEventListener('click', handleFetchVideo);

  // Enter Key on input
  videoUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetchVideo();
    }
  });

  // Paste Button
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          videoUrlInput.value = text.trim();
          handleFetchVideo();
        }
      } else {
        videoUrlInput.focus();
      }
    } catch (err) {
      videoUrlInput.focus();
    }
  });

  // Quick Tags
  document.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const clip = chip.getAttribute('data-clip');
      if (clip) {
        videoUrlInput.value = clip;
        handleFetchVideo();
      } else {
        videoUrlInput.focus();
      }
    });
  });

  // Tabs
  tabAudio.addEventListener('click', () => switchTab('audio'));
  tabVideo.addEventListener('click', () => switchTab('video'));

  // Start Download Button
  btnStartDownload.addEventListener('click', handleStartDownload);

  // Close Sticky Ad
  if (btnCloseStickyAd && stickyAdBar) {
    btnCloseStickyAd.addEventListener('click', () => {
      stickyAdBar.style.display = 'none';
    });
  }
}

// Scroll-tabanlı reklam tetikleyicisi (sayfa %40 kaydırılınca 1 kez tetiklenir)
function initScrollAd() {
  if (!MONETIZATION_CONFIG.enableScrollAd) return;
  let scrollTriggered = false;
  window.addEventListener('scroll', () => {
    if (scrollTriggered) return;
    const scrollPct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollPct >= 40) {
      scrollTriggered = true;
      triggerDirectAd(MONETIZATION_CONFIG.scrollAdUrl);
    }
  }, { passive: true });
}

// ==========================================================================
// 7. FETCH VIDEO METADATA
// ==========================================================================
async function handleFetchVideo() {
  const url = videoUrlInput.value.trim();

  if (!url) {
    showAlert('Lütfen bir YouTube veya Shorts bağlantısı yapıştırın!');
    videoUrlInput.focus();
    return;
  }

  // Basic URL format validation
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    showAlert('Geçerli bir YouTube linki girmelisiniz (örn: https://youtu.be/... veya https://www.youtube.com/watch?v=...)');
    return;
  }

  hideAlert();
  setLoading(true);

  try {
    const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.success) {
      showAlert(data.error || 'Video bilgileri alınamadı.');
      setLoading(false);
      return;
    }

    state.videoData = data.data;
    renderVideoInfo(state.videoData);
    setLoading(false);

    // Smooth scroll down to result
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('Sunucu ile bağlantı kurulamadı. Lütfen internetinizi kontrol edin.');
    setLoading(false);
  }
}

// Render Video Information Card
function renderVideoInfo(video) {
  videoThumb.src = video.thumbnail;
  videoDuration.textContent = video.duration;
  videoTitle.textContent = video.title;
  channelText.textContent = video.channel;
  viewsText.textContent = `${video.views} ${currentLang === 'tr' ? 'Görüntülenme' : 'views'}`;

  // Default to audio MP3 tab
  switchTab('audio');

  // Reset Download Area
  resetDownloadState();

  resultCard.style.display = 'block';
}

// ==========================================================================
// 8. TABS & FORMAT RENDERING
// ==========================================================================
function switchTab(type) {
  state.selectedTab = type;
  if (type === 'audio') {
    tabAudio.classList.add('active');
    tabVideo.classList.remove('active');
    renderQualityOptions(state.videoData.formats.audio, 'audio');
  } else {
    tabVideo.classList.add('active');
    tabAudio.classList.remove('active');
    renderQualityOptions(state.videoData.formats.video, 'video');
  }
}

function renderQualityOptions(options, type) {
  qualityList.innerHTML = '';

  options.forEach((opt, index) => {
    const item = document.createElement('div');
    item.className = `quality-item ${index === 0 ? 'selected' : ''}`;
    
    // Default selection is first item
    if (index === 0) {
      state.selectedFormat = opt.format;
      state.selectedQuality = opt.quality;
      state.selectedLabel = opt.label;
      updateDownloadButtonText();
    }

    const badgeHtml = opt.quality === '320' || opt.quality === '1080' 
      ? `<span class="quality-badge">${currentLang === 'tr' ? 'Önerilen' : 'Best'}</span>` 
      : '';

    const sizeNote = opt.sizeApprox || opt.note || '';

    item.innerHTML = `
      <div class="quality-left">
        <input type="radio" name="qualityRadio" class="quality-radio" ${index === 0 ? 'checked' : ''} />
        <span class="quality-label">${opt.label}</span>
        ${badgeHtml}
      </div>
      <div class="quality-size">${sizeNote}</div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.quality-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      item.querySelector('input[type="radio"]').checked = true;

      state.selectedFormat = opt.format;
      state.selectedQuality = opt.quality;
      state.selectedLabel = opt.label;
      updateDownloadButtonText();
    });

    qualityList.appendChild(item);
  });
}

function updateDownloadButtonText() {
  const t = TRANSLATIONS[currentLang];
  btnDownloadText.textContent = `${t.downloadNow} (${state.selectedFormat.toUpperCase()} ${state.selectedQuality}k)`;
}

// ==========================================================================
// 9. CONVERSION & DOWNLOAD WORKFLOW
// ==========================================================================
async function handleStartDownload() {
  if (!state.videoData || state.isProcessing) return;

  // 1. High Revenue Trigger (Adsterra DirectLink / SmartLink)
  if (MONETIZATION_CONFIG.enableDirectLinkOnDownload) {
    triggerDirectAd(MONETIZATION_CONFIG.directLinkUrl);
  }

  // 2. Start conversion request
  state.isProcessing = true;
  btnStartDownload.style.display = 'none';
  progressContainer.style.display = 'flex';
  btnReadyDownload.style.display = 'none';

  progressBar.style.width = '10%';
  progressPct.textContent = '10%';
  progressStatus.textContent = currentLang === 'tr' ? 'Dönüştürme başlatılıyor...' : 'Starting conversion...';

  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: state.videoData.url,
        format: state.selectedFormat,
        quality: state.selectedQuality,
        title: state.videoData.title
      })
    });

    const data = await res.json();
    if (!data.success) {
      showAlert(data.error || 'Dönüştürme başlatılamadı.');
      resetDownloadState();
      return;
    }

    state.currentJobId = data.jobId;
    startProgressPolling(state.currentJobId);
  } catch (err) {
    console.error('Convert err:', err);
    showAlert('Dönüştürme isteği sırasında bağlantı hatası oluştu.');
    resetDownloadState();
  }
}

// Poll Job Status
function startProgressPolling(jobId) {
  if (state.pollTimer) clearInterval(state.pollTimer);

  state.pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/progress/${jobId}`);
      if (!res.ok) {
        clearInterval(state.pollTimer);
        showAlert('Dönüştürme zaman aşımına uğradı.');
        resetDownloadState();
        return;
      }

      const job = await res.json();
      if (!job.success) {
        clearInterval(state.pollTimer);
        showAlert(job.error || 'İşlem hatası.');
        resetDownloadState();
        return;
      }

      // Update progress UI
      const pct = Math.min(100, Math.max(10, job.progress || 10));
      progressBar.style.width = `${pct}%`;
      progressPct.textContent = `${pct}%`;
      progressStatus.textContent = job.message || 'İşleniyor...';

      if (job.status === 'completed') {
        clearInterval(state.pollTimer);
        progressBar.style.width = '100%';
        progressPct.textContent = '100%';
        progressStatus.textContent = currentLang === 'tr' ? 'Tamamlandı! İndiriliyor...' : 'Done! Downloading...';

        // Reveal ready button & auto trigger
        setTimeout(() => {
          progressContainer.style.display = 'none';
          btnReadyDownload.href = job.downloadUrl;
          btnReadyDownload.setAttribute('download', `${state.videoData.title}.${state.selectedFormat}`);
          btnReadyDownload.style.display = 'flex';

          // Trigger automatic browser download
          const hiddenAnchor = document.createElement('a');
          hiddenAnchor.href = job.downloadUrl;
          hiddenAnchor.setAttribute('download', `${state.videoData.title}.${state.selectedFormat}`);
          document.body.appendChild(hiddenAnchor);
          hiddenAnchor.click();
          document.body.removeChild(hiddenAnchor);

          state.isProcessing = false;
        }, 600);
      } else if (job.status === 'error') {
        clearInterval(state.pollTimer);
        showAlert(job.error || 'Dönüştürme sırasında hata oluştu.');
        resetDownloadState();
      }
    } catch (err) {
      console.warn('Poll status error:', err);
    }
  }, 800);
}

function resetDownloadState() {
  state.isProcessing = false;
  if (state.pollTimer) clearInterval(state.pollTimer);
  btnStartDownload.style.display = 'flex';
  progressContainer.style.display = 'none';
  btnReadyDownload.style.display = 'none';
  progressBar.style.width = '0%';
  progressPct.textContent = '0%';
}

// ==========================================================================
// 10. MULTI-LANGUAGE SYSTEM (i18n)
// ==========================================================================
function initLanguage() {
  // Check URL params first: ?lang=en
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  const savedLang = langParam || localStorage.getItem('yt_lang') || 'tr';

  setLanguage(savedLang);

  // Toggle Dropdown
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    langMenu.classList.remove('show');
  });

  document.querySelectorAll('.lang-item').forEach((item) => {
    item.addEventListener('click', () => {
      const chosenLang = item.getAttribute('data-lang');
      setLanguage(chosenLang);
      langMenu.classList.remove('show');
    });
  });
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'tr';
  currentLang = lang;
  localStorage.setItem('yt_lang', lang);

  // Update Flag & Code
  const flags = { tr: '🇹🇷', en: '🇺🇸', es: '🇪🇸', de: '🇩🇪' };
  currentLangFlag.textContent = flags[lang] || '🌐';
  currentLangCode.textContent = lang.toUpperCase();

  // Active class in dropdown
  document.querySelectorAll('.lang-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-lang') === lang);
  });

  // Apply translations to data-i18n elements
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Update page meta title & description for SEO
  if (t.metaTitle) document.title = t.metaTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && t.metaDesc) metaDesc.setAttribute('content', t.metaDesc);

  // Update placeholder
  if (lang === 'tr') {
    videoUrlInput.placeholder = 'YouTube veya Shorts bağlantısını buraya yapıştırın (örn: https://youtu.be/...)';
  } else if (lang === 'en') {
    videoUrlInput.placeholder = 'Paste YouTube or Shorts URL here (e.g. https://youtu.be/...)';
  } else if (lang === 'es') {
    videoUrlInput.placeholder = 'Pega el enlace de YouTube o Shorts aquí...';
  } else if (lang === 'de') {
    videoUrlInput.placeholder = 'YouTube- oder Shorts-Link hier einfügen...';
  }

  updateDownloadButtonText();
}

// ==========================================================================
// 11. FAQ ACCORDION
// ==========================================================================
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('open'));

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

// ==========================================================================
// 12. PWA (Progressive Web App)
// ==========================================================================
function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.style.display = 'inline-flex';
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          pwaInstallBtn.style.display = 'none';
        }
        deferredPrompt = null;
      }
    });
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      // SW registered or offline
    });
  }
}

// ==========================================================================
// 13. HELPERS
// ==========================================================================
function showAlert(message) {
  alertBox.textContent = message;
  alertBox.className = 'alert-box error';
}

function hideAlert() {
  alertBox.className = 'alert-box';
  alertBox.textContent = '';
}

function setLoading(isLoading) {
  if (isLoading) {
    btnConvert.classList.add('loading');
    btnConvert.disabled = true;
  } else {
    btnConvert.classList.remove('loading');
    btnConvert.disabled = false;
  }
}
