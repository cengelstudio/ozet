'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string
  username?: string
  role: string
  emailVerified?: boolean
  oauthProvider?: string
  oauthId?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // OAuth bağlantısını kontrol et
  const checkAuth = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.isAuthenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)

        // OAuth bağlantısı kesildiyse logout yap
        if (data.error && ['oauth_connection_failed', 'token_refresh_failed', 'no_refresh_token'].includes(data.error)) {
          await logout()
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
      if (!isInitialized) {
        setIsInitialized(true)
        setLoading(false)
      }
    }
  }

  // OAuth login
  const login = () => {
    window.location.href = '/api/oauth?action=authorize'
  }

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      router.push('/giris')
    }
  }

  // İlk yüklemede auth kontrolü yap (loading göster)
  useEffect(() => {
    checkAuth(true)

    // Her 5 dakikada bir auth kontrolü yap (loading gösterme)
    const interval = setInterval(() => checkAuth(false), 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Sayfa yenilendiğinde auth kontrolü yap (loading gösterme)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized) {
        checkAuth(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isInitialized])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth: () => checkAuth(true) // Manuel check'te loading göster
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
