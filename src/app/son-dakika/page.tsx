import { Metadata } from 'next'
import NewsList from '../../components/NewsList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Son Dakika Haberleri',
  description: 'Türkiye ve dünyadan en son gelişmeler, son dakika haberleri ve acil durumlar.',
  openGraph: {
    title: 'Son Dakika Haberleri - ÖZET.today',
    description: 'Türkiye ve dünyadan en son gelişmeler, son dakika haberleri ve acil durumlar.',
  },
}

export default function SonDakikaPage() {
  return (
    <div className="py-8 pt-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Son Dakika Haberleri</h1>
        <p className="text-gray-600">Türkiye ve dünyadan en son gelişmeler</p>
      </div>
      <NewsList isBreakingNews={true} columns={3} />
    </div>
  )
}
