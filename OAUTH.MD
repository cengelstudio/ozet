# OAuth Servisi API İşleyişi - Güncel ve Detaylı

Bu dokümanda, OAuth 2.0 servisinin API işleyişini gerçek verilerle açıklayacağım.

## 📋 İçindekiler
1. [OAuth 2.0 Nedir?](#oauth-20-nedir)
2. [API Endpoint'leri](#api-endpointleri)
3. [Scope Sistemi](#scope-sistemi)
4. [OAuth Akışı](#oauth-akışı)
5. [Güvenlik Mekanizmaları](#güvenlik-mekanizmaları)
6. [Token Türleri](#token-türleri)
7. [Gerçek API Yanıtları](#gerçek-api-yanıtları)
8. [Hata Yönetimi](#hata-yönetimi)

---

## 🔐 OAuth 2.0 Nedir?

OAuth 2.0, üçüncü taraf uygulamaların kullanıcı adına kaynaklara erişim sağlamasına izin veren bir yetkilendirme protokolüdür.

### Temel Aktörler:
- **Resource Owner (Kaynak Sahibi)**: Kullanıcı
- **Client (İstemci)**: Uygulama (web, mobil, desktop)
- **Authorization Server (Yetkilendirme Sunucusu)**: OAuth sağlayıcısı
- **Resource Server (Kaynak Sunucusu)**: API sunucusu

---

## 🌐 API Endpoint'leri

### 1. Authorization Endpoint
```
GET /api/v2/oauth/authorize
```

**Amaç:** Kullanıcıyı giriş sayfasına yönlendirir ve yetkilendirme kodu alır.

**Parametreler:**
- `response_type`: "code" (authorization code flow için)
- `client_id`: Uygulama kimliği
- `redirect_uri`: Geri dönüş adresi
- `scope`: İstenen izinler
- `state`: CSRF koruması için rastgele değer
- `code_challenge`: PKCE için güvenlik kodu
- `code_challenge_method`: "S256" (SHA256)

**Örnek İstek:**
```
GET /api/v2/oauth/authorize?
  response_type=code&
  client_id=pSsyy6i3D7rGyK8Hpt68Uw&
  redirect_uri=https://ozet.today/api/oauth-callback&
  scope=openid%20profile%20email%20details%20phone&
  state=abc123&
  code_challenge=xyz789&
  code_challenge_method=S256
```

### 2. Token Endpoint
```
POST /api/v2/oauth/token
```

**Amaç:** Authorization code'u access token'a çevirir.

**Parametreler:**
- `grant_type`: "authorization_code"
- `code`: Authorization endpoint'ten dönen kod
- `redirect_uri`: Authorization'da kullanılan aynı URI
- `client_id`: Uygulama kimliği
- `client_secret`: Uygulama gizli anahtarı (varsa)
- `code_verifier`: PKCE verifier'ı

**Başarılı Yanıt:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def456ghi789",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. UserInfo Endpoint
```
GET /api/v2/oauth/userinfo
```

**Amaç:** Access token ile kullanıcı bilgilerini alır.

**Headers:**
- `Authorization: Bearer {access_token}`

---

## 📋 Scope Sistemi

### Mevcut Scope'lar:

| Scope | Açıklama | Dönen Veriler |
|-------|----------|---------------|
| `openid` | OpenID Connect kimlik doğrulama | Temel kimlik bilgileri |
| `profile` | Kullanıcı profil bilgileri | displayName, username, avatar, birthDate, about |
| `email` | E-posta adresi | email objesi (username, domain, isVerified) |
| `details` | Website ve konum bilgileri | website, location |
| `phone` | Telefon numarası | phone |

### Scope Kullanımı:

**Tüm Scope'ları İsteme:**
```
scope=openid profile email details phone
```

**Sadece Temel Bilgiler:**
```
scope=openid profile email
```

**Sadece İletişim Bilgileri:**
```
scope=openid email phone
```

---

## 🔄 OAuth Akışı

### Adım 1: Kullanıcı Girişi
```
Kullanıcı → Uygulama → Authorization Endpoint
```

1. Kullanıcı uygulamada "Giriş Yap" butonuna tıklar
2. Uygulama authorization URL'ini oluşturur
3. Kullanıcı OAuth sağlayıcısının giriş sayfasına yönlendirilir

### Adım 2: Yetkilendirme
```
Kullanıcı → OAuth Sağlayıcısı → Kullanıcı
```

1. Kullanıcı kimlik bilgilerini girer
2. İstenen izinleri onaylar
3. OAuth sağlayıcısı authorization code üretir

### Adım 3: Kod Dönüşü
```
OAuth Sağlayıcısı → Uygulama (Callback)
```

1. OAuth sağlayıcısı kullanıcıyı callback URL'ine yönlendirir
2. URL'de authorization code ve state parametreleri bulunur
3. Uygulama bu parametreleri alır

### Adım 4: Token Değişimi
```
Uygulama → Token Endpoint → OAuth Sağlayıcısı
```

1. Uygulama authorization code'u token endpoint'ine gönderir
2. OAuth sağlayıcısı kodu doğrular
3. Access token, refresh token ve id token döner

### Adım 5: Kaynak Erişimi
```
Uygulama → UserInfo Endpoint → OAuth Sağlayıcısı
```

1. Uygulama access token ile userinfo endpoint'ine istek gönderir
2. Kullanıcı bilgileri döner
3. Uygulama bu bilgileri kullanır

---

## 🔒 Güvenlik Mekanizmaları

### 1. State Parametresi
**Amaç:** CSRF (Cross-Site Request Forgery) saldırılarını önler

**Nasıl Çalışır:**
1. Uygulama rastgele bir state değeri üretir
2. Bu değeri authorization isteğinde gönderir
3. Callback'te gelen state değerini kontrol eder
4. Eşleşmezse isteği reddeder

### 2. PKCE (Proof Key for Code Exchange)
**Amaç:** Authorization code interception saldırılarını önler

**Nasıl Çalışır:**
1. **Code Verifier:** Uygulama rastgele bir string üretir
2. **Code Challenge:** Verifier'ın SHA256 hash'i alınır
3. **Authorization:** Challenge gönderilir
4. **Token Exchange:** Verifier gönderilir

### 3. Client Secret
**Amaç:** Uygulama kimliğini doğrular

### 4. Redirect URI Doğrulama
**Amaç:** Yetkisiz callback URL'lerini önler

---

## 🎫 Token Türleri

### 1. Access Token
**Amaç:** API kaynaklarına erişim sağlar

**Özellikler:**
- Kısa ömürlü (genellikle 1 saat)
- Bearer token formatında
- JWT veya opaque token olabilir

### 2. Refresh Token
**Amaç:** Yeni access token almak için kullanılır

**Özellikler:**
- Uzun ömürlü (günler/haftalar)
- Güvenli saklanmalı
- İsteğe bağlı

### 3. ID Token (OpenID Connect)
**Amaç:** Kullanıcı kimlik bilgilerini içerir

**Özellikler:**
- JWT formatında
- Kullanıcı bilgilerini içerir
- İmzalı ve şifrelenmiş

---

## 📊 Gerçek API Yanıtları

### UserInfo Endpoint Yanıtı (Tüm Scope'lar Aktif)

**İstek:**
```
GET /api/v2/oauth/userinfo
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Yanıt:**
```json
{
  "createdAt": "2025-08-16T05:41:37.055000+00:00",
  "id": "141417237180452864",
  "language": "en",
  "user": {
    "about": "In a world of ones and zeros, Duru was born to understand. Not just smart, but intuitive — your AI companion that learns, grows, and evolves with you.",
    "avatar": {
      "baseUrl": "https://id.cengel.studio",
      "color": "#000",
      "path": "/avatars/141417237180452864/latest"
    },
    "birthDate": "2004-12-28T00:00:00+00:00",
    "displayName": "duru!",
    "email": {
      "domain": "example.com",
      "isVerified": false,
      "username": "test"
    },
    "location": "Ulus, İstanbul",
    "phone": "+90 533 163 63 08",
    "username": "duru",
    "website": "https://cengel.company"
  }
}
```

### Veri Yapısı Analizi

#### Üst Seviye Alanlar:
- `createdAt`: Hesap oluşturma tarihi (ISO 8601 formatında)
- `id`: Kullanıcı benzersiz kimliği
- `language`: Kullanıcı dil tercihi

#### User Objesi:
- `about`: Kullanıcı hakkında bilgi (profile scope)
- `avatar`: Profil resmi bilgileri (profile scope)
  - `baseUrl`: Avatar sunucu adresi
  - `color`: Avatar rengi
  - `path`: Avatar dosya yolu
- `birthDate`: Doğum tarihi (profile scope)
- `displayName`: Görünen ad (profile scope)
- `email`: E-posta bilgileri (email scope)
  - `domain`: E-posta domain'i
  - `isVerified`: E-posta doğrulama durumu
  - `username`: E-posta kullanıcı adı
- `location`: Konum bilgisi (details scope)
- `phone`: Telefon numarası (phone scope)
- `username`: Kullanıcı adı (profile scope)
- `website`: Website adresi (details scope)

### Scope Bazlı Yanıt Örnekleri

#### Sadece `openid profile` scope'ları:
```json
{
  "createdAt": "2025-08-16T05:41:37.055000+00:00",
  "id": "141417237180452864",
  "language": "en",
  "user": {
    "about": "In a world of ones and zeros...",
    "avatar": {
      "baseUrl": "https://id.cengel.studio",
      "color": "#000",
      "path": "/avatars/141417237180452864/latest"
    },
    "birthDate": "2004-12-28T00:00:00+00:00",
    "displayName": "duru!",
    "username": "duru"
  }
}
```

#### Sadece `openid email` scope'ları:
```json
{
  "createdAt": "2025-08-16T05:41:37.055000+00:00",
  "id": "141417237180452864",
  "language": "en",
  "user": {
    "email": {
      "domain": "example.com",
      "isVerified": false,
      "username": "test"
    }
  }
}
```

#### Sadece `openid details` scope'ları:
```json
{
  "createdAt": "2025-08-16T05:41:37.055000+00:00",
  "id": "141417237180452864",
  "language": "en",
  "user": {
    "location": "Ulus, İstanbul",
    "website": "https://cengel.company"
  }
}
```

#### Sadece `openid phone` scope'ları:
```json
{
  "createdAt": "2025-08-16T05:41:37.055000+00:00",
  "id": "141417237180452864",
  "language": "en",
  "user": {
    "phone": "+90 533 163 63 08"
  }
}
```

---

## ⚠️ Hata Yönetimi

### 1. Authorization Hataları
**Hata Parametreleri:**
- `error`: Hata türü
- `error_description`: Hata açıklaması
- `state`: Orijinal state değeri

**Yaygın Hatalar:**
```
error=invalid_request
error=unauthorized_client
error=access_denied
error=unsupported_response_type
error=invalid_scope
error=server_error
error=temporarily_unavailable
```

### 2. Token Hataları
**HTTP Status Codes:**
- `400 Bad Request`: Geçersiz parametreler
- `401 Unauthorized`: Geçersiz client credentials
- `403 Forbidden`: Yetkisiz erişim

**Hata Yanıtı:**
```json
{
  "error": "invalid_grant",
  "error_description": "The authorization code is invalid or expired"
}
```

### 3. UserInfo Hataları
**HTTP Status Codes:**
- `401 Unauthorized`: Geçersiz access token
- `403 Forbidden`: Yetersiz scope

---

## 📡 API İstekleri ve Yanıtları

### Authorization İsteği (Tüm Scope'lar)
```
GET /api/v2/oauth/authorize?
  response_type=code&
  client_id=pSsyy6i3D7rGyK8Hpt68Uw&
  redirect_uri=https://ozet.today/api/oauth-callback&
  scope=openid%20profile%20email%20details%20phone&
  state=abc123&
  code_challenge=xyz789&
  code_challenge_method=S256
```

**Başarılı Yanıt:**
```
HTTP/1.1 302 Found
Location: https://ozet.today/api/oauth-callback?code=def456&state=abc123
```

### Token İsteği
```
POST /api/v2/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "def456",
  "redirect_uri": "https://ozet.today/api/oauth-callback",
  "client_id": "pSsyy6i3D7rGyK8Hpt68Uw",
  "code_verifier": "abc123"
}
```

**Başarılı Yanıt:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "ghi789jkl012",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### UserInfo İsteği
```
GET /api/v2/oauth/userinfo
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔄 Refresh Token Akışı

### Refresh Token İsteği
```
POST /api/v2/oauth/token
Content-Type: application/json

{
  "grant_type": "refresh_token",
  "refresh_token": "ghi789jkl012",
  "client_id": "pSsyy6i3D7rGyK8Hpt68Uw"
}
```

**Başarılı Yanıt:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "mno345pqr678"
}
```

---

## 📊 OAuth Akış Diyagramı

```
Kullanıcı                    Uygulama                    OAuth Sağlayıcısı
   |                            |                              |
   | 1. Giriş İsteği            |                              |
   |--------------------------->|                              |
   |                            | 2. Authorization İsteği      |
   |                            |----------------------------->|
   |                            |                              | 3. Giriş Sayfası
   |                            |                              |<-----------------------------|
   |                            |                              | 4. Kimlik Doğrulama
   |                            |                              |<-----------------------------|
   |                            |                              | 5. Authorization Code
   |                            |<-----------------------------|
   | 6. Callback                |                              |
   |<---------------------------|                              |
   |                            | 7. Token İsteği              |
   |                            |----------------------------->|
   |                            | 8. Access Token              |
   |                            |<-----------------------------|
   |                            | 9. UserInfo İsteği           |
   |                            |----------------------------->|
   |                            | 10. Kullanıcı Bilgileri      |
   |                            |<-----------------------------|
   | 11. Giriş Tamamlandı       |                              |
   |<---------------------------|                              |
```

---

## 🛡️ Güvenlik En İyi Uygulamaları

### 1. HTTPS Kullanımı
- Tüm OAuth iletişimi HTTPS üzerinden yapılmalı
- HTTP kullanımı güvenlik açığı oluşturur

### 2. State Parametresi
- Her authorization isteğinde benzersiz state kullanın
- Callback'te state doğrulaması yapın

### 3. PKCE Kullanımı
- Public client'lar için PKCE zorunludur
- Confidential client'lar için de önerilir

### 4. Token Güvenliği
- Access token'ları güvenli saklayın
- Refresh token'ları şifreleyin
- Token'ları client-side'da saklamayın

### 5. Scope Sınırlama
- Sadece gerekli scope'ları isteyin
- Kullanıcıya scope açıklaması verin

### 6. Redirect URI Doğrulama
- Sadece kayıtlı redirect URI'leri kabul edin
- Wildcard kullanımından kaçının

---

## 📝 Özet

Bu OAuth servisi:

1. **5 farklı scope** sunar: `openid`, `profile`, `email`, `details`, `phone`
2. **Zengin kullanıcı verisi** döner (avatar, konum, website, telefon)
3. **Standart OAuth 2.0 protokolü** kullanır
4. **OpenID Connect** desteği sağlar
5. **PKCE güvenlik** mekanizması içerir
6. **Scope tabanlı izin** sistemi sunar
7. **Token tabanlı kimlik doğrulama** yapar
8. **Güvenli callback** mekanizması içerir
9. **Hata yönetimi** sağlar

Bu API, modern web uygulamaları için güvenli ve kapsamlı bir kimlik doğrulama çözümü sunar.
