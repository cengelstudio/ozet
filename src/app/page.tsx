import { Suspense } from 'react'
import NewsGrid from './components/NewsGrid'
import OAuthSuccessMessage from './components/OAuthSuccessMessage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ÖZET: Günün Özeti',
  description: 'Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri, ekonomi, siyaset, spor ve teknoloji haberleri. Güvenilir kaynaklardan derlenen tarafsız habercilik.',
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <OAuthSuccessMessage />
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Günün Özeti
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve önemli olayların özeti.
        </p>
      </div>

      <Suspense fallback={<div>Haberler yükleniyor...</div>}>
        <NewsGrid />
      </Suspense>
    </div>
  )
}
