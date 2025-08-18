import { NextRequest, NextResponse } from "next/server"
import db from "db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcıyı getir
    const user = await db.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        birthDate: true,
        createdAt: true,
        username: true,
        emailVerified: true,
        oauthProvider: true,
        oauthId: true,
        lastOAuthSync: true,
        _count: {
          select: {
            likes: true,
            saves: true,
            comments: true,
            follows: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcının son aktivitelerini getir
    const [recentLikes, recentSaves, recentComments, followedPlatforms] = await Promise.all([
      db.like.findMany({
        where: { userId: parseInt(userId) },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          news: {
            select: {
              id: true,
              title: true,
              platform: true,
              publishedAt: true
            }
          }
        }
      }),
      db.save.findMany({
        where: { userId: parseInt(userId) },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          news: {
            select: {
              id: true,
              title: true,
              platform: true,
              publishedAt: true
            }
          }
        }
      }),
      db.comment.findMany({
        where: { userId: parseInt(userId) },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          news: {
            select: {
              id: true,
              title: true,
              platform: true,
              publishedAt: true
            }
          }
        }
      }),
      db.follow.findMany({
        where: { userId: parseInt(userId) },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          platform: {
            select: {
              id: true,
              domain: true,
              name: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        user,
        activities: {
          recentLikes,
          recentSaves,
          recentComments,
          followedPlatforms
        }
      }
    })

  } catch (error) {
    console.error('Kullanıcı profili API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcı profili getirilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, birthDate, avatarUrl } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await db.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcıyı güncelle
    const updatedUser = await db.user.update({
      where: { id: parseInt(userId) },
      data: {
        name: name || existingUser.name,
        birthDate: birthDate ? new Date(birthDate) : existingUser.birthDate,
        avatarUrl: avatarUrl || existingUser.avatarUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        birthDate: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profil güncellendi',
      data: updatedUser
    })

  } catch (error) {
    console.error('Profil güncelleme API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Profil güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, avatarUrl } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, error: 'Avatar URL gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await db.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Sadece avatar URL'yi güncelle
    const updatedUser = await db.user.update({
      where: { id: parseInt(userId) },
      data: {
        avatarUrl: avatarUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        birthDate: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar güncellendi',
      data: updatedUser
    })

  } catch (error) {
    console.error('Avatar güncelleme API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Avatar güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
