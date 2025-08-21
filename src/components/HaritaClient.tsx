'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { XMarkIcon } from '@heroicons/react/24/outline'
import moment from 'moment'
import 'moment/locale/tr'

// Moment.js'i Türkçe olarak ayarla
moment.locale('tr')

// Leaflet bileşenlerini dynamic import ile yükle (SSR sorununu çözer)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Leaflet CSS'ini client-side'da yükle
const LeafletCSS = dynamic(() => import('./LeafletCSS'), { ssr: false })

interface Location {
  location: string
  newsCount: number
  news: Array<{
    id: number
    title: string
    description: string | null
    publishedAt: string
    platform: {
      name: string
      avatarUrl: string
      domain: string
    }
  }>
  lat: number
  lon: number
  displayName: string | null
}

interface MapLocation {
  location: string
  newsCount: number
  news: Location['news']
  lat: number
  lon: number
  displayName: string | null
}

export default function HaritaClient() {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [faviconLoaded, setFaviconLoaded] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  // Modal açıkken sayfa scroll'unu engelle
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  // Favicon icon'un yüklenmesini kontrol et
  useEffect(() => {
    const checkFaviconIcon = () => {
      if ((window as any).faviconIcon) {
        setFaviconLoaded(true)
      } else {
        setTimeout(checkFaviconIcon, 100)
      }
    }

    checkFaviconIcon()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)

      // Locations API'sinden verileri al (koordinatlar dahil)
      const response = await fetch('/api/news/locations')
      const data = await response.json()

      if (!data.success) {
        throw new Error('Locations API error')
      }

      // API'den gelen veriler zaten koordinatları içeriyor
      setLocations(data.data.locations)

    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (location: MapLocation) => {
    setSelectedLocation(location)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLocation(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0">
      {/* Leaflet CSS'ini yükle */}
      <LeafletCSS />

      {/* Harita Container */}
      <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[39.9334, 32.8597]} // Türkiye merkezi
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {faviconLoaded && locations.map((location) => (
            <Marker
              key={location.location}
              position={[location.lat, location.lon]}
              icon={(window as any).faviconIcon}
              eventHandlers={{
                click: () => handleMarkerClick(location)
              }}
            />
          ))}
        </MapContainer>
      </div>

                        {/* Modal Portal */}
      {showModal && selectedLocation && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedLocation.location}</h2>
                  {selectedLocation.displayName && (
                    <p className="text-sm text-gray-500 mt-1">{selectedLocation.displayName}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{selectedLocation.newsCount} haber bulundu</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="space-y-4">
                {selectedLocation.news.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      {/* Platform Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.platform.avatarUrl}
                          alt={item.platform.name}
                          className="w-8 h-8 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-platform.png'
                          }}
                        />
                      </div>

                      {/* Haber İçeriği */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.platform.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {moment(item.publishedAt).fromNow()}
                          </span>
                        </div>

                        <a
                          href={`/haber/${item.id}`}
                          className="block hover:no-underline"
                        >
                          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                        </a>

                        {item.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
