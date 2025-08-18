import { NextRequest, NextResponse } from "next/server"
import db from "db"
import Parser from "rss-parser"
import rssFeeds from "../../../../../config/rss_feeds.json"

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
})

// URL'den domain adını çıkaran fonksiyon
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

// RSS feed'den haberleri çeken fonksiyon
async function fetchNewsFromRSS(rssUrl: string, locale: string) {
  try {
    const feed = await parser.parseURL(rssUrl)
    const platform = extractDomain(rssUrl)

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
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url
      } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
        imageUrl = item.mediaContent.$.url
      } else if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
        imageUrl = item.mediaThumbnail.$.url
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
  } catch (error) {
    console.error(`RSS feed hatası (${rssUrl}):`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    // API key kontrolü (opsiyonel güvenlik)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('key')

    // Basit API key kontrolü (production'da daha güvenli bir yöntem kullanın)
    if (apiKey !== process.env.CRON_API_KEY && process.env.CRON_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
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
            } catch (error) {
              // Duplicate key error - haberi atla
              if (error.code !== 'P2002') {
                console.error('Haber kaydetme hatası:', error)
              }
            }
          }

          totalNewNews += savedCount
                      results.push({
              platform: extractDomain(feed.url),
              url: feed.url,
              newItems: savedCount,
              totalItems: newsItems.length
            })
        } else {
          results.push({
            platform: extractDomain(feed.url),
            url: feed.url,
            newItems: 0,
            totalItems: 0
          })
        }
      } catch (error) {
        console.error(`Feed işleme hatası (${feed.url}):`, error)
        results.push({
          platform: extractDomain(feed.url),
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

  } catch (error) {
    console.error('Cron RSS API hatası:', error)
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

// POST isteği de destekle
export async function POST(request: NextRequest) {
  return GET(request)
}
