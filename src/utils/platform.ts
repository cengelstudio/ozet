import axios from 'axios'

// Ana domain'i çıkaran fonksiyon
export function extractMainDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.hostname.split('.')
    const mainDomain = parts.length > 2 ? parts.slice(-2).join('.') : urlObj.hostname
    return mainDomain.replace('www.', '')
  } catch {
    return url
  }
}

// Platform meta bilgilerini çeken fonksiyon
export async function fetchPlatformMeta(domain: string) {
  try {
    const mainDomain = extractMainDomain(domain)
    const url = `https://${mainDomain}`

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    const html = response.data

    // Meta bilgilerini çek
    const meta = {
      title: '',
      description: '',
      image: '',
      url: url
    }

    // Title
    const titleMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*name="twitter:site:title"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*name="application-name"[^>]*content="([^"]+)"/i) ||
                      html.match(/<title[^>]*>([^<]+)<\/title>/i)
    meta.title = titleMatch ? titleMatch[1] : mainDomain

    // Description
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ||
                     html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i) ||
                     html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    meta.description = descMatch ? descMatch[1] : `${mainDomain} - Haber sitesi`

    // Image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
                      html.match(/<meta[^>]*property="og:logo"[^>]*content="([^"]+)"/i) ||
                      html.match(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i) ||
                      html.match(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/i)

    if (imageMatch) {
      meta.image = imageMatch[1]
      if (!meta.image.startsWith('http')) {
        meta.image = new URL(meta.image, url).href
      }
    }

    return meta
  } catch (error) {
    console.error(`Platform meta hatası (${domain}):`, error)
    return {
      title: domain,
      description: `${domain} - Haber sitesi`,
      image: null,
      url: `https://${domain}`
    }
  }
}
