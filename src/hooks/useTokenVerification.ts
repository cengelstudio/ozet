import { useEffect, useRef } from 'react'
import { sessionUtils } from '@/utils/session'

export function useTokenVerification() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const verifyToken = async () => {
    try {
      // Session var mı kontrol et
      const session = sessionUtils.getSession()
      if (!session) {
        console.log('No session found, skipping token verification')
        return
      }

      // OAuth kullanıcısı mı kontrol et
      if (!session.user.oauthProvider || session.user.oauthProvider !== 'cengel_studio') {
        console.log('Not an OAuth user, skipping token verification')
        return
      }

      // Session süresi dolmuş mu kontrol et
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        console.log('Session expired, clearing...')
        sessionUtils.clearSession()
        window.location.href = '/giris?error=session_expired'
        return
      }

      console.log('Verifying OAuth token...')

      const response = await fetch('/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (!data.success) {
        console.log('Token verification failed:', data.error)
        
        // Güvenlik sorunlarında logout yap
        let shouldLogout = false
        let logoutReason = 'token_invalid'
        
        if (data.error === 'Token invalid or expired') {
          shouldLogout = true
          logoutReason = 'token_expired'
        } else if (data.error === 'User ID mismatch') {
          shouldLogout = true
          logoutReason = 'user_mismatch'
        } else if (data.error === 'Token verification failed') {
          shouldLogout = true
          logoutReason = 'app_disconnected'
        } else if (data.error === 'No access token found') {
          shouldLogout = true
          logoutReason = 'session_corrupted'
        } else if (data.error === 'Session expired') {
          shouldLogout = true
          logoutReason = 'session_expired'
        } else if (data.error === 'Session not found in database') {
          shouldLogout = true
          logoutReason = 'session_not_found'
        }
        
        if (shouldLogout) {
          console.log('Auto logout due to:', data.error, 'Reason:', logoutReason)
          
          // Client-side session'ı temizle
          sessionUtils.clearSession()
          
          // Server-side session'ı temizle
          try {
            await fetch('/api/auth/auto-logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
          } catch (error) {
            console.error('Auto logout API call failed:', error)
          }
          
          // Giriş sayfasına yönlendir
          window.location.href = `/giris?error=${logoutReason}`
        } else {
          console.log('Token verification failed but no logout needed:', data.error)
        }
      } else {
        console.log('Token verification successful')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      
      // Hata durumunda da session'ı temizle
      sessionUtils.clearSession()
      window.location.href = '/giris?error=verification_failed'
    }
  }

  useEffect(() => {
    // İlk kontrol
    verifyToken()

    // Her 1 dakikada bir kontrol et (OAUTH_FLOW.txt'de belirtildiği gibi)
    intervalRef.current = setInterval(verifyToken, 60 * 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    verifyToken
  }
}
