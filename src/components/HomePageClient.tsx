'use client'

import { useAuth } from '@/hooks/useAuth'

export default function HomePageClient() {
  const { isAuthenticated, loading } = useAuth()

  // Sadece login olmayan kullanıcılara hero section göster
  if (loading || isAuthenticated) {
    return null
  }

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Türkiye'nin{' '}
        <span className="text-red-600">Haber Merkezi</span>
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/son-dakika"
          className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Son Dakika
        </a>
        <a href="/platformlar" className="text-sm font-semibold leading-6 text-gray-900">
          Platformları Keşfet <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  )
}
