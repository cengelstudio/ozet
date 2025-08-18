import { NextRequest, NextResponse } from "next/server"
import db from "db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'TR'

    // Toplam haber sayısı
    const totalNews = await db.news.count({
      where: { locale }
    })

    // Platform bazında haber sayıları
    const platformStats = await db.news.groupBy({
      by: ['platform'],
      where: { locale },
      _count: {
        platform: true
      },
      orderBy: {
        _count: {
          platform: 'desc'
        }
      }
    })

    // Kategori bazında haber sayıları
    const categoryStats = await db.news.groupBy({
      by: ['category'],
      where: {
        locale,
        category: { not: null }
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    // Bugün eklenen haber sayısı
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayNews = await db.news.count({
      where: {
        locale,
        createdAt: {
          gte: today
        }
      }
    })

    // Son 7 gün eklenen haber sayısı
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const lastWeekNews = await db.news.count({
      where: {
        locale,
        createdAt: {
          gte: lastWeek
        }
      }
    })

    // En son eklenen haber
    const latestNews = await db.news.findFirst({
      where: { locale },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        platform: true,
        createdAt: true
      }
    })

    // Platform sayısı
    const platformCount = await db.news.findMany({
      select: { platform: true },
      distinct: ['platform'],
      where: { locale }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalNews,
        todayNews,
        lastWeekNews,
        platformCount: platformCount.length,
        latestNews,
        platformStats: platformStats.map(stat => ({
          platform: stat.platform,
          count: stat._count.platform
        })),
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category
        }))
      }
    })

  } catch (error) {
    console.error('İstatistik API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'İstatistikler getirilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
