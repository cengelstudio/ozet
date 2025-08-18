import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import { decryptToken, isTokenExpired, refreshAccessToken, getUserInfo, encryptToken } from '@/utils/oauth'

const prisma = new PrismaClient()

// OAuth bağlantısının sürdüğünü kontrol et
export async function GET(request: NextRequest) {
    try {
        const sessionHandle = request.cookies.get('session_handle')?.value

        if (!sessionHandle) {
            return NextResponse.json({
                isAuthenticated: false,
                error: 'session_not_found'
            })
        }

        // Session'ı veritabanından al
        const session = await prisma.session.findUnique({
            where: { handle: sessionHandle },
            include: { user: true }
        })

        if (!session || !session.user) {
            return NextResponse.json({
                isAuthenticated: false,
                error: 'session_not_found'
            })
        }

        // Session süresini kontrol et
        if (session.expiresAt < new Date()) {
            // Session'ı sil
            await prisma.session.delete({
                where: { handle: sessionHandle }
            })

            return NextResponse.json({
                isAuthenticated: false,
                error: 'session_expired'
            })
        }

        const user = session.user

        // Token'ların geçerliliğini kontrol et
        if (!user.accessToken || !user.tokenExpiresAt) {
            return NextResponse.json({
                isAuthenticated: false,
                error: 'no_tokens'
            })
        }

        // Token süresini kontrol et
        if (isTokenExpired(user.tokenExpiresAt)) {
            // Refresh token ile yeni access token al
            if (user.refreshToken) {
                const decryptedRefreshToken = decryptToken(user.refreshToken)
                const newTokens = await refreshAccessToken(decryptedRefreshToken)

                if (newTokens) {
                    // Yeni token'ları kaydet
                    const encryptedAccessToken = encryptToken(newTokens.access_token)
                    const encryptedRefreshToken = newTokens.refresh_token ? encryptToken(newTokens.refresh_token) : user.refreshToken
                    const newTokenExpiresAt = new Date(Date.now() + (newTokens.expires_in * 1000))

                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            accessToken: encryptedAccessToken,
                            refreshToken: encryptedRefreshToken,
                            tokenExpiresAt: newTokenExpiresAt,
                            lastOAuthSync: new Date()
                        }
                    })

                    // UserInfo'yu güncelle
                    const userInfo = await getUserInfo(newTokens.access_token)
                    if (userInfo) {
                        const userData = {
                            name: userInfo.name || userInfo.displayName || userInfo.preferred_username,
                            displayName: userInfo.displayName,
                            email: userInfo.email?.username ? `${userInfo.email.username}@${userInfo.email.domain}` : userInfo.email,
                            username: userInfo.preferred_username,
                            emailVerified: userInfo.email?.isVerified || userInfo.email_verified || false,
                            avatarUrl: userInfo.avatar?.baseUrl + userInfo.avatar?.path || userInfo.avatarUrl || userInfo.picture,
                            about: userInfo.about,
                            location: userInfo.location,
                            website: userInfo.website,
                            phone: userInfo.phone,
                            language: userInfo.language || 'tr',
                            birthDate: userInfo.birthDate ? new Date(userInfo.birthDate) : null,
                            lastOAuthSync: new Date()
                        }

                        await prisma.user.update({
                            where: { id: user.id },
                            data: userData
                        })
                    }

                    return NextResponse.json({
                        isAuthenticated: true,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            avatarUrl: user.avatarUrl,
                            username: user.username,
                            role: user.role,
                            emailVerified: user.emailVerified,
                            oauthProvider: user.oauthProvider,
                            oauthId: user.oauthId
                        },
                        tokenRefreshed: true
                    })
                } else {
                    // Refresh token geçersiz, kullanıcıyı logout yap
                    await prisma.session.delete({
                        where: { handle: sessionHandle }
                    })

                    return NextResponse.json({
                        isAuthenticated: false,
                        error: 'token_refresh_failed'
                    })
                }
            } else {
                // Refresh token yok, kullanıcıyı logout yap
                await prisma.session.delete({
                    where: { handle: sessionHandle }
                })

                return NextResponse.json({
                    isAuthenticated: false,
                    error: 'no_refresh_token'
                })
            }
        }

        // OAuth bağlantısını test et
        const decryptedAccessToken = decryptToken(user.accessToken)
        const userInfo = await getUserInfo(decryptedAccessToken)

        if (!userInfo) {
            // OAuth bağlantısı kesildi, kullanıcıyı logout yap
            await prisma.session.delete({
                where: { handle: sessionHandle }
            })

            return NextResponse.json({
                isAuthenticated: false,
                error: 'oauth_connection_failed'
            })
        }

        // Başarılı - kullanıcı hala bağlı
        return NextResponse.json({
            isAuthenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                username: user.username,
                role: user.role,
                emailVerified: user.emailVerified,
                oauthProvider: user.oauthProvider,
                oauthId: user.oauthId
            }
        })

    } catch (error) {
        console.error('Auth check error:', error)
        return NextResponse.json({
            isAuthenticated: false,
            error: 'server_error'
        })
    }
}
