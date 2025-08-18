'use client'

import { useState, useEffect, useCallback } from 'react'
import ColorThief from 'colorthief'
import Image from 'next/image'
import Link from 'next/link'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import NewsList from './NewsList'

type PlatformDetailProps = {
  domain: string
}

type Platform = {
  id: number
  domain: string
  name: string
  description: string
  avatarUrl: string | null
  isVerified: boolean
  websiteUrl: string
  followers: number
  isFollowing: boolean
  stats: {
    news: number
    likes: number
    comments: number
  }
}

export default function PlatformDetail({ domain }: PlatformDetailProps) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [bannerColor, setBannerColor] = useState<[number, number, number] | null>(null)

  const getDominantColor = useCallback(async (imageUrl: string): Promise<[number, number, number] | null> => {
    try {
      const colorThief = new ColorThief()
      const img = document.createElement('img')
      img.crossOrigin = 'Anonymous'

      return new Promise((resolve) => {
        img.onload = () => {
          const color = colorThief.getColor(img)
          resolve(color)
        }
        img.onerror = () => {
          // Resim yükleme hatası sessizce handle edilir
          resolve(null)
        }
        img.src = imageUrl
      })
    } catch (error) {
      console.error('Renk çıkarma hatası:', error)
      return null
    }
  }, [])

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing)
      // TODO: API entegrasyonu eklenecek
    } catch (error) {
      console.error('Takip işlemi sırasında hata oluştu:', error)
      setIsFollowing(!isFollowing) // Hata durumunda geri al
    }
  }

  useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const response = await fetch(`/api/platforms/${domain}`)
        const data = await response.json()

        if (data?.success) {
          setPlatform(data.data.platform)

          // Avatar varsa renk çıkar
          if (data.data.platform.avatarUrl) {
            const color = await getDominantColor(data.data.platform.avatarUrl)
            setBannerColor(color)
          }
        }
      } catch (error) {
        console.error('Platform yüklenirken hata oluştu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatform()
  }, [domain, getDominantColor])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto sm:mx-0 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto sm:mx-0 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto sm:mx-0 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="mt-1 h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!platform) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-semibold text-gray-900">Platform bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">Aradığınız platform mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          Ana Sayfaya Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
            {/* Platform Header - Modern Card Style */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover Image - Dynamic Background */}
        <div
          className="h-48 relative"
                    style={{
            backgroundColor: bannerColor
              ? `rgb(${Math.round(bannerColor[0] * 0.8)}, ${Math.round(bannerColor[1] * 0.8)}, ${Math.round(bannerColor[2] * 0.8)})`
              : 'rgb(var(--color-primary-600))'
          }}
        >
          <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10"></div>


        </div>

        {/* Platform Info Section */}
        <div className="px-8 pb-8">
          {/* Avatar and Follow Button */}
          <div className="flex justify-between items-end -mt-24 mb-6">
            <div className="flex-shrink-0 relative z-10">
              {platform.avatarUrl ? (
                <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden">
                  <Image
                    src={platform.avatarUrl}
                    alt={platform.name}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Resim yüklenemediğinde fallback göster
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div className="avatar-fallback w-full h-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center" style={{ display: 'none' }}>
                    <span className="text-white font-bold text-6xl">
                      {platform.name.charAt(0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-xl bg-white flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-6xl">
                      {platform.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pt-8 -m-3.5">
              <Link
                href={isFollowing ? '#' : '/giris'}
                onClick={isFollowing ? handleFollow : undefined}
                className="inline-flex items-center px-8 py-3 space-x-3 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 rounded-2xl border border-gray-300 transition-all duration-200 hover:shadow-md active:scale-98"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</span>
              </Link>

              <a
                href={platform.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 space-x-3 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 rounded-2xl border border-gray-300 transition-all duration-200 hover:shadow-md active:scale-98"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Web Sitesi</span>
              </a>
            </div>
          </div>

          {/* Platform Info and Stats */}
          <div className="space-y-6">
            {/* Header Section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{platform.name}</h1>
                {platform.isVerified && (
                  <CheckBadgeIcon className="h-6 w-6 text-primary-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-500 text-sm">{platform.domain}</p>
            </div>

            {/* Description */}
            {platform.description && (
              <div className="text-gray-600 text-base leading-relaxed max-w-3xl">
                {platform.description}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Haber Sayısı */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors duration-200">
                <span className="font-bold text-xl text-gray-900 mb-1">{platform.stats.news.toLocaleString()}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.057M13 13h3m-3 4h2" />
                  </svg>
                  Haber
                </span>
              </div>

              {/* Takipçi Sayısı */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors duration-200">
                <span className="font-bold text-xl text-gray-900 mb-1">{platform.followers.toLocaleString()}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Takipçi
                </span>
              </div>

              {/* Beğeni Sayısı */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors duration-200">
                <span className="font-bold text-xl text-gray-900 mb-1">{platform.stats.likes.toLocaleString()}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Beğeni
                </span>
              </div>

              {/* Yorum Sayısı */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors duration-200">
                <span className="font-bold text-xl text-gray-900 mb-1">{platform.stats.comments.toLocaleString()}</span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Yorum
                </span>
              </div>
            </div>


          </div>
        </div>
      </article>

      {/* Platform News */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Son Haberler</h2>
        <NewsList
          platformDomain={domain}
          layout="masonry"
        />
      </div>
    </div>
  )
}
