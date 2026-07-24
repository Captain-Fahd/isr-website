import { Request, Response } from 'express';

const WEATHER_BASE = 'https://api.weatherapi.com/v1';
const LOCATION = 'Melbourne';

type WeatherCurrent = {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  condition: { text: string; icon: string; code: number };
  uv: number;
  vis_km: number;
  precip_mm: number;
};

type WeatherApiResponse = {
  location: { name: string; region: string; country: string; localtime: string };
  current: WeatherCurrent;
};

export async function getMelbourneWeather(_req: Request, res: Response) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Weather API key not configured' });
    return;
  }

  try {
    const url = `${WEATHER_BASE}/current.json?key=${apiKey}&q=${LOCATION}&aqi=no`;
    const apiRes = await fetch(url);

    if (apiRes.status === 401) {
      res.status(502).json({ error: 'Invalid Weather API key' });
      return;
    }
    if (!apiRes.ok) {
      res.status(502).json({ error: `Weather API responded with ${apiRes.status}` });
      return;
    }

    const json = (await apiRes.json()) as WeatherApiResponse;
    const { location, current } = json;

    res.json({
      data: {
        location: {
          name: location.name,
          region: location.region,
          country: location.country,
          localtime: location.localtime,
        },
        current: {
          temp_c: current.temp_c,
          feelslike_c: current.feelslike_c,
          humidity: current.humidity,
          wind_kph: current.wind_kph,
          wind_dir: current.wind_dir,
          condition: current.condition,
          uv: current.uv,
          vis_km: current.vis_km,
          precip_mm: current.precip_mm,
        },
      },
    });
  } catch {
    res.status(502).json({ error: 'Failed to fetch weather data' });
  }
}
