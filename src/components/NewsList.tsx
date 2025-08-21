import { Suspense } from 'react'
import NewsListClient from '@/components/NewsListClient'

type NewsListProps = {
  platformDomain?: string
  isBreakingNews?: boolean
  searchQuery?: string
  layout?: 'masonry' | 'list'
  columns?: number // Yeni prop: sütun sayısı
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
async function NewsListServer({ platformDomain, isBreakingNews, searchQuery, layout = 'masonry', columns = 2 }: NewsListProps = {}) {
  console.log('NewsList component called with:', { platformDomain, isBreakingNews, searchQuery, layout, columns })

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
      columns={columns}
    />
  )
}

// Main component that wraps the async component in Suspense
export default function NewsList(props: NewsListProps) {
  return (
    <Suspense fallback={<NewsListSkeleton columns={props.columns} />}>
      <NewsListServer {...props} />
    </Suspense>
  )
}

function NewsListSkeleton({ columns = 2 }: { columns?: number }) {
  // Responsive grid sınıfları
  const getGridClasses = (cols: number) => {
    const baseClass = 'grid gap-6'
    const responsiveClasses = []

    // Desktop için belirtilen sütun sayısı
    if (cols >= 3) {
      responsiveClasses.push('lg:grid-cols-3')
    } else if (cols === 2) {
      responsiveClasses.push('lg:grid-cols-2')
    } else {
      responsiveClasses.push('lg:grid-cols-1')
    }

    // Tablet için 2 sütun (eğer desktop'ta 3'ten fazla ise)
    if (cols >= 3) {
      responsiveClasses.push('md:grid-cols-2')
    } else {
      responsiveClasses.push('md:grid-cols-1')
    }

    // Mobil için 1 sütun
    responsiveClasses.push('grid-cols-1')

    return `${baseClass} ${responsiveClasses.join(' ')}`
  }

  return (
    <div className={getGridClasses(columns)}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}
