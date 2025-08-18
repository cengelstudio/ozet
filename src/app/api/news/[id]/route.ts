import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json({ error: 'Geçersiz haber ID' }, { status: 400 })
    }

    const news = await db.news.findUnique({
      where: { id: newsId },
      include: {
        platform: {
          select: {
            name: true,
            domain: true
          }
        },
        likes: {
          select: { id: true }
        },
        saves: {
          select: { id: true }
        },
        comments: {
          select: { id: true }
        }
      }
    })

    if (!news) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 })
    }

    // Tarih formatlaması
    const publishedAtFormatted = news.publishedAt ? new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(news.publishedAt)) : null

    const response = {
      success: true,
      data: {
        news: {
          ...news,
          publishedAtFormatted,
          _count: {
            likes: news.likes.length,
            saves: news.saves.length,
            comments: news.comments.length
          }
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Haber detayı getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
