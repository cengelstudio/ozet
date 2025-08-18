import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

// Tarihi normalize et - gelecek tarihleri mevcut güne çevir
function normalizeDate(date: Date | string | null): Date | null {
  if (!date) return null

  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null

  const now = new Date()

  // Eğer tarih gelecekteyse, mevcut güne çevir
  if (d > now) {
    return now
  }

  return d
}

// TR formatında, Europe/Istanbul saat diliminde tarih formatla
function formatDateTR(date: Date | string | null): string | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  const datePart = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d)
  const timePart = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d)
  return `${datePart}, ${timePart}`
}

// URL'yi normalize et (protocol-relative URL'leri düzelt)
function normalizeUrl(url: string | null): string | null {
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

async function getMetaTitle(domain: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`https://${domain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const html = await response.text()

    // Meta title'ı bul
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      return titleMatch[1].trim()
    }

    return null
  } catch (error) {
    console.error(`Meta title alınamadı ${domain}:`, error)
    return null
  }
}

function extractPlatformNameFromTitle(title: string, domain: string): string | null {
  // Domain'den platform adını çıkar
  const domainParts = domain.replace(/\.(com|tr|net)$/, '').split('.')
  const domainName = domainParts[0]

  // Title'da domain adını ara
  const titleLower = title.toLowerCase()
  const domainNameLower = domainName.toLowerCase()

  // Farklı formatları kontrol et
  const patterns = [
    // "Hürriyet - Haber, Son Dakika Haberler" formatı
    new RegExp(`^(${domainNameLower}[^\\s-]+)`, 'i'),
    // "Haber, Son Dakika - Hürriyet" formatı
    new RegExp(`([^\\s-]+${domainNameLower})`, 'i'),
    // "CNN TÜRK - Haberler" formatı
    new RegExp(`^([A-ZÇĞIİÖŞÜ]+\\s+[A-ZÇĞIİÖŞÜ]+)`, 'i'),
    // "Hürriyet Gazetesi" formatı
    new RegExp(`(${domainNameLower}[^\\s-]+\\s+[a-zçğıiöşü]+)`, 'i')
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      const extracted = match[1] || match[0]
      // Sadece harf ve boşluk içeren kısmı al
      const cleanName = extracted.replace(/[^a-zA-ZÇĞIİÖŞÜçğıiöşü\s]/g, '').trim()
      if (cleanName.length > 1) {
        return cleanName
      }
    }
  }

  // Özel durumlar için manuel mapping
  const specialCases: { [key: string]: string } = {
    'hurriyet': 'Hürriyet',
    'cnnturk': 'CNN TÜRK',
    'haberturk': 'Habertürk',
    'sabah': 'Sabah',
    'sozcu': 'Sözcü',
    'milliyet': 'Milliyet',
    'cumhuriyet': 'Cumhuriyet',
    'evrensel': 'Evrensel',
    'birgun': 'BirGün',
    't24': 'T24',
    'diken': 'Diken',
    'gazeteduvar': 'Gazete Duvar',
    'artigercek': 'Artı Gerçek',
    'odatv': 'OdaTV'
  }

  return specialCases[domainNameLower] || null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parametreleri
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const platform = searchParams.get('platform')
    let locale = searchParams.get('locale') || 'TR'

    // Platform belirtilmişse, o platformun locale'ini kullan
    if (platform) {
      const platformInfo = await db.platform.findUnique({
        where: { domain: platform },
        select: { locale: true }
      })
      if (platformInfo) {
        locale = platformInfo.locale
      }
    }
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const random = searchParams.get('random') === 'true'
    const breaking = searchParams.get('breaking') === 'true'
    const after = searchParams.get('after')

    // Sayfalama hesaplamaları
    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {
      locale
    }

    if (platform) {
      where.platformDomain = platform
    }

    if (category) {
      where.category = category
    }

    if (after) {
      const afterDate = new Date(after)
      if (!isNaN(afterDate.getTime())) {
        where.publishedAt = { gte: afterDate }
      }
    }

    // Search ve breaking koşullarını birleştir
    const searchConditions = []

    if (search) {
      // Birden fazla kelime varsa her birini ayrı ayrı ara
      const searchTerms = search.split(' ').filter(term => term.length > 0)

      // Her kelime için tam kelime eşleşmesi ara
      searchTerms.forEach(term => {
        // Kelime sınırlarını kontrol et (boşluk, noktalama, başlangıç, bitiş)
        searchConditions.push(
          { title: { contains: ` ${term} ` } },     // Ortada
          { title: { contains: `${term} ` } },      // Başında
          { title: { contains: ` ${term}` } },      // Sonunda
          { title: { startsWith: `${term} ` } },    // Başlangıç
          { title: { endsWith: ` ${term}` } },      // Bitiş
          { title: { startsWith: term } },          // Tam başlangıç
          { title: { endsWith: term } },            // Tam bitiş
          { title: { equals: term } },              // Tam eşleşme
          { description: { contains: ` ${term} ` } },
          { description: { contains: `${term} ` } },
          { description: { contains: ` ${term}` } },
          { description: { startsWith: `${term} ` } },
          { description: { endsWith: ` ${term}` } },
          { description: { startsWith: term } },
          { description: { endsWith: term } },
          { description: { equals: term } }
        )
      })
    }

    if (breaking) {
      searchConditions.push(
        { title: { contains: 'son dakika' } },
        { title: { contains: 'sondakika' } },
        { title: { contains: 'SON DAKİKA' } },
        { title: { contains: 'SONDAKİKA' } },
        { title: { contains: 'Son Dakika' } },
        { title: { contains: 'Sondakika' } },
        { description: { contains: 'son dakika' } },
        { description: { contains: 'sondakika' } },
        { description: { contains: 'SON DAKİKA' } },
        { description: { contains: 'SONDAKİKA' } },
        { description: { contains: 'Son Dakika' } },
        { description: { contains: 'Sondakika' } }
      )
    }

    if (searchConditions.length > 0) {
      where.OR = searchConditions
    }

    // Haberleri getir
    let news
    let totalCount

    if (random) {
      // Ana sayfa için gelişmiş randomize sistemi
      const allNews = await db.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
          imageUrl: true,
          publishedAt: true,
          platformDomain: true,
          category: true,
          author: true,
          createdAt: true,
          likes: {
            select: {
              id: true
            }
          },
          saves: {
            select: {
              id: true
            }
          },
          comments: {
            select: {
              id: true
            }
          }
        }
      })

      // Haberleri tarihe göre grupla ve normalize et
      const groupedByDate = new Map<string, typeof allNews>()

      allNews.forEach(item => {
        if (item.publishedAt) {
          // Tarihi normalize et
          const normalizedDate = normalizeDate(item.publishedAt)
          const dateKey = normalizedDate ? normalizedDate.toDateString() : 'unknown'

          if (!groupedByDate.has(dateKey)) {
            groupedByDate.set(dateKey, [])
          }
          groupedByDate.get(dateKey)!.push(item)
        }
      })

      // Her tarih grubundaki haberleri karıştır
      const shuffledNews: typeof allNews = []
      const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => {
        if (a === 'unknown') return 1
        if (b === 'unknown') return -1
        return new Date(b).getTime() - new Date(a).getTime()
      })

      sortedDates.forEach(dateKey => {
        const dateNews = groupedByDate.get(dateKey)!
        // Fisher-Yates shuffle algoritması kullan
        const shuffledDateNews = [...dateNews]
        for (let i = shuffledDateNews.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledDateNews[i], shuffledDateNews[j]] = [shuffledDateNews[j], shuffledDateNews[i]]
        }
        shuffledNews.push(...shuffledDateNews)
      })

      news = shuffledNews.slice(0, limit)
      totalCount = allNews.length
    } else {
      // Diğer sayfalar için tarihe göre sıralama
      [news, totalCount] = await Promise.all([
        db.news.findMany({
          where,
          orderBy: { publishedAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            link: true,
            imageUrl: true,
            publishedAt: true,
            platformDomain: true,
            category: true,
            author: true,
            createdAt: true,
            likes: {
              select: {
                id: true
              }
            },
            saves: {
              select: {
                id: true
              }
            },
            comments: {
              select: {
                id: true
              }
            }
          }
        }),
        db.news.count({ where })
      ])
    }

    // Platform bilgilerini getir
    const platforms = await db.platform.findMany({
      where: {
        domain: {
          in: news.map(item => item.platformDomain)
        }
      },
      select: {
        id: true,
        domain: true,
        name: true,
        description: true,
        avatarUrl: true,
        bannerUrl: true,
        websiteUrl: true,
        isVerified: true,
        locale: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Platform bilgilerini haberlere ekle
    const newsWithPlatforms = await Promise.all(news.map(async (item) => {
      const platformInfo = platforms.find(p => p.domain === item.platformDomain)

      // Platform adını belirle
      let platformName = item.platformDomain
      if (platformInfo?.name) {
        platformName = platformInfo.name
      } else {
        // Meta title'dan platform adını çıkar
        try {
          const metaTitle = await getMetaTitle(item.platformDomain)
          if (metaTitle) {
            const extractedName = extractPlatformNameFromTitle(metaTitle, item.platformDomain)
            if (extractedName) {
              platformName = extractedName
            }
          }
        } catch (error) {
          console.error(`Meta title alınamadı ${item.platformDomain}:`, error)
        }
      }

      // Avatar URL'yi kontrol et - null ise RSS logo kullan
      let avatarUrl = platformInfo?.avatarUrl
      if (!avatarUrl) {
        avatarUrl = '/assets/rss-logo.png'
      }

      return {
        ...item,
        publishedAtFormatted: item.publishedAt ? formatDateTR(normalizeDate(item.publishedAt)) : null,
        _count: {
          likes: item.likes.length,
          saves: item.saves.length,
          comments: item.comments.length
        },
        platform: platformInfo ? {
          ...platformInfo,
          name: platformName,
          avatarUrl: avatarUrl
        } : {
          domain: item.platformDomain,
          name: platformName,
          description: `${item.platformDomain} - Haber sitesi`,
          avatarUrl: avatarUrl,
          websiteUrl: `https://${item.platformDomain}`,
          isVerified: true
        }
      }
    }))

    // Platform listesini getir
    const platformList = await db.news.findMany({
      select: { platformDomain: true },
      distinct: ['platformDomain'],
      where: { locale }
    })

    // Kategori listesini getir
    const categories = await db.news.findMany({
      select: { category: true },
      distinct: ['category'],
      where: {
        locale,
        category: { not: null }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        news: newsWithPlatforms,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        filters: {
          platforms: platformList.map(p => p.platformDomain),
          categories: categories.map(c => c.category).filter(Boolean)
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Haber API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Haberler getirilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
