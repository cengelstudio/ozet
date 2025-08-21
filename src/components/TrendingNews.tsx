'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type TrendingNews = {
  id: number
  title: string
  platform: {
    domain: string
    name: string
    avatarUrl: string | null
  }
}

export default function TrendingNews() {
  const [trendingNews, setTrendingNews] = useState<TrendingNews[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingNews = async () => {
      try {
        const response = await fetch('/api/news?limit=10&trending=true')
        const data = await response.json()

        if (data?.success) {
          setTrendingNews(data.data.news.slice(0, 8)) // En fazla 8 haber
        }
      } catch (error) {
        console.error('Trending news fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingNews()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gündem</h2>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Gündem</h2>
      <div className="space-y-4">
        {trendingNews.map((item, index) => (
          <Link
            key={item.id}
            href={`/haber/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
            className="block group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-2 mt-2">
                  {item.platform.avatarUrl ? (
                    <Image
                      src={item.platform.avatarUrl}
                      alt={item.platform.name}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                  )}
                  <span className="text-xs text-gray-500">{item.platform.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
