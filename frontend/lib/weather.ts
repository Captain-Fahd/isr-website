import { API_BASE_URL } from '@/lib/api'

export type WeatherData = {
  current: {
    temp_c: number
    condition: {
      text: string
      icon: string
    }
  }
}

export type WeatherResponse = {
  data: WeatherData
}

export function getWeatherIconUrl(icon: string): string {
  return icon.startsWith('//') ? `https:${icon}` : icon
}

export async function fetchWeather(): Promise<WeatherData> {
  const response = await fetch(`${API_BASE_URL}/api/weather`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather')
  }

  const json = (await response.json()) as WeatherResponse
  return json.data
}
