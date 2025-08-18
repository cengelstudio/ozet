'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowTopRightOnSquareIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'

type TrendingNews = {
  id: number
  title: string
  link: string
  publishedAt: string
  platform: {
    domain: string
    name: string
    avatarUrl: string | null
    isVerified: boolean
  }
}

type TrendingNewsClientProps = {
  initialNews: TrendingNews[]
}

function createSlug(id: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
  return `${id}-${slug}`
}

export default function TrendingNewsClient({ initialNews }: TrendingNewsClientProps) {
  if (initialNews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Gündem</h2>
        <p className="text-sm text-gray-500">Son 4 saat içinde haber bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Gündem</h2>
      <div className="space-y-6">
        {initialNews.map((item) => {
          const detailSlug = createSlug(item.id, item.title)
          return (
            <article key={item.id} className="group pb-6 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50/50 rounded-lg transition-colors duration-200 -mx-3 px-3">
              <div className="flex items-center space-x-3 mb-3">
                <Link href={`/platform/${item.platform.domain}`} className="flex-shrink-0">
                  {item.platform.avatarUrl ? (
                    <Image
                      src={item.platform.avatarUrl}
                      alt={item.platform.name}
                      width={64}
                      height={64}
                      className="w-8 h-8 rounded-lg shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shadow-sm">
                      <span className="text-primary-700 font-bold text-sm">
                        {item.platform.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/platform/${item.platform.domain}`} className="flex items-center space-x-1.5 group/publisher">
                    <span className="text-[15px] font-bold text-gray-900 truncate group-hover/publisher:text-primary-600 transition-colors duration-200">
                      {item.platform.name}
                    </span>
                    {item.platform.isVerified && (
                      <CheckBadgeIcon className="h-[18px] w-[18px] text-primary-500 flex-shrink-0" />
                    )}
                  </Link>
                </div>
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 text-gray-600 hover:text-primary-600 bg-gray-100 hover:bg-primary-50 rounded-full transition-all duration-200 group/external"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 group-hover/external:scale-110 transition-transform duration-200" />
                </Link>
              </div>
              <Link href={`/haber/${detailSlug}`} className="block group/title">
                <h3 className="text-[15px] font-medium text-gray-900 group-hover/title:text-primary-600 transition-colors duration-200 line-clamp-2 leading-normal">
                  {item.title}
                </h3>
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}
