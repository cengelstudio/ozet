// OAuth Configuration for Cengel Studio
export const OAUTH_CONFIG = {
  clientId: 'pSsyy6i3D7rGyK8Hpt68Uw',
  clientSecret: 'u3huMcdhrkUR9zVcODYIPGGg2fFgGbbb7JIwOI-juw0',
  redirectUri: 'https://ozet.today/api/oauth',
  authUrl: 'https://id.cengel.studio/api/v2/oauth/authorize',
  tokenUrl: 'https://id.cengel.studio/api/v2/oauth/token',
  userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo',
  scope: 'openid profile email'
} as const

export const OAUTH_ERROR_MESSAGES = {
  oauth_error: 'OAuth giriş işlemi sırasında bir hata oluştu',
  invalid_callback: 'Geçersiz callback parametreleri',
  invalid_state: 'Güvenlik doğrulaması başarısız',
  token_exchange_failed: 'Token değişimi başarısız oldu',
  user_info_failed: 'Kullanıcı bilgileri alınamadı',
  access_denied: 'Giriş işlemi reddedildi',
  session_creation_failed: 'Oturum oluşturulamadı',
  session_expired: 'Oturum süresi doldu',
  session_not_found: 'Oturum bulunamadı',
  token_expired: 'Token süresi doldu',
  user_mismatch: 'Kullanıcı bilgileri uyuşmuyor',
  app_disconnected: 'Uygulama bağlantısı kesildi',
  session_corrupted: 'Oturum bilgileri bozuk',
  verification_failed: 'Token doğrulama başarısız'
} as const
