'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import AuthModal from './AuthModal'
import moment from 'moment'
import 'moment/locale/tr'

// Moment.js'i Türkçe olarak ayarla
moment.locale('tr')

// SEO dostu slug oluşturma fonksiyonu
function createSlug(id: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tireye çevir
    .trim()
    .substring(0, 100) // Maksimum 100 karakter
  return `${id}-${slug}`
}

type NewsCardProps = {
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

export default function NewsCard({
  id,
  title,
  description,
  link,
  imageUrl,
  publishedAt,
  publishedAtFormatted,
  platform,
  _count
}: NewsCardProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authAction, setAuthAction] = useState<'like' | 'save' | 'follow'>('like')
  const detailSlug = createSlug(id, title)

  const handleAction = (action: 'like' | 'save' | 'follow') => {
    // TODO: Oturum kontrolü
    const isLoggedIn = false

    if (!isLoggedIn) {
      setAuthAction(action)
      setIsAuthModalOpen(true)
      return
    }

    // TODO: İlgili işlemi yap
    console.log('Action:', action)
  }

  return (
    <>
    <article className="group break-inside-avoid mb-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Section */}
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-5">
        {/* Publisher Info */}
        <div className="flex items-start space-x-3 mb-4">
          <Link href={`/platform/${platform.domain}`} className="flex-shrink-0">
            {platform.avatarUrl ? (
              <Image
                src={platform.avatarUrl}
                alt={platform.name}
                width={100}
                height={100}
                className="w-[50px] h-[50px] rounded-xl shadow-sm object-cover"
              />
            ) : (
              <div className="w-[50px] h-[50px] rounded-xl bg-primary-100 flex items-center justify-center shadow-sm">
                <span className="text-primary-700 font-bold text-xl">
                  {platform.name.charAt(0)}
                </span>
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <Link href={`/platform/${platform.domain}`} className="flex items-center space-x-1.5 group/publisher">
              <span className="text-[15px] font-bold text-gray-900 truncate group-hover/publisher:text-primary-600 transition-colors duration-200">
                {platform.name}
              </span>
              {platform.isVerified && (
                <CheckBadgeIcon className="h-[18px] w-[18px] text-primary-500 flex-shrink-0" />
              )}
            </Link>
            <div className="text-[13px] text-gray-500 mt-1">
              {useMemo(() => {
                if (publishedAtFormatted) return publishedAtFormatted
                try {
                  return moment(publishedAt).fromNow()
                } catch {
                  return ''
                }
              }, [publishedAtFormatted, publishedAt])}
            </div>
          </div>
        </div>

        {/* Content */}
        <Link href={`/haber/${detailSlug}`} className="block group/title">
          <h2 className="text-xl font-bold text-gray-900 group-hover/title:text-primary-600 transition-colors duration-300 line-clamp-3 leading-snug mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-base text-gray-600 line-clamp-2 leading-relaxed group-hover/title:text-gray-700 transition-colors duration-300">
              {description}
            </p>
          )}
        </Link>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center -ml-1.5 space-x-1">
            <button
              onClick={() => handleAction('like')}
              className="group/btn flex items-center space-x-2 h-8 px-3 text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-full transition-all duration-200"
            >
              <HeartIcon className="h-[18px] w-[18px] group-hover/btn:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{_count.likes}</span>
            </button>
            <Link
              href={`/haber/${detailSlug}`}
              className="group/btn flex items-center space-x-2 h-8 px-3 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-full transition-all duration-200"
            >
              <ChatBubbleLeftIcon className="h-[18px] w-[18px] group-hover/btn:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{_count.comments}</span>
            </Link>
            <button
              onClick={() => handleAction('save')}
              className="group/btn flex items-center space-x-2 h-8 px-3 text-gray-600 hover:text-yellow-600 bg-gray-50 hover:bg-yellow-50 rounded-full transition-all duration-200"
            >
              <BookmarkIcon className="h-[18px] w-[18px] group-hover/btn:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium">{_count.saves}</span>
            </button>
          </div>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 w-8 text-gray-600 hover:text-primary-600 bg-gray-50 hover:bg-primary-50 rounded-full transition-all duration-200 group/external"
          >
            <ArrowTopRightOnSquareIcon className="h-[18px] w-[18px] group-hover/external:scale-110 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </article>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action={authAction}
      />
    </>
  )
}
