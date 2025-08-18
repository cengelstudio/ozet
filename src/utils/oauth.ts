import crypto from 'crypto'
import { OAUTH_CONFIG, PKCE_CONFIG } from '@/config/oauth'
import { OAuthUserInfo, OAuthTokens } from '@/types/user'

// PKCE için code verifier ve challenge oluştur
export function generatePKCE() {
    const codeVerifier = crypto.randomBytes(PKCE_CONFIG.codeVerifierLength).toString('base64url')
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')

    return {
        codeVerifier,
        codeChallenge
    }
}

// State parametresi oluştur (CSRF koruması için)
export function generateState(): string {
    return crypto.randomBytes(32).toString('hex')
}

// OAuth authorization URL oluştur
export function createAuthUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: OAUTH_CONFIG.clientId,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        scope: OAUTH_CONFIG.scope,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: PKCE_CONFIG.codeChallengeMethod
    })

    return `${OAUTH_CONFIG.authUrl}?${params.toString()}`
}

// Authorization code'u token ile değiştir
export async function exchangeCodeForTokens(
    code: string,
    codeVerifier: string
): Promise<OAuthTokens | null> {
    try {
        const requestBody = {
            grant_type: 'authorization_code',
            client_id: OAUTH_CONFIG.clientId,
            client_secret: OAUTH_CONFIG.clientSecret,
            code: code,
            redirect_uri: OAUTH_CONFIG.redirectUri,
            code_verifier: codeVerifier
        }

        const response = await fetch(OAUTH_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Token exchange failed:', errorText)
            return null
        }

        const tokens = await response.json()
        return tokens
    } catch (error) {
        console.error('Token exchange error:', error)
        return null
    }
}

// Refresh token ile yeni access token al
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens | null> {
    try {
        const requestBody = {
            grant_type: 'refresh_token',
            client_id: OAUTH_CONFIG.clientId,
            client_secret: OAUTH_CONFIG.clientSecret,
            refresh_token: refreshToken
        }

        const response = await fetch(OAUTH_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Token refresh failed:', errorText)
            return null
        }

        const tokens = await response.json()
        return tokens
    } catch (error) {
        console.error('Token refresh error:', error)
        return null
    }
}

// User info endpoint'inden kullanıcı bilgilerini al
export async function getUserInfo(accessToken: string): Promise<OAuthUserInfo | null> {
    try {
        const response = await fetch(OAUTH_CONFIG.userInfoUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('User info failed:', errorText)
            return null
        }

        const userInfo = await response.json()
        return userInfo
    } catch (error) {
        console.error('User info error:', error)
        return null
    }
}

// Token'ın geçerliliğini kontrol et
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() >= expiresAt
}

// Token'ı şifrele (basit şifreleme - production'da daha güvenli yöntem kullanın)
export function encryptToken(token: string): string {
    const algorithm = 'aes-256-cbc'
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipher(algorithm, key.toString('hex'))
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return iv.toString('hex') + ':' + encrypted
}

// Token'ı çöz (basit şifre çözme - production'da daha güvenli yöntem kullanın)
export function decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-cbc'
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)

    const parts = encryptedToken.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]

    const decipher = crypto.createDecipher(algorithm, key.toString('hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

// OAuth user info'yu User modeline dönüştür
export function mapOAuthUserToUser(oauthUser: OAuthUserInfo): Partial<any> {
    console.log('Mapping OAuth user:', JSON.stringify(oauthUser, null, 2))

    const userData: any = {
        oauthProvider: 'cengel_studio',
        oauthId: oauthUser.id || oauthUser.sub,
        lastOAuthSync: new Date()
    }

    // OAuth.MD'ye göre user bilgileri user objesi içinde geliyor
    const user = oauthUser.user || oauthUser

    // Email bilgisini düzgün şekilde al
    if (user.email) {
        if (typeof user.email === 'string') {
            userData.email = user.email
        } else if (user.email.username && user.email.domain) {
            userData.email = `${user.email.username}@${user.email.domain}`
        }
    }

    // Email yoksa oauthId ile oluştur
    if (!userData.email) {
        userData.email = `${oauthUser.id || oauthUser.sub}@oauth.user`
    }

    // Name bilgisini al
    if (user.displayName) {
        userData.name = user.displayName
    } else if (user.name) {
        userData.name = user.name
    } else if (user.preferred_username) {
        userData.name = user.preferred_username
    } else {
        userData.name = 'OAuth User'
    }

    // Display name
    if (user.displayName) {
        userData.displayName = user.displayName
    }

    // Username
    if (user.username || user.preferred_username) {
        userData.username = user.username || user.preferred_username
    }

    // Email verified
    if (user.email) {
        if (typeof user.email === 'object' && user.email.isVerified !== undefined) {
            userData.emailVerified = user.email.isVerified
        } else if (user.email_verified !== undefined) {
            userData.emailVerified = user.email_verified
        } else {
            userData.emailVerified = false
        }
    }

    // Avatar URL
    if (user.avatar?.baseUrl && user.avatar?.path) {
        userData.avatarUrl = user.avatar.baseUrl + user.avatar.path
    } else if (user.avatarUrl) {
        userData.avatarUrl = user.avatarUrl
    } else if (user.picture) {
        userData.avatarUrl = user.picture
    }

    // Diğer alanlar
    if (user.about) {
        userData.about = user.about
    }
    if (user.location) {
        userData.location = user.location
    }
    if (user.website) {
        userData.website = user.website
    }
    if (user.phone) {
        userData.phone = user.phone
    }
    if (oauthUser.language) {
        userData.language = oauthUser.language
    } else {
        userData.language = 'tr'
    }
    if (user.birthDate) {
        userData.birthDate = new Date(user.birthDate)
    }

    // Undefined değerleri filtrele
    const filteredData: any = {}
    Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
            filteredData[key] = userData[key]
        }
    })

    console.log('Mapped user data:', JSON.stringify(filteredData, null, 2))
    return filteredData
}
