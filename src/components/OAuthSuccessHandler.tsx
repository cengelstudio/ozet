'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sessionUtils } from '@/utils/session'

export default function OAuthSuccessHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const oauthSuccess = searchParams?.get('oauth_success')
    const sessionData = searchParams?.get('session_data')

    console.log('OAuthSuccessHandler: Checking params:', { oauthSuccess, sessionData: sessionData ? 'present' : 'missing' })

    if (oauthSuccess === 'true' && sessionData) {
      try {
        // Decode and parse session data
        const session = JSON.parse(decodeURIComponent(sessionData))
        
        console.log('OAuthSuccessHandler: Parsed session:', session)
        
        // Save session to localStorage
        sessionUtils.saveSession(session)
        
        console.log('OAuth success! Session saved:', {
          user: session.user.name,
          email: session.user.email,
          sessionHandle: session.handle
        })

        // Clean up URL parameters
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
        
        // Force page reload to update header
        window.location.reload()
        
      } catch (error) {
        console.error('Error processing OAuth success:', error)
      }
    }
  }, [searchParams])

  return null // This component doesn't render anything
}
