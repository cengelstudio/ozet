export interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string
  birthDate?: Date | null
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  createdAt: Date
  updatedAt: Date
  oauthProvider?: 'cengel_studio' | 'google' | 'github'
  oauthId?: string
  username?: string
  emailVerified?: boolean
  lastOAuthSync?: Date

  // OAuth.MD'ye göre eklenen alanlar
  displayName?: string
  about?: string
  location?: string
  website?: string
  phone?: string
  language?: string

  // OAuth token'ları
  accessToken?: string
  refreshToken?: string
  idToken?: string
  tokenExpiresAt?: Date
}

export interface OAuthUserInfo {
  sub: string
  name?: string
  email?: string | {
    username: string
    domain: string
    isVerified: boolean
  }
  picture?: string
  avatarUrl?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  email_verified?: boolean

  // OAuth.MD'ye göre eklenen alanlar
  displayName?: string
  about?: string
  birthDate?: string
  location?: string
  website?: string
  phone?: string
  language?: string
  createdAt?: string
  id?: string

  // Avatar objesi
  avatar?: {
    baseUrl: string
    color: string
    path: string
  }

  // User objesi (OAuth.MD'ye göre)
  user?: {
    displayName?: string
    username?: string
    avatar?: {
      baseUrl: string
      color: string
      path: string
    }
    about?: string
    email?: {
      username: string
      domain: string
      isVerified: boolean
    }
    website?: string
    location?: string
    birthDate?: string
    phone?: string
  }
}

export interface OAuthTokens {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope?: string
}

export interface Session {
  handle: string
  expiresAt: Date
  user: User
  tokens?: {
    access_token: string
    refresh_token: string
    id_token: string
  }
}

// OAuth.MD'ye göre eklenen tipler
export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
}

export interface OAuthError {
  error: string
  error_description?: string
  state?: string
}
