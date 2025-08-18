'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import ColorThief from 'colorthief'

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

type PlatformsClientProps = {
  initialPlatforms: Platform[]
}

function decodeHtmlEntities(text: string | null): string {
  if (!text) return ''
  const entities = {
    '&#252;': 'ü',
    '&#220;': 'Ü',
    '&#231;': 'ç',
    '&#199;': 'Ç',
    '&#246;': 'ö',
    '&#214;': 'Ö',
    '&#305;': 'ı',
    '&#304;': 'İ',
    '&#287;': 'ğ',
    '&#286;': 'Ğ',
    '&#351;': 'ş',
    '&#350;': 'Ş',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
  }
  return text.replace(/&#\d+;|&\w+;/g, match => (entities as any)[match] || match)
}

export default function PlatformsClient({ initialPlatforms }: PlatformsClientProps) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms)
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'TR' | 'GLOBAL'>('TR')
  const [bannerColors, setBannerColors] = useState<{ [key: string]: [number, number, number] }>({})

  // Profil resminden ana renk çıkarma fonksiyonu
  const getDominantColor = (imageUrl: string, platformId: string): void => {
    try {
      const colorThief = new ColorThief()
      const img = document.createElement('img')
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        try {
          const color = colorThief.getColor(img)
          setBannerColors(prev => ({
            ...prev,
            [platformId]: color
          }))
        } catch (error) {
          console.error('Renk çıkarma hatası:', error)
        }
      }

      img.onerror = () => {
        // Resim yükleme hatası sessizce handle edilir
        // console.error('Resim yüklenemedi:', imageUrl)
      }

      img.src = imageUrl
    } catch (error) {
      console.error('Renk çıkarma hatası:', error)
    }
  }

  useEffect(() => {
    // Her platform için banner rengi çıkar
    platforms.forEach(platform => {
      if (platform.avatarUrl) {
        getDominantColor(platform.avatarUrl, platform.id.toString())
      }
    })
  }, [platforms])

  const filteredPlatforms = selectedRegion === 'ALL'
    ? platforms
    : platforms.filter(p => {
        if (selectedRegion === 'TR') {
          return p.locale === 'TR'
        } else if (selectedRegion === 'GLOBAL') {
          return p.locale === 'INT'
        }
        return true
      })

  return (
    <div className="pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Haber Platformları
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Türkiye&apos;nin önde gelen haber kaynaklarını keşfedin ve güvenilir haberlere anında ulaşın.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mt-8 mb-10 flex justify-center">
          <div className="inline-flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl">
            <button
              onClick={() => setSelectedRegion('ALL')}
              className={`relative px-8 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                selectedRegion === 'ALL'
                  ? 'text-gray-900 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Tümü
              {selectedRegion === 'ALL' && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSelectedRegion('TR')}
              className={`relative px-8 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                selectedRegion === 'TR'
                  ? 'text-gray-900 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Türkiye
              {selectedRegion === 'TR' && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSelectedRegion('GLOBAL')}
              className={`relative px-8 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                selectedRegion === 'GLOBAL'
                  ? 'text-gray-900 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Dünya
              {selectedRegion === 'GLOBAL' && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlatforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/platform/${platform.domain}`}
              className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Platform Banner */}
              <div
                className="h-32 relative"
                style={{
                  backgroundColor: bannerColors[platform.id.toString()]
                    ? `rgb(${Math.round(bannerColors[platform.id.toString()][0] * 0.8)}, ${Math.round(bannerColors[platform.id.toString()][1] * 0.8)}, ${Math.round(bannerColors[platform.id.toString()][2] * 0.8)})`
                    : 'rgb(var(--color-primary-500))'
                }}
              >
                <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-30"></div>
              </div>

              {/* Platform Info */}
              <div className="p-6">
                <div className="flex items-start -mt-16 mb-4">
                  {/* Avatar */}
                  {platform.avatarUrl ? (
                    <div className="relative h-20 w-20 rounded-xl border-4 border-white shadow-lg bg-white overflow-hidden">
                      <Image
                        src={platform.avatarUrl}
                        alt={platform.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Resim yüklenemediğinde fallback göster
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.parentElement?.querySelector('.platform-avatar-fallback') as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div className="platform-avatar-fallback absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-white font-bold text-2xl">
                          {platform.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl border-4 border-white shadow-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Platform Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {platform.name}
                    </h2>
                    {platform.isVerified && (
                      <CheckBadgeIcon className="h-6 w-6 text-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{platform.domain}</p>
                  {platform.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {decodeHtmlEntities(platform.description)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
