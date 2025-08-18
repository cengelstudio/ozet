import { Suspense } from 'react'
import PlatformsClient from '@/components/PlatformsClient'

// Server-side initial data fetching
async function getPlatforms(): Promise<Platform[]> {
  try {
    // Server-side request için base URL oluştur
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://ozet.today'
      : process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 8880}`

    const response = await fetch(`${baseUrl}/api/platforms`, {
      next: { revalidate: 300 }, // 5 dakika cache
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch platforms')
    }

    const data = await response.json()
    return data.platforms || []
  } catch (error) {
    console.error('Error fetching platforms:', error)
    return []
  }
}

// Async component for server-side data fetching
async function PlatformsServer() {
  const initialPlatforms = await getPlatforms()

  return (
    <PlatformsClient initialPlatforms={initialPlatforms} />
  )
}

// Main component that wraps the async component in Suspense
export default function PlatformsPage() {
  return (
    <Suspense fallback={<PlatformsSkeleton />}>
      <PlatformsServer />
    </Suspense>
  )
}

function PlatformsSkeleton() {
  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="h-32 bg-gray-200 rounded-t-2xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Platform = {
  id: number
  domain: string
  name: string
  description: string | null
  avatarUrl: string | null
  isVerified: boolean
  locale: 'TR' | 'INT'
  region: 'TR' | 'GLOBAL'
}
