
import { config } from '../config.js';
import { HttpError } from './http-error.js';

// Fetch weather information and handle errors
async function fetchJson(url) {
  let response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs)
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new HttpError(504, 'The weather service timed out');
    }

    throw new HttpError(502, 'Could not connect to the weather service');
  }

  if (!response.ok) {
    throw new HttpError(502, 'The weather service returned an error');
  }

  try {
    return await response.json();
  } catch {
    throw new HttpError(502, 'Invalid response from the weather service');
  }
}

// Find a city's location
export async function geocodeCity(name) {
 const url = new URL(`${config.geocodingUrl}/search`);

  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    throw new HttpError(404, `City not found: ${name}`);
  }

  const city = data.results[0];

  return {
    name: city.name,
    region: city.admin1 ?? null,
    country: city.country ?? null,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone
  };
}

// Get current weather and a three-day forecast
export async function getForecast(latitude, longitude) {
  const url = new URL(`${config.forecastUrl}/forecast`);

  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set(
  'current',
  'temperature_2m'
);
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code'
  );
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'auto');
console.log('Forecast URL:', url.toString());
  return await fetchJson(url);
}
