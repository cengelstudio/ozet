import { Metadata } from 'next'
import HaritaClient from '@/components/HaritaClient'

export const metadata: Metadata = {
  title: 'Haber Haritası - Türkiye Lokasyonları | Özet.Today',
  description: 'Türkiye genelinde hangi şehir ve ilçelerde haberler var? İnteraktif harita ile lokasyon bazlı haberleri keşfedin.',
  keywords: 'haber haritası, türkiye haberleri, lokasyon bazlı haberler, şehir haberleri, ilçe haberleri',
  openGraph: {
    title: 'Haber Haritası - Türkiye Lokasyonları',
    description: 'Türkiye genelinde hangi şehir ve ilçelerde haberler var? İnteraktif harita ile lokasyon bazlı haberleri keşfedin.',
    type: 'website',
  },
}

export default function HaritaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Haber Haritası
          </h1>
          <p className="text-gray-600 text-lg">
            Türkiye genelinde hangi şehir ve ilçelerde haberler var? İnteraktif harita ile lokasyon bazlı haberleri keşfedin.
          </p>
        </div>

        <HaritaClient />
      </div>
    </div>
  )
}

