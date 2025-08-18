import { NextRequest, NextResponse } from "next/server"
import db from "db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: 'Parent yorum ID gerekli' },
        { status: 400 }
      )
    }

    // Sayfalama hesaplamaları
    const skip = (page - 1) * limit

    // Parent yorum var mı kontrol et
    const parentComment = await db.comment.findUnique({
      where: { id: parseInt(parentId) }
    })

    if (!parentComment) {
      return NextResponse.json(
        { success: false, error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    // Yanıtları getir
    const [replies, totalCount] = await Promise.all([
      db.comment.findMany({
        where: {
          parentId: parseInt(parentId)
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      }),
      db.comment.count({
        where: {
          parentId: parseInt(parentId)
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        replies,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Yanıt listesi API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Yanıtlar getirilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
