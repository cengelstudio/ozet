export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export interface WeatherData {
  temp: number
  condition: string
  icon: string
  city: string
}
