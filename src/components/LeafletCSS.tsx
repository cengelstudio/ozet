'use client'

import { useEffect } from 'react'
import L from 'leaflet'

export default function LeafletCSS() {
  useEffect(() => {
    // Leaflet CSS'ini dinamik olarak yükle
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Custom favicon marker icon oluştur
    const faviconIcon = L.divIcon({
      html: '<img src="/favicon.png" style="width: 32px; height: 32px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));" />',
      className: 'custom-favicon-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    })

    // Global olarak favicon icon'u tanımla
    ;(window as any).faviconIcon = faviconIcon

    return () => {
      // Cleanup
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (existingLink) {
        existingLink.remove()
      }
    }
  }, [])

  return null
}
