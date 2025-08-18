import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { OAuthUserInfo, OAuthTokens, User } from "@/types/user"

// OAuth Configuration - Production settings
const OAUTH_CONFIG = {
  clientId: 'pSsyy6i3D7rGyK8Hpt68Uw',
  clientSecret: 'u3huMcdhrkUR9zVcODYIPGGg2fFgGbbb7JIwOI-juw0',
  redirectUri: 'https://ozet.today/api/oauth',
  authUrl: 'https://id.cengel.studio/api/v2/oauth/authorize',
  tokenUrl: 'https://id.cengel.studio/api/v2/oauth/token',
  userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo',
  scope: 'openid profile email'
}

// Generate random state for CSRF protection
function generateState(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET: OAuth authorization URL oluştur
export async function GET(request: NextRequest) {
  try {
    console.log('OAuth request URL:', request.url)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    console.log('OAuth action:', action)

    if (action === 'authorize') {
      const state = generateState()

      // State'i session'da sakla
      const authUrl = createAuthUrl(state)
      console.log('Generated OAuth URL:', authUrl)
      const response = NextResponse.redirect(authUrl)
      response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600 // 10 dakika
      })

      return response
    }

    // Callback handling
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('OAuth callback params:', {
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      error
    })

    const baseUrl = 'https://ozet.today'

    if (error) {
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'oauth_error')
      redirectUrl.searchParams.set('message', error)
      return NextResponse.redirect(redirectUrl)
    }

    if (!code || !state) {
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_callback')
      return NextResponse.redirect(redirectUrl)
    }

    // State validation
    const storedState = request.cookies.get('oauth_state')?.value
    if (!storedState || storedState !== state) {
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_state')
      return NextResponse.redirect(redirectUrl)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens) {
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'token_exchange_failed')
      return NextResponse.redirect(redirectUrl)
    }

    // Get user info
    const userInfo = await getUserInfo(tokens.access_token)
    if (!userInfo) {
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'user_info_failed')
      return NextResponse.redirect(redirectUrl)
    }

    // Create or update user in your system
    const user = await createOrUpdateUser(userInfo)
    console.log('OAuth user created/updated:', {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      oauthProvider: user.oauthProvider,
      oauthId: user.oauthId,
      emailVerified: user.emailVerified
    })

    // Create session
    const session = {
      handle: `oauth-session-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      user: user,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token
      }
    }

    // Session'ı veritabanına kaydet
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()

      const savedSession = await prisma.session.create({
        data: {
          handle: session.handle,
          expiresAt: session.expiresAt,
          userId: user.id,
          publicData: JSON.stringify({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            username: user.username,
            emailVerified: user.emailVerified,
            oauthProvider: user.oauthProvider,
            oauthId: user.oauthId
          }),
          privateData: JSON.stringify({
            tokens: session.tokens
          })
        }
      })

      await prisma.$disconnect()
      console.log('Session saved to database:', {
        handle: session.handle,
        userId: savedSession.userId,
        expiresAt: savedSession.expiresAt
      })
    } catch (error) {
      console.error('Error saving session to database:', error)
      const redirectUrl = new URL('/giris', baseUrl)
      redirectUrl.searchParams.set('error', 'session_creation_failed')
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to success page with session data
    const redirectUrl = new URL('/', baseUrl)
    redirectUrl.searchParams.set('oauth_success', 'true')
    redirectUrl.searchParams.set('session_handle', session.handle)
    redirectUrl.searchParams.set('user_id', user.id.toString())
    redirectUrl.searchParams.set('user_name', user.name || '')
    redirectUrl.searchParams.set('user_email', user.email)
    redirectUrl.searchParams.set('user_avatar', user.avatarUrl || '')
    redirectUrl.searchParams.set('user_username', user.username || '')
    redirectUrl.searchParams.set('user_oauth_provider', user.oauthProvider || '')
    redirectUrl.searchParams.set('user_oauth_id', user.oauthId || '')
    redirectUrl.searchParams.set('user_email_verified', user.emailVerified.toString())
    redirectUrl.searchParams.set('session_expires', session.expiresAt.toISOString())

    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('session_handle', session.handle, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    // Clear OAuth state
    response.cookies.delete('oauth_state')

    return response

  } catch (error) {
    console.error('OAuth callback error:', error)
    const baseUrl = 'https://ozet.today'
    const redirectUrl = new URL('/giris', baseUrl)
    redirectUrl.searchParams.set('error', 'oauth_error')
    return NextResponse.redirect(redirectUrl)
  }
}

// OAuth authorization URL oluştur
function createAuthUrl(state: string): string {
  console.log('Creating OAuth URL with config:', {
    clientId: OAUTH_CONFIG.clientId,
    redirectUri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    authUrl: OAUTH_CONFIG.authUrl
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    state: state
  })

  const finalUrl = `${OAUTH_CONFIG.authUrl}?${params.toString()}`
  console.log('Final OAuth URL:', finalUrl)
  return finalUrl
}

// Authorization code'u token ile değiştir
async function exchangeCodeForTokens(code: string): Promise<OAuthTokens | null> {
  try {
    console.log('Exchanging code for tokens...')
    console.log('Token URL:', OAUTH_CONFIG.tokenUrl)
    console.log('Client ID:', OAUTH_CONFIG.clientId)
    console.log('Redirect URI:', OAUTH_CONFIG.redirectUri)
    console.log('Authorization Code:', code.substring(0, 10) + '...')

    // Cengel Studio token endpoint JSON body bekliyor
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      code: code,
      redirect_uri: OAUTH_CONFIG.redirectUri
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Token exchange response status:', response.status)
    console.log('Token exchange response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', errorText)
      console.error('Response status:', response.status)
      console.error('Response status text:', response.statusText)
      return null
    }

    const tokens = await response.json()
    console.log('Token exchange successful, tokens received:', {
      access_token: tokens.access_token ? 'present' : 'missing',
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      id_token: tokens.id_token ? 'present' : 'missing'
    })
    return tokens
  } catch (error) {
    console.error('Token exchange error:', error)
    return null
  }
}

// User info endpoint'inden kullanıcı bilgilerini al
async function getUserInfo(accessToken: string): Promise<OAuthUserInfo | null> {
  try {
    console.log('Getting user info...')
    console.log('User info URL:', OAUTH_CONFIG.userInfoUrl)

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
    console.log('User info received from OAuth:', {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      preferred_username: userInfo.preferred_username,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      email_verified: userInfo.email_verified,
      picture: userInfo.picture,
      avatarUrl: userInfo.avatarUrl
    })
    return userInfo
  } catch (error) {
    console.error('User info error:', error)
    return null
  }
}

// Benzersiz username oluştur
async function generateUniqueUsername(prisma: any, baseUsername: string): Promise<string> {
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

    if (!existingUser) {
      break
    }

    finalUsername = `${username}_${counter}`
    counter++
  }

  return finalUsername
}

// Kullanıcıyı sistemde oluştur veya güncelle
async function createOrUpdateUser(userInfo: OAuthUserInfo): Promise<User> {
  try {
    // Prisma client'ı import et
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    console.log('Creating/updating user with info:', {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      avatarUrl: userInfo.avatarUrl,
      preferred_username: userInfo.preferred_username,
      email_verified: userInfo.email_verified
    })

    // Avatar URL'ini belirle
    const avatarUrl = userInfo.avatarUrl || userInfo.picture ||
      `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(userInfo.email || userInfo.sub).digest('hex')}?d=identicon&s=200`

    // Benzersiz username oluştur
    const uniqueUsername = await generateUniqueUsername(prisma, userInfo.preferred_username || userInfo.name || 'user')

    // Kullanıcıyı email ile bul veya oluştur
    const savedUser = await prisma.user.upsert({
      where: { email: userInfo.email || `${userInfo.sub}@oauth.user` },
      update: {
        name: userInfo.name || userInfo.preferred_username || 'OAuth User',
        email: userInfo.email || `${userInfo.sub}@oauth.user`,
        avatarUrl: avatarUrl,
        username: uniqueUsername,
        emailVerified: userInfo.email_verified || false,
        oauthProvider: 'cengel_studio',
        oauthId: userInfo.sub,
        lastOAuthSync: new Date(),
        updatedAt: new Date()
      },
      create: {
        name: userInfo.name || userInfo.preferred_username || 'OAuth User',
        email: userInfo.email || `${userInfo.sub}@oauth.user`,
        avatarUrl: avatarUrl,
        username: uniqueUsername,
        emailVerified: userInfo.email_verified || false,
        oauthProvider: 'cengel_studio',
        oauthId: userInfo.sub,
        lastOAuthSync: new Date(),
        role: 'USER'
      }
    })

    console.log('User saved/updated:', savedUser)

    await prisma.$disconnect()

    return {
      id: savedUser.id,
      name: savedUser.name || 'OAuth User',
      email: savedUser.email,
      avatarUrl: savedUser.avatarUrl,
      birthDate: savedUser.birthDate,
      role: savedUser.role as 'USER' | 'ADMIN' | 'MODERATOR',
      createdAt: savedUser.createdAt,
      oauthProvider: 'cengel_studio',
      oauthId: userInfo.sub,
      username: savedUser.username,
      emailVerified: savedUser.emailVerified
    }
  } catch (error) {
    console.error('Error creating/updating user:', error)

    // Fallback: demo user döndür
    const fallbackUsername = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    return {
      id: parseInt(userInfo.sub) || Math.floor(Math.random() * 1000000),
      name: userInfo.name || userInfo.preferred_username || 'OAuth User',
      email: userInfo.email || `${userInfo.sub}@oauth.user`,
      avatarUrl: userInfo.avatarUrl || userInfo.picture || `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(userInfo.email || userInfo.sub).digest('hex')}?d=identicon&s=200`,
      birthDate: null,
      role: 'USER',
      createdAt: new Date(),
      oauthProvider: 'cengel_studio',
      oauthId: userInfo.sub,
      username: fallbackUsername,
      emailVerified: userInfo.email_verified || false
    }
  }
}
