# City Weather API

This project is a weather API built using Node.js and Express. It lets users search for a city's current weather and three-day forecast, compare weather between multiple cities, and check basic cache statistics.

## Run it

Make sure Node.js 24 is installed.

Open a terminal in the project folder and run:

```bash
npm install
```

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:4001` when `PORT=4001` is set in `.env`.

You can also run it using:

```bash
npm start
```

## Environment Variables

| Variable | Value used | Description |
|---|---|---|
| PORT | 4001 | Port the API server runs on |
| CACHE_TTL_SECONDS | 600 | How long cached weather data is kept, in seconds |
| UPSTREAM_TIMEOUT_MS | 5000 | Maximum time to wait for a weather API request |
| GEOCODING_BASE_URL | https://geocoding-api.open-meteo.com/v1 | Base URL for finding cities |
| FORECAST_BASE_URL | https://api.open-meteo.com/v1 | Base URL for weather forecasts |

These are the values used in the local setup. Check `.env.example` for the starter project's defaults.

## Endpoints

### Get Weather

`GET /api/weather?city=Toronto`

Returns the matching city's location, current weather information, and daily forecast.

Example:

```text
http://localhost:4001/api/weather?city=Toronto
```

### Compare Cities

`GET /api/compare?cities=Toronto,Vancouver,Halifax`

Returns weather information for multiple cities. Between 2 and 5 cities can be requested.

Example:

```text
http://localhost:4001/api/compare?cities=Toronto,Vancouver,Halifax
```

### Cache Statistics

`GET /api/cache/stats`

Shows cache hits, misses, expiration time, and the number of stored entries.

Example:

```text
http://localhost:4001/api/cache/stats
```

## Testing

The API can be tested in a browser or using curl.

Run these commands with the server running:

```bash
# Valid weather request: 200
curl -i "http://localhost:4001/api/weather?city=Toronto"

# Another valid city: 200
curl -i "http://localhost:4001/api/weather?city=Vancouver"

# Missing city: 400
curl -i "http://localhost:4001/api/weather"

# Unknown city: 404
curl -i "http://localhost:4001/api/weather?city=xyzabc123notreal"

# Compare three cities: 200
curl -i "http://localhost:4001/api/compare?cities=Toronto,Vancouver,Halifax"

# Compare two cities: 200
curl -i "http://localhost:4001/api/compare?cities=Toronto,Ottawa"

# Compare only one city: 400
curl -i "http://localhost:4001/api/compare?cities=Toronto"

# Compare six cities: 400
curl -i "http://localhost:4001/api/compare?cities=Toronto,Ottawa,Montreal,Calgary,Vancouver,Halifax"

# Missing comparison cities: 400
curl -i "http://localhost:4001/api/compare"

# Cache statistics: 200
curl -i "http://localhost:4001/api/cache/stats"
```

These are example checks. The exact ten requests and expected results from the assignment instructions should be verified before submission.

## Data Source

Weather information is provided by [Open-Meteo](https://open-meteo.com/), which supplies the geocoding and forecast data used by this application.