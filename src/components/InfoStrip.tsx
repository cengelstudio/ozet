'use client'

import { MarketData, WeatherData } from '@/types/market'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { CloudIcon, SunIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { getMarketData } from '@/services/market'
import { getWeatherData } from '@/services/weather'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function InfoStrip() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    condition: 'Yükleniyor...',
    icon: 'cloud',
    city: 'İstanbul'
  })

  useEffect(() => {
    // Piyasa verilerini güncelle
    const updateMarketData = async () => {
      try {
        const data = await getMarketData()
        if (data.length > 0) {
          setMarketData(data)
        }
      } catch (error) {
        console.error('Market data update error:', error)
      }
    }

    // Hava durumu verilerini güncelle
    const updateWeatherData = async () => {
      try {
        const data = await getWeatherData()
        setWeather(data)
      } catch (error) {
        console.error('Weather data update error:', error)
      }
    }

    // İlk yükleme
    updateMarketData()
    updateWeatherData()

    // Her 1 dakikada bir güncelle
    const interval = setInterval(() => {
      updateMarketData()
      updateWeatherData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-8 items-center justify-between text-xs">
          <div className="flex-1 overflow-hidden">
            <div className="flex divide-x divide-gray-200 animate-scroll">
              {/* Original data */}
              {marketData.map((item) => (
                <div key={item.symbol} className="flex items-center space-x-2 px-3 first:pl-0 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{item.symbol}</span>
                  <span className="tabular-nums font-medium text-gray-900">
                    {item.symbol === 'BIST 100' ? item.price.toFixed(0) :
                     item.symbol === 'FAİZ' ? item.price.toFixed(2) + '%' :
                     item.symbol === 'BITCOIN' ? item.price.toFixed(0) :
                     item.price.toFixed(2)}
                  </span>
                  <span
                    className={classNames(
                      item.change >= 0 ? 'text-green-600' : 'text-[#ff0102]',
                      'flex items-center tabular-nums font-medium'
                    )}
                  >
                    {item.change >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {Math.abs(item.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
              {/* Duplicate data for seamless scrolling */}
              {marketData.map((item) => (
                <div key={`${item.symbol}-duplicate`} className="flex items-center space-x-2 px-3 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{item.symbol}</span>
                  <span className="tabular-nums font-medium text-gray-900">
                    {item.symbol === 'BIST 100' ? item.price.toFixed(0) :
                     item.symbol === 'FAİZ' ? item.price.toFixed(2) + '%' :
                     item.symbol === 'BITCOIN' ? item.price.toFixed(0) :
                     item.price.toFixed(2)}
                  </span>
                  <span
                    className={classNames(
                      item.change >= 0 ? 'text-green-600' : 'text-[#ff0102]',
                      'flex items-center tabular-nums font-medium'
                    )}
                  >
                    {item.change >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {Math.abs(item.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 pl-3 border-l border-gray-200 flex-shrink-0">
            {weather.icon === 'sun' ? (
              <SunIcon className="h-4 w-4 text-yellow-500" />
            ) : (
              <CloudIcon className="h-4 w-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-900">{weather.city}</span>
            <span className="font-medium text-gray-900">{weather.temp}°C</span>
            <span className="text-gray-600">{weather.condition}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
