'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { sessionUtils } from '@/utils/session'
import { User, Session } from '@/types/user'

export default function OAuthSuccessMessage() {
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    // URL'den OAuth başarı parametresini kontrol et
    const urlParams = new URLSearchParams(window.location.search)
    const oauthSuccess = urlParams.get('oauth_success')

    if (oauthSuccess === 'true') {
      // Session verilerini URL'den al ve localStorage'a kaydet
      const sessionHandle = urlParams.get('session_handle')
      const userId = urlParams.get('user_id')
      const userName = urlParams.get('user_name')
      const userEmail = urlParams.get('user_email')
      const userAvatar = urlParams.get('user_avatar')
      const userUsername = urlParams.get('user_username')
      const userOAuthProvider = urlParams.get('user_oauth_provider')
      const userOAuthId = urlParams.get('user_oauth_id')
      const userEmailVerified = urlParams.get('user_email_verified')
      const sessionExpires = urlParams.get('session_expires')

      if (sessionHandle && userId && userEmail) {
        // User objesi oluştur
        const user: User = {
          id: parseInt(userId),
          name: userName || '',
          email: userEmail,
          avatarUrl: userAvatar || undefined,
          username: userUsername || undefined,
          oauthProvider: userOAuthProvider as 'cengel_studio' | 'google' | 'github' || undefined,
          oauthId: userOAuthId || undefined,
          emailVerified: userEmailVerified === 'true',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Session objesi oluştur
        const session: Session = {
          handle: sessionHandle,
          expiresAt: sessionExpires ? new Date(sessionExpires) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          user: user
        }

        // Session'ı localStorage'a kaydet
        sessionUtils.saveSession(session)
        console.log('OAuth session saved to localStorage:', session)

        // Custom event ile header'ı güncelle
        window.dispatchEvent(new CustomEvent('sessionUpdated', { detail: { user } }))
      }

      setShowMessage(true)

      // URL'den parametreyi temizle
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      // 5 saniye sonra mesajı kapat
      setTimeout(() => {
        setShowMessage(false)
      }, 5000)
    }
  }, [])

  if (!showMessage) {
    return null
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              Başarıyla giriş yapıldı!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Cengel Studio hesabınızla güvenli bir şekilde giriş yaptınız.
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShowMessage(false)}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none focus:text-green-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
