const { PrismaClient } = require('@prisma/client')
const Parser = require('rss-parser')
const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const iconv = require('iconv-lite')
const chardet = require('chardet')

const db = new PrismaClient()
  const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
})

// RSS feeds konfigürasyonu
const rssFeedsPath = path.join(__dirname, '../config/rss_feeds.json')
const rssFeeds = JSON.parse(fs.readFileSync(rssFeedsPath, 'utf8'))

// HTML entities'leri decode etme fonksiyonu (yalnızca güvenli entity ve numeric kodlar)
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text || ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (m, dec) => {
      try { return String.fromCharCode(parseInt(dec, 10)) } catch { return m }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
      try { return String.fromCharCode(parseInt(hex, 16)) } catch { return m }
    })
}

// Content-Type başlığından charset çek
function getCharsetFromContentType(contentType) {
  if (!contentType) return null
  const match = /charset=([^;]+)/i.exec(contentType)
  if (match && match[1]) {
    return match[1].trim().replace(/"/g, '').toLowerCase()
  }
  return null
}

// URL'den içeriği getirip doğru charset ile decode et
async function fetchAndDecode(url, options = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs || 15000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)'
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const contentType = resp.headers.get('content-type') || ''
    const arrayBuf = await resp.arrayBuffer()
    const buf = Buffer.from(arrayBuf)
    let charset = getCharsetFromContentType(contentType)
    if (!charset) {
      // chardet ile tahmin
      charset = chardet.detect(buf) || 'utf-8'
    }
    // iconv-lite bazı isimleri farklı bekleyebilir
    if (/^(utf8|utf-8)$/i.test(charset)) charset = 'utf-8'
    let text
    try {
      text = iconv.decode(buf, charset)
    } catch (e) {
      // son çare UTF-8
      text = iconv.decode(buf, 'utf-8')
    }
    return { text, contentType, charset }
  } catch (e) {
    clearTimeout(timeoutId)
    throw e
  }
}

// Platform domain mapping - sadece ana domain'ler
const platformMapping = {
  'haberturk.com': 'haberturk.com',
  'cnnturk.com': 'cnnturk.com',
  'hurriyet.com.tr': 'hurriyet.com.tr',
  'sabah.com.tr': 'sabah.com.tr',
  'sozcu.com.tr': 'sozcu.com.tr',
  'cumhuriyet.com.tr': 'cumhuriyet.com.tr',
  't24.com.tr': 't24.com.tr',
  'ahaber.com.tr': 'ahaber.com.tr',
  'haberglobal.com.tr': 'haberglobal.com.tr',
  'trthaber.com': 'trthaber.com',
  'bianet.org': 'bianet.org',
  'bbci.co.uk': 'bbci.co.uk',
  'dw.com': 'dw.com',
  'aa.com.tr': 'aa.com.tr',
  'ntv.com.tr': 'ntv.com.tr',
  'birgun.net': 'birgun.net',
  'karar.com': 'karar.com',
  'yenisafak.com': 'yenisafak.com',
  'milliyet.com.tr': 'milliyet.com.tr',
  'internethaber.com': 'internethaber.com',
  'memurlar.net': 'memurlar.net',
  'theguardian.com': 'theguardian.com',
  'reuters.com': 'reuters.com',
  'aljazeera.com': 'aljazeera.com',
  'npr.org': 'npr.org',
  'sky.com': 'sky.com',
  'euronews.com': 'euronews.com',
  'france24.com': 'france24.com',
  'globalnews.ca': 'globalnews.ca',
  'nbcnews.com': 'nbcnews.com',
  'cbsnews.com': 'cbsnews.com',
  'time.com': 'time.com',
  'foxnews.com': 'foxnews.com',
  'abcnews.go.com': 'abcnews.go.com',
  'politico.com': 'politico.com'
}

