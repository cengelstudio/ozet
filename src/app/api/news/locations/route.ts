import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import districtsData from '../../../../../config/districts.json'

const prisma = new PrismaClient()

export async function GET() {
    try {
        // Son 1000 TR haberini al
        const news = await prisma.news.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                content: true,
                publishedAt: true,
                platformDomain: true,
                platform: {
                    select: {
                        name: true,
                        avatarUrl: true,
                        domain: true
                    }
                }
            },
            where: {
                locale: 'TR'
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: 300
        })

        // İlçe/şehir isimlerini hazırla
        const locationNames = new Set<string>()
        districtsData.forEach(district => {
            locationNames.add(district.ilce_adi)
            locationNames.add(district.sehir_adi)
        })

        // Her haber için geçen lokasyonları bul
        const locationNews = new Map<string, any[]>()

        news.forEach(item => {
            if (!item.title && !item.description && !item.content) return

            const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase()
            const foundLocations = new Set<string>()

            // Her lokasyon ismini kontrol et
            locationNames.forEach(locationName => {
                // Kelime sınırlarını kontrol eden regex - Türkçe karakter desteği
                // Hem büyük hem küçük harfli Türkçe karakterler için destek
                const escapedLocation = locationName.toLowerCase()
                    .replace(/[çğıöşü]/g, (match) => {
                        const turkishMap: { [key: string]: string } = {
                            'ç': '[çcÇC]', 'ğ': '[ğgĞG]', 'ı': '[ıiIİ]', 'ö': '[öoÖO]', 'ş': '[şsŞS]', 'ü': '[üuÜU]'
                        }
                        return turkishMap[match] || match
                    })

                const regex = new RegExp(`\\b${escapedLocation}\\b|\\b${escapedLocation}'[a-zçğıöşüA-ZÇĞIİÖŞÜ]*\\b`, 'gi')
                if (regex.test(text)) {
                    foundLocations.add(locationName)
                }
            })

            // Bulunan lokasyonlar için haberi ekle
            foundLocations.forEach(location => {
                if (!locationNews.has(location)) {
                    locationNews.set(location, [])
                }

                const newsItem = {
                    id: item.id,
                    title: item.title,
                    description: item.description ?
                        (item.description.length > 150 ?
                            item.description.substring(0, 150) + '...' :
                            item.description) : null,
                    publishedAt: item.publishedAt,
                    platform: {
                        name: item.platform.name,
                        avatarUrl: item.platform.avatarUrl,
                        domain: item.platform.domain
                    }
                }

                locationNews.get(location)!.push(newsItem)
            })
        })

        // Sonuçları düzenle ve koordinat bilgilerini ekle
        const result = Array.from(locationNews.entries())
            .map(([location, news]) => {
                // Districts.json'dan koordinat bilgilerini al
                const districtData = districtsData.find(district =>
                    district.ilce_adi === location || district.sehir_adi === location
                )

                return {
                    location,
                    newsCount: news.length,
                    news: news.slice(0, 10), // Her lokasyon için maksimum 10 haber
                    lat: districtData?.lat || null,
                    lon: districtData?.lon || null,
                    displayName: districtData?.display_name || null
                }
            })
            .filter(item => item.newsCount > 0 && item.lat && item.lon) // Sadece haber içeren ve koordinatı olan lokasyonlar
            .sort((a, b) => b.newsCount - a.newsCount) // Haber sayısına göre sırala

        return NextResponse.json({
            success: true,
            data: {
                locations: result,
                totalLocations: result.length,
                totalNewsAnalyzed: news.length
            }
        })

    } catch (error) {
        console.error('Locations API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Lokasyonlar alınırken bir hata oluştu'
            },
            { status: 500 }
        )
    }
}
