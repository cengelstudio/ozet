import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        // Son 1000 haberi al
        const news = await prisma.news.findMany({
            select: {
                title: true,
                description: true,
                imageUrl: true
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: 1000
        })

        // Büyük harfle başlayan kelimeleri ve ifadeleri çıkar
        const topics = new Map<string, number>()

        const extractCapitalizedTerms = (text: string) => {
            if (!text) return []

            // Türkçe karakterleri de dahil eden regex
            const regex = /[A-ZÇĞIİÖŞÜ][a-zçğıiöşü]+(?:\s+[A-ZÇĞIİÖŞÜ][a-zçğıiöşü]+)*/g
            const matches = text.match(regex) || []

            return matches.filter(term => {
                // Tek harfli terimleri filtrele
                if (term.length <= 3) return false

                // Yaygın kelimeleri filtrele
                const commonWords = [
                    'Haber', 'Haberler', 'Haberleri', 'Haberin', 'Haberinin',
                    'Gün', 'Günü', 'Günler', 'Günleri',
                    'Yıl', 'Yılı', 'Yıllar', 'Yılları',
                    'Ay', 'Ayı', 'Aylar', 'Ayları',
                    'Saat', 'Saati', 'Saatler', 'Saatleri',
                    'Dakika', 'Dakikası', 'Dakikalar', 'Dakikaları',
                    'Saniye', 'Saniyesi', 'Saniyeler', 'Saniyeleri',
                    'Türkiye', 'Türk', 'Türkçe',
                    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
                    'Cumhurbaşkanı', 'Başbakan', 'Bakan', 'Bakanı',
                    'Milletvekili', 'Vali', 'Kaymakam', 'Belediye',
                    'Futbol', 'Basketbol', 'Voleybol', 'Tenis',
                    'Lig', 'Kupa', 'Şampiyon', 'Şampiyonu',
                    'Takım', 'Oyuncu', 'Teknik', 'Direktör',
                    'Ekonomi', 'Para', 'Dolar', 'Euro', 'TL',
                    'Sağlık', 'Eğitim', 'Kültür', 'Sanat',
                    'Teknoloji', 'Bilim', 'Araştırma', 'Geliştirme'
                ]

                return !commonWords.includes(term)
            })
        }

        // Her haber için büyük harfle başlayan terimleri çıkar
        const topicImages = new Map<string, string[]>()

        news.forEach(item => {
            // Null kontrolü
            if (!item.title && !item.description) return

            const titleTerms = extractCapitalizedTerms(item.title || '')
            const descriptionTerms = extractCapitalizedTerms(item.description || '')

            // Tüm terimleri birleştir
            const allTerms = [...titleTerms, ...descriptionTerms]

            // Her terimi say ve görsel ekle
            allTerms.forEach(term => {
                const cleanTerm = term.trim()
                if (cleanTerm) {
                    topics.set(cleanTerm, (topics.get(cleanTerm) || 0) + 1)

                    // Topic için görsel ekle (eğer haber görseli varsa)
                    if (item.imageUrl) {
                        if (!topicImages.has(cleanTerm)) {
                            topicImages.set(cleanTerm, [])
                        }
                        const images = topicImages.get(cleanTerm)!
                        if (images.length < 3) { // Her topic için max 3 görsel
                            images.push(item.imageUrl)
                        }
                    }
                }
            })
        })

        // Sonuçları sırala (en çok tekrar edenler önce)
        const sortedTopics = Array.from(topics.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([term, count]) => ({
                term,
                count,
                images: topicImages.get(term) || []
            }))

        return NextResponse.json({
            success: true,
            data: {
                topics: sortedTopics,
                totalTopics: sortedTopics.length,
                totalNewsAnalyzed: news.length
            }
        })

    } catch (error) {
        console.error('Topics API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Topics alınırken bir hata oluştu'
            },
            { status: 500 }
        )
    }
}