// URL'den domain çıkarma - subdomain'leri kaldır
function extractDomain(url) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')

    // Platform mapping'den bul
    for (const [key, value] of Object.entries(platformMapping)) {
      if (hostname.includes(key)) {
        return value
      }
    }

    // Subdomain'leri kaldır, sadece ana domain'i al
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      // Özel durumlar için kontrol
      if (hostname === 'abcnews.go.com') return 'abcnews.go.com'
      if (hostname === 'bbci.co.uk') return 'bbci.co.uk'

      // .org.tr, .com.tr, .net.tr gibi Türk domain'leri için özel kontrol
      if (hostname.endsWith('.org.tr') || hostname.endsWith('.com.tr') || hostname.endsWith('.net.tr')) {
        // Örnek: haber.sol.org.tr -> sol.org.tr
        if (parts.length >= 3) {
          return parts.slice(-3).join('.')
        }
        return hostname
      }

      // .co.uk, .com.au, .co.za, .co.in, .co.jp gibi özel domain'ler için kontrol
      const specialDomains = ['co.uk', 'com.au', 'co.za', 'co.in', 'co.jp']
      const lastTwo = parts.slice(-2).join('.')

      if (specialDomains.includes(lastTwo)) {
        // 3 parça varsa son 3'ünü al
        if (parts.length >= 3) {
          return parts.slice(-3).join('.')
        }
        return hostname
      }

      // Normal durumlar için son 2 parçayı al
      return parts.slice(-2).join('.')
    }

    return hostname
  } catch (error) {
    console.error('URL parse hatası:', error)
    return null
  }
}

// URL'yi normalize et (protocol-relative URL'leri düzelt)
function normalizeUrl(url) {
  if (!url) return null

  // Protocol-relative URL'leri düzelt
  if (url.startsWith('//')) {
    return `https:${url}`
  }

  // Relative URL'leri düzelt
  if (url.startsWith('/')) {
    return `https://${url}`
  }

  // HTTP URL'lerini HTTPS'e çevir
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }

  return url
}

// RSS feed'den platform domain'i belirleme
function getPlatformFromFeed(feedUrl) {
  const domain = extractDomain(feedUrl)
  if (!domain) return null

  // Platform mapping'den bul
  for (const [key, value] of Object.entries(platformMapping)) {
    if (domain.includes(key)) {
      return value
    }
  }

  return domain
}

// Platform meta bilgilerini çekme
async function getPlatformMetaInfo(domain) {
  try {
    const { text: html } = await fetchAndDecode(`https://${domain}`, { timeoutMs: 15000 })

    // Meta tag'leri çıkar
    const metaInfo = {
      title: null,
      description: null,
      image: null,
      sitename: null
    }

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      metaInfo.title = decodeHtmlEntities(titleMatch[1].trim())
    }

    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (descMatch) {
      metaInfo.description = decodeHtmlEntities(descMatch[1].trim())
    }

    // og:description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (ogDescMatch && !metaInfo.description) {
      metaInfo.description = decodeHtmlEntities(ogDescMatch[1].trim())
    }

    // og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (ogImageMatch) {
      metaInfo.image = normalizeUrl(ogImageMatch[1].trim())
    }

    // twitter:image
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (twitterImageMatch && !metaInfo.image) {
      metaInfo.image = normalizeUrl(twitterImageMatch[1].trim())
    }

    // application-name (sitename)
    const appNameMatch = html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (appNameMatch) {
      metaInfo.sitename = decodeHtmlEntities(appNameMatch[1].trim())
    }

    // og:site_name
    const ogSiteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (ogSiteNameMatch && !metaInfo.sitename) {
      metaInfo.sitename = decodeHtmlEntities(ogSiteNameMatch[1].trim())
    }

    return metaInfo
  } catch (error) {
    console.error(`Meta bilgileri alınamadı ${domain}:`, error)
    return null
  }
}

// Platform adını belirleme (sitename > title > domain)
function determinePlatformName(metaInfo, domain) {
  // 1. Öncelik: Sitename
  if (metaInfo.sitename) {
    return metaInfo.sitename
  }

  // 2. Öncelik: Title'dan temizleme
  if (metaInfo.title) {
    // Title'dan gereksiz kısımları temizle
    let cleanTitle = metaInfo.title
      .replace(/\s*[-|]\s*.*$/, '') // "-" veya "|" sonrasını kaldır
      .replace(/\s*–\s*.*$/, '') // "–" sonrasını kaldır
      .replace(/\s*—\s*.*$/, '') // "—" sonrasını kaldır
      .replace(/\s*:\s*.*$/, '') // ":" sonrasını kaldır
      .trim()

    // Çok uzunsa kısalt
    if (cleanTitle.length > 50) {
      cleanTitle = cleanTitle.substring(0, 50).trim()
    }

    return cleanTitle
  }

  // 3. Fallback: Domain'den username çıkar
  const domainParts = domain.replace(/\.(com|tr|net|org|uk)$/, '').split('.')
  return domainParts[0]
}

