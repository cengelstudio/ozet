import { NextRequest, NextResponse } from "next/server"
import { OAuthUserInfo } from "@/types/user"

// OAuth Configuration - Production settings
const OAUTH_CONFIG = {
  userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, accessToken } = body

    if (!userId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve access token gerekli' },
        { status: 400 }
      )
    }

    // Cengel Studio'dan güncel kullanıcı bilgilerini al
    const userInfo = await getUserInfo(accessToken)
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgileri alınamadı' },
        { status: 400 }
      )
    }

    // Kullanıcı bilgilerini güncelle
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Benzersiz username oluştur
    const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
      if (!baseUsername) {
        return `user_${Date.now()}`
      }
      
      let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')
      let counter = 1
      let finalUsername = username
      
      while (true) {
        const existingUser = await prisma.user.findUnique({
          where: { username: finalUsername }
        })
        
        if (!existingUser || existingUser.id === userId) {
          break
        }
        
        finalUsername = `${username}_${counter}`
        counter++
      }
      
      return finalUsername
    }

    const uniqueUsername = await generateUniqueUsername(userInfo.preferred_username || userInfo.name || 'user')

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userInfo.name || userInfo.preferred_username,
        email: userInfo.email,
        username: uniqueUsername,
        emailVerified: userInfo.email_verified || false,
        avatarUrl: userInfo.avatarUrl || userInfo.picture,
        lastOAuthSync: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        username: true,
        emailVerified: true,
        oauthProvider: true,
        oauthId: true,
        lastOAuthSync: true
      }
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı bilgileri güncellendi',
      data: { user: updatedUser }
    })

  } catch (error) {
    console.error('OAuth sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth senkronizasyonu başarısız',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// User info endpoint'inden kullanıcı bilgilerini al
async function getUserInfo(accessToken: string): Promise<OAuthUserInfo | null> {
  try {
    console.log('Getting user info for sync...')
    
    const response = await fetch(OAUTH_CONFIG.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    console.log('User info response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('User info failed:', errorText)
      return null
    }

    const userInfo = await response.json()
    console.log('User info received for sync:', { 
      sub: userInfo.sub, 
      name: userInfo.name, 
      email: userInfo.email,
      preferred_username: userInfo.preferred_username
    })
    return userInfo
  } catch (error) {
    console.error('User info error:', error)
    return null
  }
}
