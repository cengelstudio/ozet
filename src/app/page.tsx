import { Metadata } from 'next'
import NewsList from '@/components/NewsList'
import TrendingNews from '@/components/TrendingNews'
import HomePageClient from '@/components/HomePageClient'

export const metadata: Metadata = {
  title: 'Ana Sayfa - ÖZET.today',
  description: 'Türkiye\'nin haber merkezi. Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun.',
  openGraph: {
    title: 'Ana Sayfa - ÖZET.today',
    description: 'Türkiye\'nin haber merkezi. Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun.',
  },
}

export default function HomePage() {
  return (
    <div className="py-8 pt-16">
      {/* Client Component - Auth durumuna göre render */}
      <HomePageClient />

      {/* Server Components - Metadata destekli */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - News Feed */}
        <div className="lg:col-span-3">
          <NewsList columns={2} />
        </div>

        {/* Right Column - Trending News */}
        <div className="lg:col-span-1">
          <TrendingNews />
        </div>
      </div>
    </div>
  )
}
