'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { OAUTH_ERROR_MESSAGES } from '@/config/oauth'

export default function AutoLogoutNotification() {
  const [showNotification, setShowNotification] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // URL'den logout reason'ı kontrol et
    const urlParams = new URLSearchParams(window.location.search)
    const logoutReason = urlParams.get('error')
    
    if (logoutReason) {
      let notificationMessage = ''
      
      // OAuth error mesajlarını kullan
      if (logoutReason in OAUTH_ERROR_MESSAGES) {
        notificationMessage = OAUTH_ERROR_MESSAGES[logoutReason as keyof typeof OAUTH_ERROR_MESSAGES]
      } else {
        switch (logoutReason) {
          case 'token_expired':
            notificationMessage = 'Oturum süreniz doldu. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'token_invalid':
            notificationMessage = 'Oturum geçersiz hale geldi. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'user_mismatch':
            notificationMessage = 'Kullanıcı bilgileriniz değişti. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'app_disconnected':
            notificationMessage = 'Cengel ID bağlantınız kesildi. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'session_corrupted':
            notificationMessage = 'Oturum bilgileriniz bozuldu. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'session_expired':
            notificationMessage = 'Oturum süreniz doldu. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'session_not_found':
            notificationMessage = 'Oturum bulunamadı. Güvenlik nedeniyle çıkış yapıldı.'
            break
          case 'verification_failed':
            notificationMessage = 'Token doğrulama başarısız. Güvenlik nedeniyle çıkış yapıldı.'
            break
          default:
            notificationMessage = 'Güvenlik nedeniyle oturumunuz sonlandırıldı.'
        }
      }
      
      setMessage(notificationMessage)
      setShowNotification(true)
      
      // URL'den parametreyi temizle
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      
      // 10 saniye sonra notification'ı kapat
      setTimeout(() => {
        setShowNotification(false)
      }, 10000)
    }
  }, [])

  if (!showNotification) {
    return null
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              {message}
            </p>
            <p className="mt-1 text-sm text-red-700">
              Tekrar giriş yapabilirsiniz.
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShowNotification(false)}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