// Platform bilgilerini güncelleme/oluşturma
async function upsertPlatform(domain, locale = 'TR') {
  try {
    // Mevcut platform'u kontrol et
    let platform = await db.platform.findUnique({
      where: { domain }
    })

    if (!platform) {
      // Meta bilgilerini çek
      const metaInfo = await getPlatformMetaInfo(domain)

      // Meta bilgisi yoksa veya açıklama yoksa platform'u oluşturma
      if (!metaInfo || !metaInfo.description) {
        console.log(`❌ Platform meta bilgisi/description eksik: ${domain} - Platform ve haberler kaydedilmeyecek`)
        return null
      }

      let platformName = domain
      let platformDescription = `${domain} - Haber sitesi`
      let platformImage = null

      try {
        const metaInfo = await getPlatformMetaInfo(domain)
        if (metaInfo) {
          // Platform adını belirle
          platformName = determinePlatformName(metaInfo, domain)

          // Açıklama
          if (metaInfo.description) {
            platformDescription = metaInfo.description
          }

          // Logo/Resim
          if (metaInfo.image) {
            platformImage = metaInfo.image
          }
        }
      } catch (error) {
        console.error(`Platform meta bilgileri alınamadı ${domain}:`, error)
      }

      // Yeni platform oluştur
      try {
        platform = await db.platform.create({
          data: {
            domain,
            name: platformName,
            description: platformDescription,
            avatarUrl: platformImage,
            websiteUrl: `https://${domain}`,
            isVerified: true,
            locale: locale
          }
        })
      } catch (error) {
        if (error.code === 'P2002') {
          // Platform zaten mevcut, mevcut platform'u al
          platform = await db.platform.findUnique({
            where: { domain }
          })
        } else {
          throw error
        }
      }

      console.log(`Yeni platform oluşturuldu: ${domain} -> ${platformName} (${locale})`)
    }

    return platform
  } catch (error) {
    console.error(`Platform oluşturma hatası ${domain}:`, error)
    return null
  }
}

