import { Suspense } from 'react'
import { Metadata } from 'next'
import PlatformDetail from '../../../components/PlatformDetail'

type Props = {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params

  // Platform verilerini çek (örnek)
  const platformData = {
    name: 'Haber Platformu',
    description: 'Platform açıklaması burada yer alacak...',
    domain: domain
  }

  const title = `${platformData.name}`
  const description = `${platformData.name} platformundan en güncel haberler, son dakika gelişmeleri ve detaylı haber analizleri. Türkiye ve dünyadan güvenilir haber kaynağı.`

  return {
    title: title,
    description: description,
    keywords: [
      platformData.name,
      'haber',
      'güncel haberler',
      'son dakika',
      'Türkiye haberleri',
      platformData.domain,
      'haber platformu',
      'güvenilir haber'
    ],
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      locale: 'tr_TR',
      url: `https://ozet.today/platform/${domain}`,
      siteName: 'ÖZET',
      images: [
        {
          url: 'https://ozet.today/social-profile.png',
          width: 1200,
          height: 630,
          alt: 'ÖZET.today logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['https://ozet.today/social-profile.png'],
    },
    alternates: {
      canonical: `https://ozet.today/platform/${domain}`,
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
}

export default async function PlatformPage({ params }: Props) {
  const { domain } = await params

  return (
    <div className="py-8">
      <Suspense fallback={<div>Platform yükleniyor...</div>}>
        <PlatformDetail domain={domain} />
      </Suspense>
    </div>
  )
}
