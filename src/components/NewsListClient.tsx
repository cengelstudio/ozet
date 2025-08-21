'use client'

import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import NewsCard from './NewsCard'
import { Bars3Icon, Squares2X2Icon, SquaresPlusIcon } from '@heroicons/react/24/outline'
import moment from 'moment'
import 'moment/locale/tr'

// Moment.js'i Türkçe olarak ayarla
moment.locale('tr')

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

type NewsListClientProps = {
  initialData: {
    news: News[]
    pagination: any
  }
  platformDomain?: string
  isBreakingNews?: boolean
  searchQuery?: string
  layout?: 'masonry' | 'list'
  columns?: number
}

export default function NewsListClient({
  initialData,
  platformDomain,
  isBreakingNews,
  searchQuery,
  layout = 'masonry',
  columns = 2
}: NewsListClientProps) {
  const [news, setNews] = useState<News[]>(initialData.news || [])
  const [page, setPage] = useState(2) // İlk sayfa zaten yüklendi
  const [hasMore, setHasMore] = useState(initialData.pagination?.hasNext || false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<'masonry' | 'list'>(layout)
  const [seenNewsIds, setSeenNewsIds] = useState<Set<number>>(
    new Set(initialData.news?.map(n => n.id) || [])
  )

  // Responsive breakpoint columns hesaplama
  const getBreakpointColumns = (cols: number) => {
    const breakpoints = {
      default: cols,
      1024: cols >= 3 ? 2 : cols, // lg breakpoint
      768: cols >= 2 ? 1 : 1      // md breakpoint
    }
    return breakpoints
  }

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

  // Görünüm seçici
  const ViewSelector = () => (
    <div className="flex items-center justify-end mb-6">
      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => setViewMode('masonry')}
          className={`p-2 rounded-md transition-colors duration-200 ${
            viewMode === 'masonry'
              ? 'bg-red-100 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Masonry görünümü"
        >
          <Squares2X2Icon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-md transition-colors duration-200 ${
            viewMode === 'list'
              ? 'bg-red-100 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Liste görünümü"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )

  // List layout
  if (viewMode === 'list') {
    return (
      <>
        <ViewSelector />
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {news.map((item, index) => (
            <div key={`${item.id}-${index}`}>
              <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors duration-200">
                        {item.title}
                      </a>
                    </h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {item.platform.avatarUrl && (
                          <img
                            src={item.platform.avatarUrl}
                            alt={item.platform.name}
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-700">{item.platform.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{moment(item.publishedAt).fromNow()}</span>
                    </div>
                  </div>
                  {item.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              {index < news.length - 1 && (
                <hr className="border-gray-100" />
              )}
            </div>
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
      <ViewSelector />
      <Masonry
        breakpointCols={getBreakpointColumns(columns)}
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
