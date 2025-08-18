'use client'

import { useState, useEffect } from 'react'

export default function DebugSession() {
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const checkSession = () => {
      const data = localStorage.getItem('ozet_session')
      if (data) {
        try {
          const parsed = JSON.parse(data)
          setSessionData(parsed)
        } catch (error) {
          console.error('Error parsing session:', error)
        }
      }
    }

    checkSession()
    // Check every 2 seconds
    const interval = setInterval(checkSession, 2000)
    return () => clearInterval(interval)
  }, [])

  if (!sessionData) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
        No session data found in localStorage
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-50 max-w-sm">
      <div className="font-bold">Session Found:</div>
      <div className="text-sm">
        <div>User: {sessionData.user?.name}</div>
        <div>Email: {sessionData.user?.email}</div>
        <div>Handle: {sessionData.handle}</div>
        <div>Expires: {new Date(sessionData.expiresAt).toLocaleString()}</div>
        <div>Tokens: {sessionData.tokens ? 'Present' : 'Missing'}</div>
      </div>
    </div>
  )
}
