import { Suspense } from 'react'
import { headers } from 'next/headers'
import TrendingNewsClient from '@/components/TrendingNewsClient'

// Server-side initial data fetching
async function getTrendingNews() {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

    // Server-side request headers'dan base URL oluştur
    const incomingHeaders = await headers()
    const host = incomingHeaders.get('x-forwarded-host') || incomingHeaders.get('host') ||
      (process.env.NODE_ENV === 'production'
        ? 'ozet.today'
        : `localhost:${process.env.PORT || 8880}`)
    const protocol = incomingHeaders.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`

    const url = new URL('/api/news', baseUrl)
    url.searchParams.set('after', fourHoursAgo)
    url.searchParams.set('random', 'true')
    url.searchParams.set('limit', '10')

    console.log('Fetching trending news from:', url.toString())

    const response = await fetch(url.toString(), {
      cache: 'no-store', // Cache'i devre dışı bırak
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data?.success) {
      console.log(`Found ${data.data.news.length} trending news`)
      return data.data.news || []
    }
    return []
  } catch (error) {
    console.error('Error fetching trending news:', error)
    return []
  }
}

// Async component for server-side data fetching
async function TrendingNewsServer() {
  const initialNews = await getTrendingNews()

  return (
    <TrendingNewsClient initialNews={initialNews} />
  )
}

// Main component that wraps the async component in Suspense
export default function TrendingNews() {
  return (
    <Suspense fallback={<TrendingNewsSkeleton />}>
      <TrendingNewsServer />
    </Suspense>
  )
}

function TrendingNewsSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Gündem</h2>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
