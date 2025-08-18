import { Suspense } from 'react'
import NewsListClient from '@/components/NewsListClient'

type NewsListProps = {
  platformDomain?: string
  isBreakingNews?: boolean
  searchQuery?: string
  layout?: 'masonry' | 'grid'
}

// Server-side initial data fetching
async function getInitialNews(platformDomain?: string, isBreakingNews?: boolean, searchQuery?: string) {
  try {
    // Server-side request için base URL oluştur
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://ozet.today'
      : process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 8880}`

    const url = new URL('/api/news', baseUrl)
    if (platformDomain) {
      url.searchParams.set('platform', platformDomain)
    }
    if (isBreakingNews) {
      url.searchParams.set('breaking', 'true')
    }
    if (searchQuery) {
      url.searchParams.set('search', searchQuery)
    }

    // Ana sayfa için rastgele, diğer sayfalar için normal sıralama
    const isHomePage = !platformDomain && !isBreakingNews && !searchQuery
    if (isHomePage) {
      url.searchParams.set('random', 'true')
    }

    url.searchParams.set('page', '1')
    url.searchParams.set('limit', '20')

    console.log('Fetching news from:', url.toString())

    const response = await fetch(url.toString(), {
      cache: 'no-store', // Cache'i devre dışı bırak
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data?.success) {
      console.log(`Found ${data.data.news.length} news for platform: ${platformDomain || 'all'}`)
      return data.data
    }
    return { news: [], pagination: null }
  } catch (error) {
    console.error('Error fetching initial news:', error)
    return { news: [], pagination: null }
  }
}

// Async component for server-side data fetching
async function NewsListServer({ platformDomain, isBreakingNews, searchQuery, layout = 'masonry' }: NewsListProps = {}) {
  console.log('NewsList component called with:', { platformDomain, isBreakingNews, searchQuery, layout })

  const initialData = await getInitialNews(platformDomain, isBreakingNews, searchQuery)

  console.log('Initial data received:', {
    newsCount: initialData.news?.length || 0,
    hasPagination: !!initialData.pagination,
    platformDomain
  })

  return (
    <NewsListClient
      initialData={initialData}
      platformDomain={platformDomain}
      isBreakingNews={isBreakingNews}
      searchQuery={searchQuery}
      layout={layout}
    />
  )
}

// Main component that wraps the async component in Suspense
export default function NewsList(props: NewsListProps) {
  return (
    <Suspense fallback={<NewsListSkeleton />}>
      <NewsListServer {...props} />
    </Suspense>
  )
}

function NewsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}
