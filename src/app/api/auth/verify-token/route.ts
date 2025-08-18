import { NextRequest, NextResponse } from 'next/server'

// OAuth configuration
const OAUTH_CONFIG = {
  userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo'
}

export async function GET(request: NextRequest) {
  try {
    // Session handle'ı cookie'den al
    const sessionHandle = request.cookies.get('session_handle')?.value
    if (!sessionHandle) {
      return NextResponse.json({
        success: false,
        error: 'No active session found'
      }, { status: 401 })
    }

    // Veritabanından session'ı al
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const session = await prisma.session.findUnique({
      where: { handle: sessionHandle }
    })
    
    if (!session) {
      await prisma.$disconnect()
      return NextResponse.json({
        success: false,
        error: 'Session not found in database'
      }, { status: 401 })
    }

    // Session süresi dolmuş mu kontrol et
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      // Session'ı veritabanından sil
      await prisma.session.delete({
        where: { handle: sessionHandle }
      })
      await prisma.$disconnect()
      return NextResponse.json({
        success: false,
        error: 'Session expired'
      }, { status: 401 })
    }

    // Private data'dan token'ları al
    let tokens
    try {
      tokens = JSON.parse(session.privateData || '{}')
    } catch (error) {
      await prisma.$disconnect()
      return NextResponse.json({
        success: false,
        error: 'Invalid session data'
      }, { status: 401 })
    }

    const accessToken = tokens.access_token
    if (!accessToken) {
      await prisma.$disconnect()
      return NextResponse.json({
        success: false,
        error: 'No access token found'
      }, { status: 401 })
    }

    // Cengel Studio'dan kullanıcı bilgilerini al
    const response = await fetch(OAUTH_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      // Token geçersiz veya süresi dolmuş
      console.log('Token verification failed:', response.status, response.statusText)
      
      // Server-side session'ı temizle
      await prisma.session.delete({
        where: { handle: sessionHandle }
      })
      
      await prisma.$disconnect()
      console.log('Token verification: Session deleted from database:', sessionHandle)
      
      return NextResponse.json({
        success: false,
        error: 'Token invalid or expired',
        shouldLogout: true
      }, { status: 401 })
    }

    const userInfo = await response.json()
    
    // Public data'dan kullanıcı bilgilerini al
    let publicData
    try {
      publicData = JSON.parse(session.publicData || '{}')
    } catch (error) {
      await prisma.$disconnect()
      return NextResponse.json({
        success: false,
        error: 'Invalid session data'
      }, { status: 401 })
    }
    
    // Kullanıcı ID'lerini karşılaştır
    if (userInfo.sub !== publicData.oauthId) {
      console.log('User ID mismatch:', {
        tokenUserId: userInfo.sub,
        sessionUserId: publicData.oauthId
      })
      
      // Server-side session'ı temizle
      await prisma.session.delete({
        where: { handle: sessionHandle }
      })
      
      await prisma.$disconnect()
      console.log('User ID mismatch: Session deleted from database:', sessionHandle)
      
      return NextResponse.json({
        success: false,
        error: 'User ID mismatch',
        shouldLogout: true
      }, { status: 401 })
    }

    // Token geçerli - session'ı güncelle
    await prisma.session.update({
      where: { handle: sessionHandle },
      data: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün uzat
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        username: userInfo.preferred_username
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    
    // Session handle'ı cookie'den al
    const sessionHandle = request.cookies.get('session_handle')?.value
    
    // Server-side session'ı temizle
    if (sessionHandle) {
      try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()
        
        await prisma.session.delete({
          where: { handle: sessionHandle }
        })
        
        await prisma.$disconnect()
        console.log('Token verification error: Session deleted from database:', sessionHandle)
      } catch (dbError) {
        console.error('Token verification error: Error deleting session from database:', dbError)
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Token verification failed',
      shouldLogout: true
    }, { status: 500 })
  }
}