// RSS feed'den haberleri çekme
async function fetchRSSFeed(feedUrl, locale = 'TR') {
  try {
    console.log(`RSS feed çekiliyor: ${feedUrl}`)

    // RSS içeriğini manuel getir ve doğru charset ile çöz
    const { text: xmlText } = await fetchAndDecode(feedUrl, { timeoutMs: 20000 })
    // Bazı RSS'lerde kaçırılmış & karakterleri ve BOM olabilir; temizle
    const sanitizedXml = xmlText
      .replace(/\uFEFF/g, '')
      .replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9]+;)/g, '&amp;')

    const feed = await parser.parseString(sanitizedXml)
    const platform = getPlatformFromFeed(feedUrl)

    if (!platform) {
      console.error(`Platform belirlenemedi: ${feedUrl}`)
      return []
    }

    // Platform'u güncelle/oluştur
    const platformRecord = await upsertPlatform(platform, locale)

    if (!platformRecord) {
      console.error(`❌ Platform oluşturulamadı veya meta bilgisi eksik: ${platform} - Haberler kaydedilmeyecek`)
      return []
    }

    const news = []

    for (const item of feed.items) {
      try {
        // GUID oluştur
        const guid = item.guid || item.id || item.link

        if (!guid) {
          console.warn('GUID bulunamadı, atlanıyor:', item.title)
          continue
        }

        // Tarih kontrolü ve düzeltme
        let publishedAt = new Date()
        if (item.pubDate) {
          try {
            const parsedDate = new Date(item.pubDate)
            if (!isNaN(parsedDate.getTime())) {
              publishedAt = parsedDate
            }
          } catch (error) {
            console.warn(`Geçersiz tarih formatı: ${item.pubDate}`)
          }
        }

        // Haber görselini belirle
        let imageUrl = null

        // 1. Enclosure'dan resim
        if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
          imageUrl = normalizeUrl(item.enclosure.url)
        }

        // 2. Media content'dan resim
        if (!imageUrl && item['media:content']) {
          const mediaContent = Array.isArray(item['media:content'])
            ? item['media:content'][0]
            : item['media:content']

          if (mediaContent?.url && mediaContent?.type?.startsWith('image/')) {
            imageUrl = normalizeUrl(mediaContent.url)
          }
        }

        // 3. Media thumbnail'dan resim
        if (!imageUrl && item['media:thumbnail']) {
          const mediaThumb = Array.isArray(item['media:thumbnail'])
            ? item['media:thumbnail'][0]
            : item['media:thumbnail']

          if (mediaThumb?.url) {
            imageUrl = normalizeUrl(mediaThumb.url)
          }
        }

        // 4. Content içinden resim URL'i çıkar
        if (!imageUrl && item.content) {
          const imgMatch = item.content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
          if (imgMatch) {
            imageUrl = normalizeUrl(imgMatch[1])
          }
        }

        // 5. Description içinden resim URL'i çıkar
        if (!imageUrl && item.contentSnippet) {
          const imgMatch = item.contentSnippet.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
          if (imgMatch) {
            imageUrl = normalizeUrl(imgMatch[1])
          }
        }

        // Link kontrolü
        if (!item.link) {
          console.warn('Link bulunamadı, atlanıyor:', item.title)
          continue
        }

        // Kategori bilgisini düzelt
        let category = null
        if (item.categories && item.categories.length > 0) {
          const firstCategory = item.categories[0]
          if (typeof firstCategory === 'string') {
            category = firstCategory
          } else if (firstCategory && typeof firstCategory === 'object' && firstCategory._) {
            category = firstCategory._
          }
        }

        // Haber zaten var mı kontrol et (link bazlı)
        const existingNews = await db.news.findUnique({
          where: { link: item.link }
        })

        if (existingNews) {
          console.log('Haber zaten mevcut, atlanıyor:', item.title)
          continue
        }

        // Title'ı string'e çevir
        let title = 'Başlık yok'
        if (item.title) {
          if (typeof item.title === 'string') {
            title = decodeHtmlEntities(item.title)
          } else if (typeof item.title === 'object' && item.title._) {
            title = decodeHtmlEntities(item.title._)
          } else if (typeof item.title === 'object' && item.title.a && item.title.a[0] && item.title.a[0]._) {
            title = decodeHtmlEntities(item.title.a[0]._)
          }
        }

        // Description'ı string'e çevir
        let description = null
        if (item.contentSnippet || item.summary) {
          const descSource = item.contentSnippet || item.summary
          if (typeof descSource === 'string') {
            description = decodeHtmlEntities(descSource)
          } else if (typeof descSource === 'object' && descSource._) {
            description = decodeHtmlEntities(descSource._)
          } else if (typeof descSource === 'object' && descSource.a && descSource.a[0] && descSource.a[0]._) {
            description = decodeHtmlEntities(descSource.a[0]._)
          }
        }

        // Content'ı string'e çevir
        let content = null
        if (item.content) {
          if (typeof item.content === 'string') {
            content = decodeHtmlEntities(item.content)
          } else if (typeof item.content === 'object' && item.content._) {
            content = decodeHtmlEntities(item.content._)
          } else if (typeof item.content === 'object' && item.content.a && item.content.a[0] && item.content.a[0]._) {
            content = decodeHtmlEntities(item.content.a[0]._)
          }
        }

        // Author'ı string'e çevir
        let author = null
        if (item.creator || item.author) {
          const authorSource = item.creator || item.author
          if (typeof authorSource === 'string') {
            author = decodeHtmlEntities(authorSource)
          } else if (typeof authorSource === 'object' && authorSource._) {
            author = decodeHtmlEntities(authorSource._)
          } else if (typeof authorSource === 'object' && authorSource.a && authorSource.a[0] && authorSource.a[0]._) {
            author = decodeHtmlEntities(authorSource.a[0]._)
          }
        }

        // Yeni haber oluştur
        const newsData = {
          title: title,
          description: description,
          content: content,
          link: item.link,
          imageUrl,
          publishedAt,
          platformDomain: platform,
          locale,
          category,
          author: author,
          guid
        }

        const createdNews = await db.news.create({
          data: newsData
        })

        news.push(createdNews)
        console.log(`Yeni haber eklendi: ${createdNews.title}`)

      } catch (error) {
        console.error(`Haber ekleme hatası:`, error)
      }
    }

    console.log(`${feedUrl} için ${news.length} yeni haber eklendi`)
    return news

  } catch (error) {
    console.error(`RSS feed hatası ${feedUrl}:`, error)
    return []
  }
}

