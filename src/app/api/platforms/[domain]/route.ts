import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params

    // Veritabanından platform bilgilerini çek
    const platformFromDB = await db.platform.findUnique({
      where: { domain },
      include: {
        news: {
          include: {
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        },
        _count: {
          select: {
            followers: true
          }
        }
      }
    })

    // Platform verilerini hazırla
    // İstatistikleri hesapla
    const totalLikes = platformFromDB?.news?.reduce((sum, news) => sum + (news._count.likes || 0), 0) || 0
    const totalComments = platformFromDB?.news?.reduce((sum, news) => sum + (news._count.comments || 0), 0) || 0
    const totalNews = platformFromDB?.news?.length || 0

    const platformData = {
      id: platformFromDB?.id || 1,
      domain: domain,
      name: decodeHtmlEntities(await getPlatformName(domain, platformFromDB)),
      description: decodeHtmlEntities(platformFromDB?.description || getPlatformDescription(domain)),
      avatarUrl: platformFromDB?.avatarUrl || getPlatformAvatar(domain),
      isVerified: platformFromDB?.isVerified || true,
      websiteUrl: platformFromDB?.websiteUrl || `https://${domain}`,
      followers: platformFromDB?._count?.followers || 0,
      isFollowing: false, // TODO: Kullanıcı giriş sistemi entegre edildiğinde güncellenecek
      stats: {
        news: totalNews,
        likes: totalLikes,
        comments: totalComments
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        platform: platformData
      }
    })
  } catch (error) {
    console.error('Platform API error:', error)
    return NextResponse.json(
      { success: false, error: 'Platform bulunamadı' },
      { status: 404 }
    )
  }
}

function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#252;': 'ü',
    '&#220;': 'Ü',
    '&#231;': 'ç',
    '&#199;': 'Ç',
    '&#246;': 'ö',
    '&#214;': 'Ö',
    '&#305;': 'ı',
    '&#304;': 'İ',
    '&#287;': 'ğ',
    '&#286;': 'Ğ',
    '&#351;': 'ş',
    '&#350;': 'Ş'
  }
  return text.replace(/&[^;]+;/g, match => entities[match] || match)
}

async function getPlatformName(domain: string, platformFromDB?: any): Promise<string> {
  // 1. Önce veritabanından sitename kontrolü
  if (platformFromDB?.name) {
    return platformFromDB.name
  }

  // 2. Meta title'dan platform adını çıkar
  try {
    const metaTitle = await getMetaTitle(domain)
    if (metaTitle) {
      const extractedName = extractPlatformNameFromTitle(metaTitle, domain)
      if (extractedName) {
        return extractedName
      }
    }
  } catch (error) {
    console.error(`Meta title alınamadı ${domain}:`, error)
  }

  // 3. Fallback olarak sabit platform adları
  const platformNames: { [key: string]: string } = {
    'cnnturk.com': 'CNN TÜRK',
    'haberturk.com': 'Habertürk',
    'hurriyet.com.tr': 'Hürriyet',
    'sabah.com.tr': 'Sabah',
    'sozcu.com.tr': 'Sözcü',
    'milliyet.com.tr': 'Milliyet',
    'cumhuriyet.com.tr': 'Cumhuriyet',
    'evrensel.net': 'Evrensel',
    'birgun.net': 'BirGün',
    't24.com.tr': 'T24',
    'diken.com.tr': 'Diken',
    'gazeteduvar.com.tr': 'Gazete Duvar',
    'artigercek.com': 'Artı Gerçek',
    'odatv4.com': 'OdaTV'
  }

  return platformNames[domain] || domain
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

function getPlatformDescription(domain: string): string {
  const descriptions: { [key: string]: string } = {
    'cnnturk.com': 'CNN TÜRK, Türkiye\'nin önde gelen haber kanallarından biri olarak güncel haberler, son dakika gelişmeleri ve detaylı analizler sunmaktadır.',
    'haberturk.com': 'Habertürk, Türkiye\'nin güvenilir haber kaynaklarından biri olarak 7/24 güncel haberler ve canlı yayın hizmeti vermektedir.',
    'hurriyet.com.tr': 'Hürriyet, Türkiye\'nin köklü gazetelerinden biri olarak kapsamlı haberler ve analizler sunmaktadır.',
    'sabah.com.tr': 'Sabah, Türkiye\'nin önde gelen gazetelerinden biri olarak güncel haberler ve detaylı raporlar yayınlamaktadır.',
    'sozcu.com.tr': 'Sözcü, bağımsız habercilik anlayışıyla Türkiye\'nin güncel gelişmelerini takip etmektedir.',
    'milliyet.com.tr': 'Milliyet, Türkiye\'nin köklü gazetelerinden biri olarak kaliteli habercilik hizmeti sunmaktadır.',
    'cumhuriyet.com.tr': 'Cumhuriyet, Türkiye\'nin en eski gazetelerinden biri olarak bağımsız habercilik yapmaktadır.',
    'evrensel.net': 'Evrensel, sol perspektiften Türkiye ve dünya haberlerini sunmaktadır.',
    'birgun.net': 'BirGün, bağımsız habercilik anlayışıyla güncel gelişmeleri takip etmektedir.',
    't24.com.tr': 'T24, dijital habercilik alanında öncü platformlardan biri olarak hizmet vermektedir.',
    'diken.com.tr': 'Diken, bağımsız habercilik anlayışıyla Türkiye\'nin güncel gelişmelerini takip etmektedir.',
    'gazeteduvar.com.tr': 'Gazete Duvar, bağımsız habercilik anlayışıyla güncel haberler sunmaktadır.',
    'artigercek.com': 'Artı Gerçek, alternatif habercilik anlayışıyla Türkiye\'nin güncel gelişmelerini takip etmektedir.',
    'odatv4.com': 'OdaTV, bağımsız habercilik anlayışıyla güncel haberler sunmaktadır.'
  }

  return descriptions[domain] || `${domain} platformundan güncel haberler ve gelişmeler.`
}

function getPlatformAvatar(domain: string): string | null {
  // Platform veritabanından avatar URL'ini al ve normalize et
  // Bu fonksiyon artık kullanılmıyor, meta tag'lerden alınıyor
  return null
}
