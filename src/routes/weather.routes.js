
import { Router } from 'express';
import { geocodeCity, getForecast } from '../lib/open-meteo.js';
import { getCache, setCache } from '../lib/cache.js';

export const weatherRouter = Router();

// Get weather information for one city
weatherRouter.get('/weather', async (req, res, next) => {
  try {
    const cityName = req.query.city;

    if (typeof cityName !== 'string' || !cityName.trim()) {
      return res.status(400).json({
        error: { message: 'Please enter a city name' }
      });
    }

    const name = cityName.trim();
    const cacheKey = `weather:${name.toLowerCase()}`;
    const cached = getCache(cacheKey);

    if (cached !== null) {
      return res.json(cached);
    }

    const city = await geocodeCity(name);
    const forecast = await getForecast(
      city.latitude,
      city.longitude
    );

    const result = {
      data: {
        city,
        current: forecast.current,
        daily: forecast.daily
      },
      attribution: 'Weather data provided by Open-Meteo'
    };

    setCache(cacheKey, result);

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

// Compare weather between 2 to 5 cities
weatherRouter.get('/compare', async (req, res, next) => {
  try {
    const citiesInput = req.query.cities;

    if (typeof citiesInput !== 'string' || !citiesInput.trim()) {
      return res.status(400).json({
        error: {
          message: 'Please enter between 2 and 5 cities'
        }
      });
    }

    const cityNames = citiesInput
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);

    // Only allow 2 to 5 cities
    if (cityNames.length < 2 || cityNames.length > 5) {
      return res.status(400).json({
        error: {
          message: 'Please enter between 2 and 5 cities'
        }
      });
    }

    // Get weather information for each city
    const results = await Promise.allSettled(
      cityNames.map(async (name) => {
        const cacheKey = `weather:${name.toLowerCase()}`;
        const cached = getCache(cacheKey);

        if (cached !== null) {
          return cached.data;
        }

        const city = await geocodeCity(name);
        const forecast = await getForecast(
          city.latitude,
          city.longitude
        );

        const result = {
          data: {
            city,
            current: forecast.current,
            daily: forecast.daily
          },
          attribution: 'Weather data provided by Open-Meteo'
        };

        setCache(cacheKey, result);

        return result.data;
      })
    );

    const successfulCities = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason.message);

    return res.json({
      data: {
        cities: successfulCities
      },
      errors,
      attribution: 'Weather data provided by Open-Meteo'
    });
  } catch (error) {
    next(error);
  }
});
