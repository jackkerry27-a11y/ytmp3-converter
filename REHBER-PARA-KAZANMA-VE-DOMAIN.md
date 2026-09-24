# 🚀 YouTube MP3 Converter Pro - Para Kazanma & Domain Rehberi

Bu rehber, kurduğumuz sitenin **nasıl yayına alınacağını, .com alan adının nasıl bağlanacağını, reklamların nasıl eklenip para kazanılacağını ve Google'da zirveye nasıl çıkılacağını** adım adım anlatır.

---

## 📌 İçindekiler
1. [Projenin Çalıştırılması](#1-projenin-çalıştırılması)
2. [En Ucuz & Güvenilir .com Alan Adı Alma](#2-en-ucuz--güvenilir-com-alan-adı-alma)
3. [Siteyi 7/24 Ücretsiz Canlıya Alma (Hosting / Vps)](#3-siteyi-724-ücretsiz-canlıya-alma-hosting--vps)
4. [Reklam Ağlarına Kayıt Olma & Para Kazanma (Adsterra / Monetag)](#4-reklam-ağlarına-kayıt-olma--para-kazanma)
5. [Google'da Zirveye Çıkma (Search Console & SEO)](#5-googleda-zirveye-çıkma-search-console--seo)

---

## 1. Projenin Çalıştırılması

Siteniz şu anda bilgisayarınızda hazır ve test edilmiştir. İstediğiniz zaman terminalden şu komutla başlatabilirsiniz:

```bash
# Proje klasöründe:
node server.js
```
Tarayıcınızdan `http://localhost:3000` adresine giderek siteyi görebilirsiniz.

---

## 2. En Ucuz & Güvenilir .com Alan Adı Alma

Dünyada hiçbir firma tamamen ücretsiz `.com` vermez çünkü Verisign'a toptan tescil ücreti ödenir. Ancak en ucuz şekilde sahip olmanın yolları:

### A. En Uygun Fiyatlı Kayıtçılar (~9$ - 10$ / Yıl)
* **Porkbun.com:** Gizlilik koruması (WHOIS Privacy) ve SSL ömür boyu ücretsizdir. Yıllık ~9.5$ civarındadır.
* **Cloudflare Registrar:** Kar marjı koymadan toptan fiyata `.com` verir (~9.7$).
* **Namecheap:** İlk alımlarda sık sık kupon kodlarıyla 6-8$ indirim sunar.

### B. Alan Adı Seçerken Dikkat Edilecekler (SEO İçin)
Arama motorlarında hızla yükselmek için alan adınızın içinde anahtar kelime geçmesi büyük avantaj sağlar:
* `ytmp3pro.com`
* `hizliytmp3.com`
* `yt320k.com`
* `mp3indirici.com`
* `tubemp3hub.com`

---

## 3. Siteyi 7/24 Ücretsiz Canlıya Alma (Hosting / VPS)

YouTube indirme motorumuz (`yt-dlp` ve `ffmpeg`), sunucu tarafında çalıştığı için standart PHP hostingler yerine **Node.js destekleyen bir sunucu** gerektirir.

### Seçenek 1: Hetzner / DigitalOcean / Vultr VPS (Aylık ~4-5$) — **En Sağlamı**
* Ubuntu sunucuya tek tıkla NodeJS kurup projeyi yükleyin:
  ```bash
  sudo apt update && sudo apt install -y nodejs npm ffmpeg python3
  sudo npm install -g pm2
  git clone <senin-proje-depon>
  cd para-kazanma
  npm install
  pm2 start server.js --name "yt-converter"
  pm2 save
  pm2 startup
  ```
* Alan adınızın DNS ayarlarında `A` kaydına VPS IP adresinizi yazın.

### Seçenek 2: Render.com veya Railway.app (Ücretsiz / Düşük Maliyet)
* GitHub reponuzu bağlayıp `npm start` ile deploy edebilirsiniz.

---

## 4. Reklam Ağlarına Kayıt Olma & Para Kazanma

> [!IMPORTANT]
> Google AdSense telif nedeniyle YouTube indirme sitelerine onay vermez. Bu sektördeki tüm dev sitelerin kullandığı reklam ağları şunlardır:

### 1. Adsterra (Önerilen - 5 Dakikada Onay)
1. [Adsterra.com](https://adsterra.com)'a gidin ve **Publisher (Yayıncı)** olarak kaydolun.
2. Web sitenizi ekleyin (`Websites` -> `Add Website`). Onay genellikle 5-10 dakika içinde gelir.
3. Alacağınız en çok kazandıran iki reklam formatı:
   * **728x90 & 300x250 Banner Reklamlar:** Aldığınız script kodunu `public/index.html` içindeki şu etiketlerin içine yapıştırın:
     - `id="adTopSlot"` (Üst Banner)
     - `id="adFeedSlot"` (Format İçi Reklam)
     - `id="adMidSlot"` (Orta Banner)
   * **Direct Link (SmartLink - En Çok Para Kazandıran):**
     - Adsterra panelinden bir "Direct Link" oluşturun.
     - `public/js/app.js` dosyasının en üstündeki ayarı şu şekilde güncelleyin:
       ```javascript
       const MONETIZATION_CONFIG = {
         enableDirectLinkOnDownload: true, // Açmak için true yapın
         directLinkUrl: 'https://adsterra-direct-linkiniz-buraya',
         countdownSeconds: 0
       };
       ```
     - Kullanıcı "İndir" butonuna bastığında dosya inerken arka planda sponsor sayfası açılır ve her tıklamadan para kazanırsınız.

### 2. Monetag (Eski PropellerAds)
* Push bildirimleri ve In-Page Push reklamlarında çok yüksek CPM oranları verir.

### Gelirleri Çekme:
* Kazandığınız parayı haftalık veya aylık olarak **Banka Havalesi, USDT (Kripto), WebMoney veya PayPal** ile doğrudan hesabınıza çekebilirsiniz.

---

## 5. Google'da Zirveye Çıkma (Search Console & SEO)

Projenize Google'ın en sevdiği tüm teknik optimizasyonları ekledik:

### Adım 1: Google Search Console'a Ekleyin
1. [Google Search Console](https://search.google.com/search-console)'a gidin.
2. Domaininizi ekleyin ve DNS TXT kaydı ile doğrulayın.
3. Sol menüden **Site Haritaları (Sitemaps)** sekmesine tıklayın ve şunu yazıp gönderin:
   ```text
   sitemap.xml
   ```
   *Google botları sitenizdeki tüm sayfaları ve dilleri anında dizine eklemeye başlayacaktır.*

### Adım 2: Zirveye Çıkaran İçerik & Anahtar Kelime Taktikleri
* Sitenin alt kısmına hazır olarak eklediğimiz **FAQ (SSS)** ve **How-To (Nasıl Yapılır)** bölümleri, Schema.org ile işaretlenmiştir.
* Arama motorunda yıldızlı puanlama (`★★★★★ 4.9`) ve soru-cevap zengin snippet'leri çıkacaktır.
* Kullanıcılar telefonlarından girdiklerinde navbar'daki **"Uygulamayı Yükle" (PWA)** butonuyla siteyi telefonlarına uygulama gibi ekleyebilirler. Bu sayede her müzik indireceklerinde tekrar Google'da aramak yerine doğrudan uygulamanıza gireceklerdir.
