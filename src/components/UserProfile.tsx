'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { sessionUtils } from '@/utils/session'
import { 
  UserCircleIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useOAuthSync } from '@/hooks/useOAuthSync'

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const { syncUserData, isSyncing, lastSync, error } = useOAuthSync()

  useEffect(() => {
    const currentUser = sessionUtils.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Local session'ı temizle
        sessionUtils.clearSession()
        // Ana sayfaya yönlendir
        router.push('/')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleSync = async () => {
    const success = await syncUserData()
    if (success) {
      // Kullanıcı bilgilerini yeniden yükle
      const currentUser = sessionUtils.getCurrentUser()
      setUser(currentUser)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3">
        <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3 p-3">
        <UserCircleIcon className="h-8 w-8 text-gray-400" />
        <div className="text-sm text-gray-600">Giriş yapılmamış</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
          )}
          {user.oauthProvider && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
            {user.username && (
              <span className="text-xs text-gray-500 ml-1">@{user.username}</span>
            )}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
            {user.emailVerified && (
              <span className="ml-1 text-green-500">✓</span>
            )}
          </p>
          {user.oauthProvider && (
            <p className="text-xs text-blue-600">
              {user.oauthProvider === 'cengel_studio' ? 'Cengel Studio' : user.oauthProvider}
              {user.lastOAuthSync && (
                <span className="ml-1 text-gray-400">
                  • {new Date(user.lastOAuthSync).toLocaleDateString('tr-TR')}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-semibold text-gray-900">0</p>
          <p className="text-xs text-gray-500">Takip Edilen</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-semibold text-gray-900">0</p>
          <p className="text-xs text-gray-500">Beğenilen</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {user.oauthProvider && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {isSyncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            <span>{isSyncing ? 'Senkronize ediliyor...' : 'Bilgileri Güncelle'}</span>
          </button>
        )}
        
        <button
          onClick={() => router.push('/profil')}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <CogIcon className="h-4 w-4" />
          <span>Profil Ayarları</span>
        </button>
        
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {logoutLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          )}
          <span>{logoutLoading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Hesap Türü:</span>
          <span className="font-medium">
            {user.oauthProvider ? 'OAuth' : 'Yerel'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>Kayıt Tarihi:</span>
          <span className="font-medium">
            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    </div>
  )
}
