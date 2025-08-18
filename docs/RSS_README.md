# RSS Otomatik Haber Çekme Sistemi

Bu sistem, `config/rss_feeds.json` dosyasındaki RSS feed'lerinden otomatik olarak haber çeker ve veritabanına kaydeder.

## Özellikler

- ✅ **10 dakikada bir** otomatik RSS çekme
- ✅ **Platform otomatik oluşturma** (meta tag'lerden)
- ✅ **Duplicate kontrolü** (GUID bazlı)
- ✅ **HTML entity decoding** (Türkçe karakterler)
- ✅ **Image URL normalization** (protocol-relative URL'ler)
- ✅ **Error handling** ve retry mekanizması
- ✅ **Logging** sistemi
- ✅ **Daemon mode** (sürekli çalışma)

## Kullanım

### Manuel Çalıştırma

```bash
# Sadece bir kez RSS çek
npm run rss:fetch

# Veritabanını sıfırla ve RSS çek
npm run rss:reset

# 10 dakikada bir çalıştır (terminal açık kalır)
npm run rss:schedule

# Veritabanını sıfırla, RSS çek ve schedule başlat
npm run rss:start
```

### Daemon Modu (Önerilen)

```bash
# Daemon modunda başlat (arka planda sürekli çalışır)
npm run rss:daemon
```

Daemon modu:
- 🚀 **Sürekli çalışır** (sunucu yeniden başlatılana kadar)
- 📝 **Log dosyası** tutar (`logs/rss-daemon.log`)
- 🔄 **Otomatik restart** (hata durumunda)
- 🧹 **Log temizleme** (100MB'dan büyükse)

## RSS Feed Konfigürasyonu

`config/rss_feeds.json` dosyasında RSS feed'leri tanımlanır:

```json
[
  {
    "url": "https://www.ntv.com.tr/gundem.rss",
    "locale": "TR",
    "type": "general"
  },
  {
    "url": "http://feeds.bbci.co.uk/news/rss.xml",
    "locale": "INT",
    "type": "general"
  }
]
```

### Parametreler

- **url**: RSS feed URL'i
- **locale**: Platform locale'i (`TR` veya `INT`)
- **type**: Haber kategorisi (opsiyonel)

## Platform Otomatik Oluşturma

Sistem, RSS feed'lerinden platform bilgilerini otomatik olarak çıkarır:

1. **Domain extraction**: URL'den domain çıkarılır
2. **Meta tag scraping**: Platform web sitesinden meta bilgiler çekilir
3. **Platform creation**: Veritabanında platform oluşturulur

### Meta Bilgiler

- **Title**: Platform adı
- **Description**: Platform açıklaması
- **og:image**: Platform logosu
- **og:site_name**: Platform adı

## Duplicate Kontrolü

Sistem, aynı haberin tekrar eklenmesini önler:

- **GUID bazlı**: RSS item'ın GUID'si kontrol edilir
- **Link bazlı**: Haber linki kontrol edilir
- **Title bazlı**: Benzer başlıklar kontrol edilir

## Image URL Normalization

Sistem, farklı formatlardaki image URL'lerini normalize eder:

- `//example.com/image.jpg` → `https://example.com/image.jpg`
- `http://example.com/image.jpg` → `https://example.com/image.jpg`
- `/image.jpg` → `https://domain.com/image.jpg`

## Log Dosyaları

- **Daemon log**: `logs/rss-daemon.log`
- **Console output**: Terminal çıktısı
- **Error handling**: Hata durumları loglanır

## Monitoring

### Log Kontrolü

```bash
# Son logları görüntüle
tail -f logs/rss-daemon.log

# Hata loglarını filtrele
grep "ERROR" logs/rss-daemon.log
```

### Veritabanı Kontrolü

```bash
# Son eklenen haberleri kontrol et
npx prisma studio

# Platform sayısını kontrol et
npx prisma studio --port 5556
```

## Troubleshooting

### Yaygın Sorunlar

1. **RSS feed erişilemiyor**
   - Feed URL'ini kontrol et
   - CORS ayarlarını kontrol et
   - Timeout süresini artır

2. **Platform oluşturulamıyor**
   - Domain extraction'ı kontrol et
   - Meta tag scraping'i kontrol et
   - Veritabanı bağlantısını kontrol et

3. **Duplicate haberler**
   - GUID kontrolünü kontrol et
   - Link normalization'ı kontrol et

### Debug Modu

```bash
# Debug logları ile çalıştır
DEBUG=* npm run rss:fetch
```

## Production Deployment

### PM2 ile Daemon

```bash
# PM2 kur
npm install -g pm2

# Daemon'u PM2 ile başlat
pm2 start scripts/rss-daemon.js --name "rss-daemon"

# Otomatik restart
pm2 startup
pm2 save
```

### Systemd Service

```bash
# Service dosyası oluştur
sudo nano /etc/systemd/system/rss-daemon.service

# Service'i etkinleştir
sudo systemctl enable rss-daemon
sudo systemctl start rss-daemon
```

## Performans

- **Çekme sıklığı**: 10 dakika
- **Timeout**: 10 saniye per feed
- **Concurrent**: Tüm feed'ler paralel çekilir
- **Memory**: ~50MB RAM kullanımı
- **CPU**: Minimal kullanım

## Güvenlik

- **User-Agent**: Gerçekçi browser header'ı
- **Rate limiting**: Feed başına 10 saniye timeout
- **Error handling**: Hata durumunda sistem çökmeyi önler
- **Log rotation**: Log dosyaları otomatik temizlenir
