import { describe, expect, test } from 'vitest'
import { getWeatherIconUrl } from '@/lib/weather'

describe('getWeatherIconUrl', () => {
  test('upgrades a protocol-relative WeatherAPI icon to https', () => {
    // WeatherAPI returns icons as `//cdn.weatherapi.com/...`, which next/image
    // and a static export cannot resolve on their own.
    expect(getWeatherIconUrl('//cdn.weatherapi.com/weather/64x64/day/116.png')).toBe(
      'https://cdn.weatherapi.com/weather/64x64/day/116.png',
    )
  })

  test('leaves an absolute https URL untouched', () => {
    expect(getWeatherIconUrl('https://cdn.weatherapi.com/x.png')).toBe(
      'https://cdn.weatherapi.com/x.png',
    )
  })

  test('leaves an absolute http URL untouched', () => {
    expect(getWeatherIconUrl('http://cdn.weatherapi.com/x.png')).toBe(
      'http://cdn.weatherapi.com/x.png',
    )
  })

  test('leaves a single-slash local path untouched', () => {
    expect(getWeatherIconUrl('/images/weather/sunny.png')).toBe('/images/weather/sunny.png')
  })

  test('handles an empty string', () => {
    expect(getWeatherIconUrl('')).toBe('')
  })
})
