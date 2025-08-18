import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parametreleri
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Varsayılan limit'i artırdık
    const search = searchParams.get('search')
    const verified = searchParams.get('verified')

    // Sayfalama hesaplamaları
    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (verified === 'true') {
      where.isVerified = true
    }

    // Platformları getir
    const [platforms, totalCount] = await Promise.all([
      db.platform.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          domain: true,
          name: true,
          description: true,
          avatarUrl: true,
          bannerUrl: true,
          websiteUrl: true,
          isVerified: true,
          locale: true,
          createdAt: true
        }
      }),
      db.platform.count({ where })
    ])

    // Her platform için haber sayısını getir ve region ekle
    const platformsWithNewsCount = await Promise.all(
      platforms.map(async (platform) => {
        const newsCount = await db.news.count({
          where: { platformDomain: platform.domain }
        })

        // Locale'den region belirle
        const region = platform.locale === 'TR' ? 'TR' : 'GLOBAL'

        return {
          ...platform,
          newsCount,
          region
        }
      })
    )

    return NextResponse.json({
      success: true,
      platforms: platformsWithNewsCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Platform API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Platformlar getirilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, name, description, avatarUrl, bannerUrl, websiteUrl } = body

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain gerekli' },
        { status: 400 }
      )
    }

    // Platform'u oluştur
    const platform = await db.platform.create({
      data: {
        domain,
        name: name || domain,
        description: description || `${domain} - Haber sitesi`,
        avatarUrl,
        bannerUrl,
        websiteUrl: websiteUrl || `https://${domain}`,
        isVerified: true
      }
    })

    return NextResponse.json({
      success: true,
      data: platform
    })

  } catch (error) {
    console.error('Platform POST hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Platform oluşturulurken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}


