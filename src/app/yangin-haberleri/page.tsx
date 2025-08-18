import NewsList from '../../components/NewsList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Metadata export
export const metadata: Metadata = {
  title: 'Yangın Haberleri',
  description: 'Türkiye ve dünyadan en güncel yangın haberleri, orman yangınları ve itfaiye müdahaleleri ile ilgili bilgiler.',
}

export default function YanginHaberleriPage() {
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yangın Haberleri</h1>
        <p className="text-gray-600">Türkiye ve dünyadan en güncel yangın gelişmeleri</p>
      </div>
      <NewsList searchQuery="yangın yangin orman" layout="masonry" />
    </div>
  )
}
