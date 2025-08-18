import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { extractMainDomain, fetchPlatformMeta } from '@/utils/platform'

const db = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain parametresi gerekli' },
        { status: 400 }
      )
    }

    const mainDomain = extractMainDomain(domain)

    // Veritabanında platform var mı kontrol et
    let platform = await db.platform.findUnique({
      where: { domain: mainDomain }
    })

    if (!platform) {
      // Meta bilgilerini çek ve platform oluştur
      const meta = await fetchPlatformMeta(mainDomain)

      platform = await db.platform.create({
        data: {
          domain: mainDomain,
          name: meta.title,
          description: meta.description,
          avatarUrl: meta.image,
          websiteUrl: meta.url,
          isVerified: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: platform
    })

  } catch (error: any) {
    console.error('Platform meta API hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Platform meta bilgileri getirilirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain gerekli' },
        { status: 400 }
      )
    }

    const mainDomain = extractMainDomain(domain)

    // Meta bilgilerini çek
    const meta = await fetchPlatformMeta(mainDomain)

    // Platform'u güncelle veya oluştur
    const platform = await db.platform.upsert({
      where: { domain: mainDomain },
      update: {
        name: meta.title,
        description: meta.description,
        avatarUrl: meta.image,
        websiteUrl: meta.url
      },
      create: {
        domain: mainDomain,
        name: meta.title,
        description: meta.description,
        avatarUrl: meta.image,
        websiteUrl: meta.url,
        isVerified: true
      }
    })

    return NextResponse.json({
      success: true,
      data: platform
    })

  } catch (error: any) {
    console.error('Platform meta POST hatası:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Platform meta bilgileri güncellenirken hata oluştu',
        details: error.message
      },
      { status: 500 }
    )
  }
}
