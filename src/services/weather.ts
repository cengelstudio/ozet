import { WeatherData } from '@/types/market'

// OpenWeatherMap API için gerekli bilgiler
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

export async function getWeatherData(city: string = 'Istanbul'): Promise<WeatherData> {
  try {
    // API key yoksa fallback data döndür
    if (!WEATHER_API_KEY) {
      return {
        temp: 18,
        condition: 'Parçalı Bulutlu',
        icon: 'cloud',
        city: 'İstanbul'
      }
    }

    const response = await fetch(
      `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=tr`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // API yanıtını kontrol et
    if (!data || !data.weather || !Array.isArray(data.weather) || data.weather.length === 0) {
      throw new Error('Invalid weather data structure')
    }

    // Hava durumu ikonunu belirle
    let icon = 'cloud'
    const weatherMain = data.weather[0]?.main
    if (weatherMain === 'Clear') {
      icon = 'sun'
    }

    return {
      temp: Math.round(data.main?.temp || 0),
      condition: data.weather[0]?.description || 'Bilinmiyor',
      icon,
      city: data.name || city
    }
  } catch (error) {
    console.error('Weather data fetch error:', error)
    return {
      temp: 18,
      condition: 'Veri alınamadı',
      icon: 'cloud',
      city: 'İstanbul'
    }
  }
}
