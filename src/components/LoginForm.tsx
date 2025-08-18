'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { OAUTH_ERROR_MESSAGES } from '@/config/oauth'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  // OAuth error mesajlarını kontrol et
  const oauthError = searchParams?.get('error')
  const oauthMessage = searchParams?.get('message')

  // OAuth hata mesajlarını Türkçe'ye çevir
  const getOAuthErrorMessage = (errorCode: string): string => {
    return OAUTH_ERROR_MESSAGES[errorCode as keyof typeof OAUTH_ERROR_MESSAGES] || 'Bilinmeyen bir hata oluştu'
  }

  const handleOAuthLogin = () => {
    setLoading(true)
    login()
  }

  return (
    <div className="space-y-6">
      {/* OAuth Hata mesajı */}
      {oauthError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Giriş Hatası</p>
              <p>{oauthMessage || getOAuthErrorMessage(oauthError)}</p>
            </div>
          </div>
        </div>
      )}

      {/* OAuth Login Section */}
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cengel Studio ile Giriş Yapın
          </h3>
          <p className="text-sm text-gray-600">
            Hesabınıza güvenli bir şekilde giriş yapmak için Cengel Studio hesabınızı kullanın.
          </p>
        </div>

        <button
          onClick={handleOAuthLogin}
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yönlendiriliyor...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Cengel Studio ile Giriş Yap
            </div>
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Giriş yaparak <a href="/kullanim-kosullari" className="text-red-600 hover:text-red-500">Kullanım Koşulları</a> ve <a href="/gizlilik-politikasi" className="text-red-600 hover:text-red-500">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.</p>
        </div>
      </div>
    </div>
  )
}
