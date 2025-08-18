# RSS Haber API

Bu API, `config/rss_feeds.json` dosyasındaki RSS feed'lerden haberleri çekip veritabanına kaydeder ve yönetir.

## API Endpoints

### 1. RSS Feed'lerden Haber Çekme
**GET/POST** `/api/rss`

RSS feed'lerden yeni haberleri çeker ve veritabanına kaydeder.

#### Query Parametreleri:
- `force` (boolean): `true` ise son güncelleme kontrolünü atlar ve zorla günceller

#### Örnek Kullanım:
```bash
# Normal güncelleme (son 5 dakikada güncelleme yapılmışsa atlar)
GET /api/rss

# Zorla güncelleme
GET /api/rss?force=true
```

#### Response:
```json
{
  "success": true,
  "message": "15 yeni haber eklendi",
  "totalNewNews": 15,
  "results": [
    {
      "platform": "haberturk.com",
      "url": "https://www.haberturk.com/rss",
      "newItems": 5,
      "totalItems": 5
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Haberleri Listeleme
**GET** `/api/news`

Veritabanından haberleri getirir.

#### Query Parametreleri:
- `page` (number): Sayfa numarası (varsayılan: 1)
- `limit` (number): Sayfa başına haber sayısı (varsayılan: 20)
- `platform` (string): Platform filtresi (örn: "haberturk.com")
- `locale` (string): Dil filtresi (varsayılan: "TR")
- `category` (string): Kategori filtresi
- `search` (string): Başlık ve açıklamada arama

#### Örnek Kullanım:
```bash
# Tüm haberler
GET /api/news

# Sayfalama
GET /api/news?page=2&limit=10

# Platform filtresi
GET /api/news?platform=haberturk.com

# Arama
GET /api/news?search=ekonomi

# Kategori filtresi
GET /api/news?category=gündem
```

#### Response:
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": 1,
        "title": "Haber Başlığı",
        "description": "Haber açıklaması",
        "link": "https://example.com/haber",
        "imageUrl": "https://example.com/image.jpg",
        "publishedAt": "2024-01-15T10:30:00.000Z",
        "platform": "haberturk.com",
        "category": "gündem",
        "author": "Yazar Adı",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "platforms": ["haberturk.com", "cnnturk.com"],
      "categories": ["gündem", "ekonomi", "spor"]
    }
  }
}
```

### 3. İstatistikler
**GET** `/api/stats`

Haber istatistiklerini getirir.

#### Query Parametreleri:
- `locale` (string): Dil filtresi (varsayılan: "TR")

#### Örnek Kullanım:
```bash
GET /api/stats
GET /api/stats?locale=TR
```

#### Response:
```json
{
  "success": true,
  "data": {
    "totalNews": 1500,
    "todayNews": 45,
    "lastWeekNews": 320,
    "platformCount": 15,
    "latestNews": {
      "title": "En son eklenen haber",
      "platform": "haberturk.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "platformStats": [
      {
        "platform": "haberturk.com",
        "count": 250
      }
    ],
    "categoryStats": [
      {
        "category": "gündem",
        "count": 400
      }
    ]
  }
}
```

## Veritabanı Yapısı

### News Model
```sql
model News {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  title       String
  description String?
  content     String?
  link        String   @unique
  imageUrl    String?
  publishedAt DateTime?
  platform    String   // Domain adı (örn: "haberturk.com")
  locale      String   @default("TR")
  category    String?
  author      String?
  guid        String?  @unique // RSS item guid

  @@index([platform])
  @@index([publishedAt])
  @@index([locale])
}
```

## Özellikler

### 🔄 Otomatik Güncelleme
- API çağrıldığında sadece yeni haberler eklenir
- Duplicate kontrolü link ve guid ile yapılır
- Son 5 dakikada güncelleme yapılmışsa atlar (force=true ile zorlanabilir)

### 🏷️ Platform Ayrımı
- Her RSS feed'in domain adı platform olarak kaydedilir
- `www.` prefix'i kaldırılır
- Örnek: `https://www.haberturk.com/rss` → platform: `haberturk.com`

### 📊 Zengin Metadata
- Haber başlığı, açıklaması, içeriği
- Yayın tarihi, yazar bilgisi
- Resim URL'i (enclosure, media:content, media:thumbnail)
- Kategori bilgisi
- Orijinal link ve guid

### 🔍 Gelişmiş Filtreleme
- Platform bazında filtreleme
- Kategori bazında filtreleme
- Başlık ve açıklamada arama
- Sayfalama desteği

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
```bash
yarn install
```

2. Veritabanını oluşturun:
```bash
npx prisma migrate dev
```

3. Geliştirme sunucusunu başlatın:
```bash
yarn dev
```

4. API'yi test edin:
```bash
node test-rss-api.js
```

## RSS Feed Konfigürasyonu

RSS feed'ler `config/rss_feeds.json` dosyasında tanımlanır:

```json
[
  {
    "url": "https://www.haberturk.com/rss",
    "locale": "TR"
  }
]
```

## Hata Yönetimi

- RSS feed'ler erişilemezse hata loglanır ama diğer feed'ler işlenmeye devam eder
- Duplicate haberler otomatik olarak atlanır
- Geçersiz tarih formatları null olarak kaydedilir
- Eksik alanlar varsayılan değerlerle doldurulur
