import { useState, useEffect } from 'react'
import { sessionUtils } from '@/utils/session'

interface UseOAuthSyncReturn {
  syncUserData: () => Promise<boolean>
  isSyncing: boolean
  lastSync: Date | null
  error: string | null
}

export function useOAuthSync(): UseOAuthSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncUserData = async (): Promise<boolean> => {
    try {
      setIsSyncing(true)
      setError(null)

      const currentUser = sessionUtils.getCurrentUser()
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı')
      }

      // OAuth kullanıcısı mı kontrol et
      if (!sessionUtils.isOAuthUser()) {
        throw new Error('Bu işlem sadece OAuth kullanıcıları için geçerlidir')
      }

      // Session'dan access token'ı al
      const session = sessionUtils.getSession()
      if (!session?.tokens?.access_token) {
        throw new Error('Access token bulunamadı')
      }

      const response = await fetch('/api/auth/sync-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.id,
          accessToken: session.tokens.access_token
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Senkronizasyon başarısız')
      }

      // Güncellenmiş kullanıcı bilgilerini session'a kaydet
      const updatedUser = data.data.user
      sessionUtils.updateUser(updatedUser)

      setLastSync(new Date())
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(errorMessage)
      console.error('OAuth sync error:', err)
      return false
    } finally {
      setIsSyncing(false)
    }
  }

  // Otomatik senkronizasyon (her 30 dakikada bir)
  useEffect(() => {
    const currentUser = sessionUtils.getCurrentUser()
    if (!sessionUtils.isOAuthUser()) return

    const syncInterval = setInterval(() => {
      syncUserData()
    }, 30 * 60 * 1000) // 30 dakika

    return () => clearInterval(syncInterval)
  }, [])

  return {
    syncUserData,
    isSyncing,
    lastSync,
    error
  }
}
