import { User, Session } from '@/types/user'

// Session storage key
const SESSION_KEY = 'ozet_session'

// Session utility functions
export const sessionUtils = {
  // Session'ı localStorage'a kaydet
  saveSession: (session: Session): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  },

  // Session'ı localStorage'dan al
  getSession: (): Session | null => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem(SESSION_KEY)
      console.log('SessionUtils: Raw session data:', sessionData)
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          console.log('SessionUtils: Parsed session:', session)
          // Session'ın geçerliliğini kontrol et
          if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
            console.log('SessionUtils: Valid session found')
            return session
          } else {
            console.log('SessionUtils: Session expired, clearing')
            // Session süresi dolmuş, temizle
            sessionUtils.clearSession()
          }
        } catch (error) {
          console.error('Session parse error:', error)
          sessionUtils.clearSession()
        }
      } else {
        console.log('SessionUtils: No session data found')
      }
    }
    return null
  },

  // Session'ı temizle
  clearSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY)
      console.log('SessionUtils: Session cleared')
    }
  },

  // Kullanıcı giriş yapmış mı kontrol et
  isAuthenticated: (): boolean => {
    return sessionUtils.getSession() !== null
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: (): User | null => {
    const session = sessionUtils.getSession()
    return session?.user || null
  },

  // Session'ı yenile
  refreshSession: (user: User): void => {
    const session: Session = {
      handle: `session-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      user: user
    }
    sessionUtils.saveSession(session)
  },

  // Kullanıcı bilgilerini güncelle
  updateUser: (updatedUser: User): void => {
    const session = sessionUtils.getSession()
    if (session) {
      session.user = updatedUser
      sessionUtils.saveSession(session)
    }
  },

  // OAuth kullanıcısı mı kontrol et
  isOAuthUser: (): boolean => {
    const user = sessionUtils.getCurrentUser()
    return user?.oauthProvider === 'cengel_studio'
  }
}

// OAuth session management
export const oauthUtils = {
  // OAuth state'ini sakla
  saveOAuthState: (state: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state)
    }
  },

  // OAuth state'ini al
  getOAuthState: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('oauth_state')
    }
    return null
  },

  // OAuth state'ini temizle
  clearOAuthState: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('oauth_state')
    }
  }
}
