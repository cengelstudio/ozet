'use client'

import { useEffect } from 'react'
import { useTokenVerification } from '@/hooks/useTokenVerification'
import { sessionUtils } from '@/utils/session'

export default function TokenVerificationProvider({ children }: { children: React.ReactNode }) {
  // OAuth token verification'ı başlat
  const { verifyToken } = useTokenVerification()

  // Sayfa yüklendiğinde hemen kontrol et
  useEffect(() => {
    const session = sessionUtils.getSession()
    if (session && session.user.oauthProvider === 'cengel_studio') {
      console.log('TokenVerificationProvider: Immediate token verification')
      verifyToken()
    }
  }, [verifyToken])

  return <>{children}</>
}
