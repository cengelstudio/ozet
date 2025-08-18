import NewsList from '../../components/NewsList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Metadata export
export const metadata: Metadata = {
  title: 'Deprem Haberleri',
  description: 'Türkiye ve dünyadan en güncel deprem haberleri, AFAD açıklamaları ve deprem güvenliği ile ilgili bilgiler.',
}

export default function DepremHaberleriPage() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deprem Haberleri</h1>
        <p className="text-gray-600">Türkiye ve dünyadan en güncel deprem gelişmeleri</p>
      </div>
      <NewsList searchQuery="deprem afad" layout="masonry" />
    </div>
  )
}
