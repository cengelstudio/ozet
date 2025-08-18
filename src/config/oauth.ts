import { OAuthConfig } from '@/types/user'

// OAuth Configuration - Production settings
export const OAUTH_CONFIG: OAuthConfig = {
  clientId: 'pSsyy6i3D7rGyK8Hpt68Uw',
  clientSecret: 'u3huMcdhrkUR9zVcODYIPGGg2fFgGbbb7JIwOI-juw0',
  redirectUri: 'https://ozet.today/api/oauth-callback',
  authUrl: 'https://id.cengel.studio/api/v2/oauth/authorize',
  tokenUrl: 'https://id.cengel.studio/api/v2/oauth/token',
  userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo',
  scope: 'openid profile email details phone'
}

// OAuth error mesajları
export const OAUTH_ERROR_MESSAGES = {
  oauth_error: 'OAuth işlemi sırasında bir hata oluştu',
  invalid_callback: 'Geçersiz callback parametreleri',
  invalid_state: 'Güvenlik doğrulaması başarısız',
  token_exchange_failed: 'Token değişimi başarısız',
  user_info_failed: 'Kullanıcı bilgileri alınamadı',
  session_creation_failed: 'Oturum oluşturulamadı',
  invalid_request: 'Geçersiz istek',
  unauthorized_client: 'Yetkisiz istemci',
  access_denied: 'Erişim reddedildi',
  unsupported_response_type: 'Desteklenmeyen yanıt türü',
  invalid_scope: 'Geçersiz kapsam',
  server_error: 'Sunucu hatası',
  temporarily_unavailable: 'Geçici olarak kullanılamıyor',
  invalid_grant: 'Geçersiz yetkilendirme kodu',
  invalid_token: 'Geçersiz token',
  insufficient_scope: 'Yetersiz kapsam'
}

// PKCE için güvenlik ayarları
export const PKCE_CONFIG = {
  codeChallengeMethod: 'S256',
  codeVerifierLength: 128
}

// Token ayarları
export const TOKEN_CONFIG = {
  accessTokenExpiry: 3600, // 1 saat
  refreshTokenExpiry: 30 * 24 * 60 * 60, // 30 gün
  sessionExpiry: 30 * 24 * 60 * 60 // 30 gün
}
