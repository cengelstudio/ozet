'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'

type NewsDetailProps = {
  slug: string
}

type News = {
  id: number
  title: string
  description: string | null
  link: string
  imageUrl: string | null
  publishedAt: string
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

export default function NewsDetail({ slug }: NewsDetailProps) {
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Slug'dan ID'yi çıkar (örn: "101-haber-basligi" -> 101)
        const idMatch = slug.match(/^(\d+)-/)
        if (!idMatch) {
          setLoading(false)
          return
        }

        const id = parseInt(idMatch[1])
        if (isNaN(id)) {
          setLoading(false)
          return
        }

        console.log('Fetching news with ID:', id)
        const response = await fetch(`/api/news/${id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('API response:', data)

        if (data?.success) {
          setNews(data.data.news)
        } else {
          throw new Error(data?.error || 'Haber yüklenemedi')
        }
      } catch (error) {
        console.error('Haber yüklenirken hata oluştu:', error)
        setNews(null)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [slug])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="w-full h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-semibold text-gray-900">Haber bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">Aradığınız haber mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          Ana Sayfaya Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {news.imageUrl && (
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={news.imageUrl}
              alt={news.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link href={`/platform/${news.platform.domain}`} className="flex-shrink-0">
              {news.platform.avatarUrl ? (
                <div className="relative h-12 w-12">
                  <Image
                    src={news.platform.avatarUrl}
                    alt={news.platform.name}
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xl">
                    {news.platform.name.charAt(0)}
                  </span>
                </div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/platform/${news.platform.domain}`}
                className="flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {news.platform.name}
                </h2>
                {news.platform.isVerified && (
                  <CheckBadgeIcon className="h-5 w-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
              <p className="text-sm text-gray-500">
                {format(new Date(news.publishedAt), "d MMMM yyyy, HH:mm", { locale: tr })}
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>

          {news.description && (
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {news.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button className="flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200 group">
                <HeartIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{news._count.likes}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200 group">
                <ChatBubbleLeftIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{news._count.comments}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200 group">
                <BookmarkIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{news._count.saves}</span>
              </button>
            </div>

            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors duration-200"
            >
              <span>Haberin Kaynağına Git</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
