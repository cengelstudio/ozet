import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import {
    exchangeCodeForTokens,
    getUserInfo,
    mapOAuthUserToUser,
    encryptToken,
    isTokenExpired,
    refreshAccessToken
} from '@/utils/oauth'
import { OAUTH_ERROR_MESSAGES } from '@/config/oauth'

const prisma = new PrismaClient()

// OAuth callback handler
export async function GET(request: NextRequest) {
    try {
        console.log('OAuth callback request URL:', request.url)
        const { searchParams } = new URL(request.url)

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
        const codeVerifier = request.cookies.get('oauth_code_verifier')?.value

        if (!storedState || storedState !== state || !codeVerifier) {
            const redirectUrl = new URL('/giris', baseUrl)
            redirectUrl.searchParams.set('error', 'invalid_state')
            return NextResponse.redirect(redirectUrl)
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code, codeVerifier)
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

        // Debug: User info'yu logla
        console.log('Raw OAuth User Info:', JSON.stringify(userInfo, null, 2))

        // Create or update user in database
        const user = await createOrUpdateUser(userInfo, tokens)
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
        const session = await createSession(user, tokens)
        if (!session) {
            const redirectUrl = new URL('/giris', baseUrl)
            redirectUrl.searchParams.set('error', 'session_creation_failed')
            return NextResponse.redirect(redirectUrl)
        }

        // Redirect to success page
        const redirectUrl = new URL('/', baseUrl)
        redirectUrl.searchParams.set('oauth_success', 'true')
        redirectUrl.searchParams.set('session_handle', session.handle)

        const response = NextResponse.redirect(redirectUrl)

        // Set session cookie
        response.cookies.set('session_handle', session.handle, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        })

        // Clear OAuth cookies
        response.cookies.delete('oauth_state')
        response.cookies.delete('oauth_code_verifier')

        return response

    } catch (error) {
        console.error('OAuth callback error:', error)
        const baseUrl = 'https://ozet.today'
        const redirectUrl = new URL('/giris', baseUrl)
        redirectUrl.searchParams.set('error', 'oauth_error')
        return NextResponse.redirect(redirectUrl)
    }
}

// Kullanıcıyı veritabanında oluştur veya güncelle
async function createOrUpdateUser(userInfo: any, tokens: any) {
    try {
        const userData = mapOAuthUserToUser(userInfo)

        // Token'ları şifrele
        const encryptedAccessToken = encryptToken(tokens.access_token)
        const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null
        const encryptedIdToken = tokens.id_token ? encryptToken(tokens.id_token) : null

        // Token geçerlilik süresini hesapla
        const tokenExpiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

        // Update data'sını hazırla
        const updateData: any = {
            ...userData,
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            idToken: encryptedIdToken,
            tokenExpiresAt: tokenExpiresAt,
            lastOAuthSync: new Date(),
            updatedAt: new Date()
        }

        // Create data'sını hazırla
        const createData: any = {
            ...userData,
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            idToken: encryptedIdToken,
            tokenExpiresAt: tokenExpiresAt,
            lastOAuthSync: new Date(),
            role: 'USER'
        }

        // Undefined değerleri filtrele
        const filterUndefined = (obj: any) => {
            const filtered: any = {}
            Object.keys(obj).forEach(key => {
                if (obj[key] !== undefined && obj[key] !== null) {
                    filtered[key] = obj[key]
                }
            })
            return filtered
        }

        const filteredUpdateData = filterUndefined(updateData)
        const filteredCreateData = filterUndefined(createData)

        // Kullanıcıyı email ile bul veya oluştur
        const savedUser = await prisma.user.upsert({
            where: { email: userData.email || `${userData.oauthId}@oauth.user` },
            update: filteredUpdateData,
            create: filteredCreateData
        })

        console.log('User saved/updated:', savedUser)
        return savedUser
    } catch (error) {
        console.error('Error creating/updating user:', error)
        throw error
    }
}

// Session oluştur
async function createSession(user: any, tokens: any) {
    try {
        const sessionHandle = `oauth-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        const session = await prisma.session.create({
            data: {
                handle: sessionHandle,
                expiresAt: expiresAt,
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
                    tokens: {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        id_token: tokens.id_token
                    }
                })
            }
        })

        console.log('Session created:', session)
        return session
    } catch (error) {
        console.error('Error creating session:', error)
        return null
    }
}
