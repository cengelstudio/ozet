'use client'

import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import NewsCard from './NewsCard'

type News = {
  id: number
  title: string
  description: string | null
  link: string
  imageUrl: string | null
  publishedAt: string
  publishedAtFormatted?: string | null
  platform: {
    domain: string
    name: string
    description: string
    avatarUrl: string | null
    isVerified: boolean
  }
  _count: {
    likes: number
    saves: number
    comments: number
  }
}

const breakpointColumns = {
  default: 2,
  1024: 2,
  768: 1
}

type NewsListClientProps = {
  initialData: {
    news: News[]
    pagination: any
  }
  platformDomain?: string
  isBreakingNews?: boolean
  searchQuery?: string
  layout?: 'masonry' | 'grid'
}

export default function NewsListClient({
  initialData,
  platformDomain,
  isBreakingNews,
  searchQuery,
  layout = 'masonry'
}: NewsListClientProps) {
  const [news, setNews] = useState<News[]>(initialData.news || [])
  const [page, setPage] = useState(2) // İlk sayfa zaten yüklendi
  const [hasMore, setHasMore] = useState(initialData.pagination?.hasNext || false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [seenNewsIds, setSeenNewsIds] = useState<Set<number>>(
    new Set(initialData.news?.map(n => n.id) || [])
  )

  // Sonsuz kaydırma için scroll event listener
  useEffect(() => {
    let isThrottled = false

    const handleScroll = () => {
      if (loadingMore || !hasMore || isThrottled) return

      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Sayfanın sonuna yaklaştığında yeni haberler yükle
      if (scrollTop + windowHeight >= documentHeight - 1000) {
        isThrottled = true
        setLoadingMore(true)
        setPage(prev => {
          const nextPage = prev + 1
          fetchMoreNews(nextPage)
          return nextPage
        })
        
        // 1 saniye throttle
        setTimeout(() => {
          isThrottled = false
        }, 1000)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, hasMore, platformDomain, isBreakingNews, searchQuery])

  const fetchMoreNews = async (pageNum: number) => {
    try {
      const url = new URL('/api/news', window.location.origin)
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

      url.searchParams.set('page', pageNum.toString())
      url.searchParams.set('limit', '20')

      const response = await fetch(url, {
        cache: 'no-store' // Cache'i devre dışı bırak
      })
      const data = await response.json()

      if (data?.success) {
        const list = data?.data?.news || []

        // Görülmemiş haberleri filtrele
        const newNews = list.filter((item: News) => !seenNewsIds.has(item.id))

        if (newNews.length === 0) {
          // Yeni haber yoksa hasMore'u false yap
          setHasMore(false)
          return
        }

        setNews(prev => {
          // Mevcut haberlerle birleştirirken de duplicate kontrolü yap
          const existingIds = new Set(prev.map(n => n.id))
          const uniqueNewNews = newNews.filter((item: News) => !existingIds.has(item.id))
          return [...prev, ...uniqueNewNews]
        })

        // Görülen haber ID'lerini kaydet
        setSeenNewsIds(prev => new Set([...Array.from(prev), ...newNews.map((item: News) => item.id)]))

        setHasMore(data?.data?.pagination?.hasNext || false)
      }
    } catch (error) {
      console.error('Haberler yüklenirken hata oluştu:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          {searchQuery ? `"${searchQuery}" için sonuç bulunamadı` : 'Haber bulunamadı'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery
            ? 'Arama teriminizle ilgili haber bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.'
            : 'Henüz hiç haber eklenmemiş veya filtrelere uygun haber yok.'
          }
        </p>
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard key={`${item.id}-${index}`} {...item} />
          ))}
        </div>

        {/* Yükleme göstergesi */}
        {loadingMore && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              <span>Daha fazla haber yükleniyor...</span>
            </div>
          </div>
        )}

        {/* Daha fazla haber yok */}
        {!hasMore && news.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500">Tüm haberler gösterildi</p>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-6 w-auto"
        columnClassName="pl-6 bg-transparent"
      >
        {news.map((item, index) => (
          <NewsCard key={`${item.id}-${index}`} {...item} />
        ))}
      </Masonry>

      {/* Yükleme göstergesi */}
      {loadingMore && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span>Daha fazla haber yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Daha fazla haber yok */}
      {!hasMore && news.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tüm haberler gösterildi</p>
        </div>
      )}
    </>
  )
}
