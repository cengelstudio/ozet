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
}

export interface OAuthUserInfo {
  sub: string
  name?: string
  email?: string
  picture?: string
  avatarUrl?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  email_verified?: boolean
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