// Tüm RSS feed'leri çekme (sınırlı eşzamanlılık)
async function fetchAllRSSFeeds() {
  console.log('RSS feed\'leri çekiliyor...', new Date().toISOString())

  const startTime = Date.now()
  const allNewNews = []
  const feedResults = []

  const CONCURRENCY = 10
  let index = 0
  const results = []

  async function runNext() {
    if (index >= rssFeeds.length) return null
    const feed = rssFeeds[index++]
    try {
      const result = await fetchRSSFeed(feed.url, feed.locale)
      feedResults.push({ url: feed.url, locale: feed.locale, success: true, newsCount: result.length, news: result })
      allNewNews.push(...result)
      return { status: 'fulfilled', value: result }
    } catch (error) {
      feedResults.push({ url: feed.url, locale: feed.locale, success: false, error: error.message, newsCount: 0, news: [] })
      return { status: 'rejected', reason: error }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, rssFeeds.length) }, async () => {
    while (true) {
      const r = await runNext()
      if (!r) break
      results.push(r)
    }
  })
  await Promise.all(workers)

  let totalNewNews = 0
  let successCount = 0
  let errorCount = 0

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      totalNewNews += result.value.length
      successCount++
    } else {
      errorCount++
      console.error(`Feed hatası ${rssFeeds[index].url}:`, result.reason)
    }
  })

  const endTime = Date.now()
  const duration = endTime - startTime

  // İstatistik dosyası oluştur
  const stats = {
    timestamp: new Date().toISOString(),
    unixTimestamp: Math.floor(Date.now() / 1000),
    duration: {
      start: new Date(startTime).toISOString(),
      end: new Date(endTime).toISOString(),
      milliseconds: duration,
      seconds: Math.round(duration / 1000)
    },
    summary: {
      totalFeeds: rssFeeds.length,
      successfulFeeds: successCount,
      failedFeeds: errorCount,
      totalNewNews: totalNewNews,
      successRate: Math.round((successCount / rssFeeds.length) * 100)
    },
    newNews: allNewNews.map(news => ({
      id: news.id,
      title: news.title,
      link: news.link,
      platform: news.platformDomain,
      publishedAt: news.publishedAt,
      guid: news.guid
    })),
    feedResults: feedResults
  }

  // Stats dizinini oluştur
  const statsDir = path.join(__dirname, '../logs/daemon')
  if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir, { recursive: true })
  }

  // Stats dosyasını yaz
  const statsFile = path.join(statsDir, `${stats.unixTimestamp}-stats.json`)
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2))

  console.log(`RSS çekme tamamlandı: ${totalNewNews} yeni haber, ${successCount} başarılı, ${errorCount} hatalı`)
  console.log(`İstatistik dosyası: ${statsFile}`)

  return totalNewNews
}

// Veritabanını sıfırlama
async function resetDatabase() {
  try {
    console.log('Veritabanı sıfırlanıyor...')

    // Tüm tabloları temizle (sırayla)
    await db.like.deleteMany()
    await db.save.deleteMany()
    await db.comment.deleteMany()
    await db.news.deleteMany()
    await db.platform.deleteMany()

    console.log('Veritabanı başarıyla sıfırlandı')
  } catch (error) {
    console.error('Veritabanı sıfırlama hatası:', error)
  }
}

// Ana fonksiyon
async function main() {
  try {
    // Argüman kontrolü
    const args = process.argv.slice(2)

    if (args.includes('--reset')) {
      await resetDatabase()
    }

    if (args.includes('--fetch')) {
      await fetchAllRSSFeeds()
    }

    if (args.includes('--schedule')) {
      console.log('RSS otomasyonu başlatılıyor (10 dakikada bir)...')

      // İlk çalıştırma
      await fetchAllRSSFeeds()

      // 10 dakikada bir çalıştır
      cron.schedule('*/10 * * * *', async () => {
        await fetchAllRSSFeeds()
      })
    }

  } catch (error) {
    console.error('Ana fonksiyon hatası:', error)
  } finally {
    await db.$disconnect()
  }
}

// Script çalıştırma
if (require.main === module) {
  main()
}

module.exports = {
  fetchAllRSSFeeds,
  resetDatabase,
  fetchRSSFeed
}
