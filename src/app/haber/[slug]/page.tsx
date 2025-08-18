import { Suspense } from 'react'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import NewsDetail from '../../../components/NewsDetail'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  // Slug'dan ID'yi çıkar
  const idMatch = slug.match(/^(\d+)-/)
  if (!idMatch) {
    return {
      title: 'Haber Bulunamadı - ÖZET',
      description: 'Aradığınız haber bulunamadı.',
    }
  }

  const id = parseInt(idMatch[1])

  try {
    // API'den haber detaylarını al
    const incomingHeaders = await headers()
    const host = incomingHeaders.get('x-forwarded-host') || incomingHeaders.get('host') ||
      (process.env.NODE_ENV === 'production'
        ? 'ozet.today'
        : `localhost:${process.env.PORT || 8880}`)
    const protocol = incomingHeaders.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`

    const response = await fetch(`${baseUrl}/api/news/${id}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      throw new Error('Haber bulunamadı')
    }

        const responseData = await response.json()

    if (!responseData.success || !responseData.data?.news) {
      throw new Error('Haber bulunamadı')
    }

    const news = responseData.data.news

    // Platform adını al
    const platformName = news.platform?.name || news.platformDomain || 'Bilinmeyen Platform'

    // Başlık: "Haber başlığı (Platform adı)" (template otomatik olarak "- ÖZET: Günün Özeti" ekleyecek)
    const title = `${news.title} (${platformName})`

    // Açıklama: "Haberin açıklaması(yoksa başlığı), (platform adı) tarafından"
    const description = news.description
      ? `${news.description}, ${platformName} tarafından`
      : `${news.title}, ${platformName} tarafından`

    // Görsel: Haberin görseli varsa onu kullan, yoksa varsayılan
    const imageUrl = news.imageUrl || 'https://ozet.today/social-profile.png'

    return {
      title: title,
      description: description,
      keywords: [
        'haber',
        'güncel haber',
        'son dakika',
        'Türkiye haberleri',
        'güncel gelişmeler'
      ],
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        locale: 'tr_TR',
        url: `https://ozet.today/haber/${slug}`,
        siteName: 'ÖZET',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: 'Haber görseli',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://ozet.today/haber/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    console.error('Metadata oluşturma hatası:', error)

    // Hata durumunda varsayılan metadata
    return {
      title: 'Haber Bulunamadı - ÖZET',
      description: 'Aradığınız haber bulunamadı.',
      openGraph: {
        title: 'Haber Bulunamadı - ÖZET',
        description: 'Aradığınız haber bulunamadı.',
        type: 'article',
        locale: 'tr_TR',
        url: `https://ozet.today/haber/${slug}`,
        siteName: 'ÖZET',
        images: [
          {
            url: 'https://ozet.today/social-profile.png',
            width: 1200,
            height: 630,
            alt: 'Haber görseli',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Haber Bulunamadı - ÖZET',
        description: 'Aradığınız haber bulunamadı.',
        images: ['https://ozet.today/social-profile.png'],
      },
    }
  }
}

export default async function HaberPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="py-8">
      <Suspense fallback={<div>Haber yükleniyor...</div>}>
        <NewsDetail slug={slug} />
      </Suspense>
    </div>
  )
}
