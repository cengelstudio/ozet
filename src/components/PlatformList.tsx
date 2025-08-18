'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckBadgeIcon, MagnifyingGlassIcon, GlobeAltIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/solid'
import { MagnifyingGlassIcon as MagnifyingGlassOutline } from '@heroicons/react/24/outline'

type Platform = {
  id: number
  domain: string
  name: string
  description: string
  avatarUrl: string | null
  isVerified: boolean
  _count?: {
    news: number
    followers: number
  }
}

export default function PlatformList() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [filteredPlatforms, setFilteredPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/platforms')
        const data = await response.json()
        if (data?.success) {
          const list = data?.data?.platforms
          const platformsList = Array.isArray(list) ? list : []
          setPlatforms(platformsList)
          setFilteredPlatforms(platformsList)
        } else {
          setPlatforms([])
          setFilteredPlatforms([])
        }
      } catch (error) {
        console.error('Platformlar yüklenirken hata oluştu:', error)
        setPlatforms([])
        setFilteredPlatforms([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlatforms(platforms)
    } else {
      const filtered = platforms.filter(platform =>
        platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        platform.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPlatforms(filtered)
    }
  }, [searchTerm, platforms])

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <GlobeAltIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl animate-pulse">
                <div className="h-14 w-14 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-3xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Haber Platformları</h2>
            <p className="text-sm text-gray-500">{platforms.length} platform</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Platform ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Platform List */}
      <div className="p-6">
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {searchTerm ? 'Platform bulunamadı' : 'Henüz platform yok'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Arama kriterlerinize uygun platform bulunamadı.' : 'Henüz hiç platform eklenmemiş.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlatforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/platform/${platform.domain}`}
                className="group block"
              >
                <div className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-primary-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-primary-100">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {platform.avatarUrl ? (
                      <div className="relative h-14 w-14">
                        <Image
                          src={platform.avatarUrl}
                          alt={platform.name}
                          fill
                          className="rounded-2xl object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-primary-700 font-bold text-xl">
                          {platform.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-200">
                        {platform.name}
                      </h3>
                      {platform.isVerified && (
                        <CheckBadgeIcon className="h-4 w-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                      )}
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-2">
                      {platform.domain}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <DocumentTextIcon className="h-3 w-3" />
                        <span>{platform._count?.news || 0} haber</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <UsersIcon className="h-3 w-3" />
                        <span>{platform._count?.followers || 0} takipçi</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors duration-200">
                      <svg className="w-3 h-3 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        {platforms.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/platformlar"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-xl transition-all duration-200 group"
            >
              <span>Tüm Platformları Gör</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
