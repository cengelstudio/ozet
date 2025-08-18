import { Suspense } from 'react'
import NewsList from '../../../components/NewsList'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    sorgu: string
  }>
}

// Metadata export
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const decodedQuery = decodeURIComponent(resolvedParams.sorgu)

  return {
    title: `"${decodedQuery}" için arama sonuçları`,
    description: `"${decodedQuery}" ile ilgili en güncel haberler, son dakika gelişmeleri ve detaylı analizler.`,
  }
}

export default async function AramaPage({ params }: Props) {
  const resolvedParams = await params
  const decodedQuery = decodeURIComponent(resolvedParams.sorgu)

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          "{decodedQuery}" için arama sonuçları
        </h1>
        <p className="text-gray-600">
          Arama teriminizle ilgili en güncel haberler
        </p>
      </div>
      <Suspense fallback={<div>Haberler yükleniyor...</div>}>
        <NewsList searchQuery={decodedQuery} layout="masonry" />
      </Suspense>
    </div>
  )
}
