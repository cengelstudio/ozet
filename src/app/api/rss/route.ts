import { NextRequest, NextResponse } from "next/server"
import Parser from "rss-parser"
import { PrismaClient } from "@prisma/client"
import axios from "axios"
import rssFeeds from "../../../../config/rss_feeds.json"
import { extractMainDomain, fetchPlatformMeta } from '@/utils/platform'

const db = new PrismaClient()

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['author', 'author'],
      ['dc:creator', 'creator'],
    ],
  },
})

// RSS feed'den haberleri çeken fonksiyon
async function fetchNewsFromRSS(rssUrl: string, locale: string) {
  try {
    const feed = await parser.parseURL(rssUrl)
    const platform = extractMainDomain(rssUrl)

    // Platform meta bilgilerini çek ve kaydet/güncelle
    const meta = await fetchPlatformMeta(platform)
    await db.platform.upsert({
      where: { domain: platform },
      update: {
        name: meta.title,
        description: meta.description,
        avatarUrl: meta.image,
        websiteUrl: meta.url
      },
      create: {
        domain: platform,
        name: meta.title,
        description: meta.description,
        avatarUrl: meta.image,
        websiteUrl: meta.url,
        isVerified: true
      }
    })

    const newsItems = []

    for (const item of feed.items) {
      // Haber zaten var mı kontrol et
      const existingNews = await db.news.findFirst({
        where: {
          OR: [
            { link: item.link },
            { guid: item.guid }
          ]
        }
      })

      if (existingNews) {
        continue // Haber zaten var, atla
      }

      // Yayın tarihini parse et
      let publishedAt = null
      if (item.pubDate) {
        const date = new Date(item.pubDate)
        if (!isNaN(date.getTime())) {
          publishedAt = date
        }
      } else if (item.isoDate) {
        const date = new Date(item.isoDate)
        if (!isNaN(date.getTime())) {
          publishedAt = date
        }
      }

      // Resim URL'ini bul
      let imageUrl = null

      // Önce RSS'deki resmi kontrol et
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url
      } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
        imageUrl = item.mediaContent.$.url
      } else if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
        imageUrl = item.mediaThumbnail.$.url
      }

      // Resim bulunamadıysa, haber sayfasından meta tag'lerini kontrol et
      if (!imageUrl && item.link) {
        try {
          const response = await axios.get(item.link, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })

          const html = response.data

          // Resim için meta tag'lerini kontrol et
          const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                           html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
                           html.match(/<meta[^>]*property="og:image:url"[^>]*content="([^"]+)"/i) ||
                           html.match(/<meta[^>]*property="og:image:secure_url"[^>]*content="([^"]+)"/i) ||
                           html.match(/<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/i)

          if (imageMatch) {
            imageUrl = imageMatch[1]
            if (!imageUrl.startsWith('http')) {
              imageUrl = new URL(imageUrl, item.link).href
            }
          }

          // Author için meta tag'lerini kontrol et
          const authorMatch = html.match(/<meta[^>]*property="article:author"[^>]*content="([^"]+)"/i) ||
                            html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i) ||
                            html.match(/<meta[^>]*property="og:article:author"[^>]*content="([^"]+)"/i) ||
                            html.match(/<meta[^>]*itemprop="author"[^>]*content="([^"]+)"/i)

          if (authorMatch) {
            item.creator = authorMatch[1]
          }
        } catch (error: any) {
          console.error(`Haber meta bilgileri çekilemedi (${item.link}):`, error.message)
        }
      }

      // Kategori bilgisini çıkar
      let category = null
      if (item.categories && item.categories.length > 0) {
        category = item.categories[0]
      }

      const newsData = {
        title: item.title || 'Başlık Yok',
        description: item.contentSnippet || item.content || null,
        content: item.content || null,
        link: item.link || '',
        imageUrl,
        publishedAt,
        platform,
        locale,
        category,
        author: item.creator || item.author || null,
        guid: item.guid || null
      }

      newsItems.push(newsData)
    }

    return newsItems
  } catch (error: any) {
    console.error(`RSS feed hatası (${rssUrl}):`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    if (!force) {
      // Son 5 dakikada güncelleme yapılmış mı kontrol et
      const lastUpdate = await db.news.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })

      if (lastUpdate && Date.now() - lastUpdate.createdAt.getTime() < 5 * 60 * 1000) {
        return NextResponse.json({
          message: 'Son güncelleme 5 dakikadan daha yakın. Yeni haber yok.',
          lastUpdate: lastUpdate.createdAt
        })
      }
    }

    let totalNewNews = 0
    const results = []

    // Tüm RSS feed'lerden haberleri çek
    for (const feed of rssFeeds) {
      try {
        const newsItems = await fetchNewsFromRSS(feed.url, feed.locale)

        if (newsItems.length > 0) {
          // Veritabanına kaydet (SQLite için createMany yerine create kullan)
          let savedCount = 0
          for (const newsItem of newsItems) {
            try {
              await db.news.create({
                data: newsItem
              })
              savedCount++
            } catch (error: any) {
              // Duplicate key error - haberi atla
              if (error.code !== 'P2002') {
                console.error('Haber kaydetme hatası:', error)
              }
            }
          }

          totalNewNews += savedCount
          results.push({
            platform: extractMainDomain(feed.url),
            url: feed.url,
            newItems: savedCount,
            totalItems: newsItems.length
          })
        } else {
          results.push({
            platform: extractMainDomain(feed.url),
            url: feed.url,
            newItems: 0,
            totalItems: 0
          })
        }
      } catch (error: any) {
        console.error(`Feed işleme hatası (${feed.url}):`, error)
        results.push({
          platform: extractMainDomain(feed.url),
          url: feed.url,
          error: error.message,
          newItems: 0,
          totalItems: 0
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalNewNews} yeni haber eklendi`,
      totalNewNews,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('RSS API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'RSS feed\'ler işlenirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // POST isteği de GET ile aynı işlevi görsün
  return GET(request)
}
