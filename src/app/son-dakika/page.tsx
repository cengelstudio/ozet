import NewsList from '../../components/NewsList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Metadata export
export const metadata: Metadata = {
  title: 'Son Dakika',
  description: 'Türkiye ve dünyadan en son gelişmeler, son dakika haberleri ve acil durumlar.',
}

export default function SonDakikaPage() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Son Dakika Haberleri</h1>
        <p className="text-gray-600">Türkiye ve dünyadan en son gelişmeler</p>
      </div>
      <NewsList isBreakingNews={true} layout="masonry" />
    </div>
  )
}
