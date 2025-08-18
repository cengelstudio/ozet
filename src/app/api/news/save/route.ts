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

    // Kaydetme zaten var mı kontrol et
    const existingSave = await db.save.findUnique({
      where: {
        userId_newsId: {
          userId,
          newsId
        }
      }
    })

    if (existingSave) {
      // Kaydetmeyi kaldır
      await db.save.delete({
        where: {
          userId_newsId: {
            userId,
            newsId
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Haber kayıtlardan kaldırıldı',
        data: { saved: false }
      })
    } else {
      // Kaydetme ekle
      await db.save.create({
        data: {
          userId,
          newsId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Haber kaydedildi',
        data: { saved: true }
      })
    }

  } catch (error) {
    console.error('Kaydetme API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Kaydetme işlemi yapılırken hata oluştu',
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

    // Kaydetme durumunu kontrol et
    const save = await db.save.findUnique({
      where: {
        userId_newsId: {
          userId: parseInt(userId),
          newsId: parseInt(newsId)
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { saved: !!save }
    })

  } catch (error) {
    console.error('Kaydetme durumu API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Kaydetme durumu kontrol edilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
