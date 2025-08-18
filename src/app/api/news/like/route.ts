import { NextRequest, NextResponse } from "next/server"
import db from "db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newsId } = body

    // Validasyon
    if (!userId || !newsId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve haber ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcı ve haber var mı kontrol et
    const [user, news] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.news.findUnique({ where: { id: newsId } })
    ])

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      )
    }

    // Beğeni zaten var mı kontrol et
    const existingLike = await db.like.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId
        }
      }
    })

    if (existingLike) {
      // Beğeniyi kaldır
      await db.like.delete({
        where: {
          userId_newsId: {
            userId,
            newsId
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Beğeni kaldırıldı',
        data: { liked: false }
      })
    } else {
      // Beğeni ekle
      await db.like.create({
        data: {
          userId,
          newsId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Haber beğenildi',
        data: { liked: true }
      })
    }

  } catch (error) {
    console.error('Beğeni API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Beğeni işlemi yapılırken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const newsId = searchParams.get('newsId')

    if (!userId || !newsId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve haber ID gerekli' },
        { status: 400 }
      )
    }

    // Beğeni durumunu ve beğenen kullanıcıları getir
    const [like, likesWithUsers] = await Promise.all([
      db.like.findUnique({
        where: {
          userId_newsId: {
            userId: parseInt(userId),
            newsId: parseInt(newsId)
          }
        }
      }),
      db.like.findMany({
        where: { newsId: parseInt(newsId) },
        take: 10, // Son 10 beğeniyi getir
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              oauthProvider: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: { 
        liked: !!like,
        recentLikes: likesWithUsers.map(like => ({
          id: like.id,
          createdAt: like.createdAt,
          user: {
            id: like.user.id,
            name: like.user.name,
            username: like.user.username,
            avatarUrl: like.user.avatarUrl,
            oauthProvider: like.user.oauthProvider
          }
        }))
      }
    })

  } catch (error) {
    console.error('Beğeni durumu API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Beğeni durumu kontrol edilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
