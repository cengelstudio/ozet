import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params

    // TODO: Kullanıcı kimlik doğrulaması
    const userId = 1 // Geçici olarak sabit kullanıcı ID

    // Platform'u bul
    const platform = await db.platform.findUnique({
      where: { domain }
    })

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcının zaten takip edip etmediğini kontrol et
    const existingFollow = await db.follow.findUnique({
      where: {
        userId_platformId: {
          userId,
          platformId: platform.id
        }
      }
    })

    if (existingFollow) {
      // Takibi kaldır
      await db.follow.delete({
        where: {
          userId_platformId: {
            userId,
            platformId: platform.id
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: false,
          message: 'Platform takipten çıkarıldı'
        }
      })
    } else {
      // Takip et
      await db.follow.create({
        data: {
          userId,
          platformId: platform.id
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: true,
          message: 'Platform takip edildi'
        }
      })
    }

  } catch (error) {
    console.error('Platform follow API error:', error)
    return NextResponse.json(
      { success: false, error: 'İşlem başarısız' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params

    // TODO: Kullanıcı kimlik doğrulaması
    const userId = 1 // Geçici olarak sabit kullanıcı ID

    // Platform'u bul
    const platform = await db.platform.findUnique({
      where: { domain }
    })

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcının takip durumunu kontrol et
    const isFollowing = await db.follow.findUnique({
      where: {
        userId_platformId: {
          userId,
          platformId: platform.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: !!isFollowing
      }
    })

  } catch (error) {
    console.error('Platform follow status API error:', error)
    return NextResponse.json(
      { success: false, error: 'İşlem başarısız' },
      { status: 500 }
    )
  }
}
