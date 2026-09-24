# ─────────────────────────────────────────────────────────────────────────────
# YouTube MP3 Converter Pro — Production Docker Image
# Node 20 LTS + ffmpeg + yt-dlp (pip) + yt-dlp-ejs (n-challenge solver)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-setuptools \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp + yt-dlp-ejs (n-challenge JS solver) pip ile kur
# pip'in --break-system-packages flag'i Debian 12+ için gerekli
RUN pip3 install --break-system-packages "yt-dlp[default]"

# yt-dlp'nin Node.js'i bulabilmesi için PATH'e ekle
ENV YT_DLP_JS_RUNTIMES=node
ENV NODE_PATH=/usr/local/bin
ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /app

# Önce package.json, sonra bağımlılıklar (Docker layer cache için)
COPY package*.json ./
RUN npm install --omit=dev

# Tüm proje dosyaları
COPY . .

# downloads klasörünün var olduğundan emin ol
RUN mkdir -p downloads

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
