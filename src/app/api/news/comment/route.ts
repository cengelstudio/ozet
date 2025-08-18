import { NextRequest, NextResponse } from "next/server"
import db from "db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newsId, content, parentId } = body

    // Validasyon
    if (!userId || !newsId || !content) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID, haber ID ve yorum içeriği gerekli' },
        { status: 400 }
      )
    }

    if (content.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Yorum en az 3 karakter olmalıdır' },
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

    // Parent yorum var mı kontrol et (eğer parentId verilmişse)
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId }
      })
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: 'Yanıtlanan yorum bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Yorumu oluştur
    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId,
        newsId,
        parentId: parentId || null
      },
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

    return NextResponse.json({
      success: true,
      message: 'Yorum eklendi',
      data: {
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            username: comment.user.username,
            avatarUrl: comment.user.avatarUrl,
            oauthProvider: comment.user.oauthProvider
          }
        }
      }
    })

  } catch (error) {
    console.error('Yorum API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Yorum eklenirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')

    if (!newsId) {
      return NextResponse.json(
        { success: false, error: 'Haber ID gerekli' },
        { status: 400 }
      )
    }

    // Haber var mı kontrol et
    const news = await db.news.findUnique({
      where: { id: parseInt(newsId) }
    })

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      )
    }

    // Yorumları getir (nested yapıda)
    const comments = await db.comment.findMany({
      where: { 
        newsId: parseInt(newsId),
        parentId: null // Sadece ana yorumları getir
      },
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
        },
        // Alt yorumları da getir
        _count: {
          select: {
            // Alt yorum sayısını hesapla
            _count: {
              where: { parentId: { not: null } }
            }
          }
        }
      }
    })

    // Her ana yorum için alt yorumları getir
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await db.comment.findMany({
          where: { parentId: comment.id },
          orderBy: { createdAt: 'asc' },
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

        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            username: comment.user.username,
            avatarUrl: comment.user.avatarUrl,
            oauthProvider: comment.user.oauthProvider
          },
          replies: replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: {
              id: reply.user.id,
              name: reply.user.name,
              username: reply.user.username,
              avatarUrl: reply.user.avatarUrl,
              oauthProvider: reply.user.oauthProvider
            }
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { comments: commentsWithReplies }
    })

  } catch (error) {
    console.error('Yorum listesi API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Yorumlar getirilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
