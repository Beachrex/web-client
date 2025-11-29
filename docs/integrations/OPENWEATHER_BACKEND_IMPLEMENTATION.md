# OpenWeatherMap Backend Implementation Guide

This guide provides step-by-step instructions to integrate OpenWeatherMap API into the Laravel backend for real-time weather and sea temperature data.

---

## Step 1: Add OpenWeatherMap Configuration

### 1.1 Update `config/services.php`

Add the OpenWeatherMap configuration:

```php
<?php

return [
    // ... existing services ...

    'openweather' => [
        'api_key' => env('OPENWEATHER_API_KEY'),
    ],
];
```

### 1.2 Update `.env.example`

Add the API key placeholder:

```env
# OpenWeatherMap API Configuration
OPENWEATHER_API_KEY=your_api_key_here
```

### 1.3 Update your `.env` file

Get a free API key from https://openweathermap.org/api and add it:

```env
OPENWEATHER_API_KEY=your_actual_api_key_here
```

---

## Step 2: Create WeatherService

Create `app/Services/WeatherService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private const CACHE_TTL = 3600; // 1 hour cache
    private const API_TIMEOUT = 10; // 10 seconds timeout
    
    private string $apiKey;
    private string $baseUrl = 'https://api.openweathermap.org/data/2.5';

    public function __construct()
    {
        $this->apiKey = config('services.openweather.api_key', '');
    }

    /**
     * Get current weather data for a location
     *
     * @param float $latitude
     * @param float $longitude
     * @return array|null Weather data or null if API call fails
     */
    public function getCurrentWeather(float $latitude, float $longitude): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('OpenWeatherMap API key not configured');
            return null;
        }

        $cacheKey = $this->getCacheKey('weather', $latitude, $longitude);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($latitude, $longitude) {
            try {
                $response = Http::timeout(self::API_TIMEOUT)
                    ->get("{$this->baseUrl}/weather", [
                        'lat' => $latitude,
                        'lon' => $longitude,
                        'appid' => $this->apiKey,
                        'units' => 'metric', // Celsius
                    ]);

                if (!$response->successful()) {
                    Log::error('OpenWeatherMap API error', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    return null;
                }

                $data = $response->json();

                return $this->formatWeatherData($data);
            } catch (\Exception $e) {
                Log::error('Failed to fetch weather data', [
                    'error' => $e->getMessage(),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]);
                return null;
            }
        });
    }

    /**
     * Get sea surface temperature for a location
     * Note: OpenWeatherMap doesn't provide dedicated sea temperature in the free tier.
     * This returns the general temperature which is close to sea temperature for coastal areas.
     * For more accurate sea temperature, consider using a specialized marine API.
     *
     * @param float $latitude
     * @param float $longitude
     * @return float|null Temperature in Celsius or null if unavailable
     */
    public function getSeaTemperature(float $latitude, float $longitude): ?float
    {
        $weather = $this->getCurrentWeather($latitude, $longitude);
        
        return $weather['temperature'] ?? null;
    }

    /**
     * Format raw OpenWeatherMap API response into a clean structure
     *
     * @param array $data Raw API response
     * @return array Formatted weather data
     */
    private function formatWeatherData(array $data): array
    {
        return [
            'temperature' => round($data['main']['temp'] ?? 0, 1),
            'feels_like' => round($data['main']['feels_like'] ?? 0, 1),
            'temp_min' => round($data['main']['temp_min'] ?? 0, 1),
            'temp_max' => round($data['main']['temp_max'] ?? 0, 1),
            'pressure' => $data['main']['pressure'] ?? null,
            'humidity' => $data['main']['humidity'] ?? null,
            'condition' => $data['weather'][0]['main'] ?? 'Unknown',
            'description' => $data['weather'][0]['description'] ?? 'No description',
            'icon' => $data['weather'][0]['icon'] ?? null,
            'icon_url' => isset($data['weather'][0]['icon']) 
                ? "https://openweathermap.org/img/wn/{$data['weather'][0]['icon']}@2x.png"
                : null,
            'wind_speed' => $data['wind']['speed'] ?? null,
            'wind_deg' => $data['wind']['deg'] ?? null,
            'clouds' => $data['clouds']['all'] ?? null,
            'visibility' => $data['visibility'] ?? null,
            'sunrise' => isset($data['sys']['sunrise']) ? date('H:i', $data['sys']['sunrise']) : null,
            'sunset' => isset($data['sys']['sunset']) ? date('H:i', $data['sys']['sunset']) : null,
            'location_name' => $data['name'] ?? null,
        ];
    }

    /**
     * Generate cache key for weather data
     *
     * @param string $type
     * @param float $latitude
     * @param float $longitude
     * @return string
     */
    private function getCacheKey(string $type, float $latitude, float $longitude): string
    {
        // Round coordinates to 2 decimal places for cache efficiency
        // This means locations within ~1km will share the same cache
        $lat = round($latitude, 2);
        $lon = round($longitude, 2);
        
        return "weather:{$type}:{$lat}:{$lon}";
    }

    /**
     * Clear weather cache for a specific location
     *
     * @param float $latitude
     * @param float $longitude
     * @return void
     */
    public function clearCache(float $latitude, float $longitude): void
    {
        $cacheKey = $this->getCacheKey('weather', $latitude, $longitude);
        Cache::forget($cacheKey);
    }

    /**
     * Check if API key is configured
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }
}
```

---

## Step 3: Update BeachDetailsResource

Modify `app/Http/Resources/BeachDetailsResource.php`:

### 3.1 Add WeatherService injection

At the top of the file, add the import:

```php
use App\Services\WeatherService;
```

### 3.2 Update the `getEmbeds()` method

Replace the existing `getEmbeds()` method with:

```php
private function getEmbeds(): array
{
    $weatherService = app(WeatherService::class);
    
    // Get current weather data
    $weatherData = null;
    $seaTemperature = null;
    
    if ($this->latitude && $this->longitude) {
        $weatherData = $weatherService->getCurrentWeather(
            (float) $this->latitude,
            (float) $this->longitude
        );
        
        $seaTemperature = $weatherData['temperature'] ?? null;
    }

    return [
        'video_url' => $this->video_url,
        'webcam' => $this->webcam,
        'map_url' => $this->path_to_beach_map_url,
        'weather' => $weatherData,
        'sea_temperature' => $seaTemperature,
    ];
}
```

---

## Step 4: Update Swagger Documentation

Update `app/Swagger/Schemas/BeachDetailsSchema.php`:

Find the `embeds` property definition and update it to:

```php
/**
 * @OA\Property(
 *     property="embeds",
 *     type="object",
 *     description="Embedded content (videos, webcams, maps, weather data)",
 *     @OA\Property(property="video_url", type="string", nullable=true, example="https://youtu.be/8asMQKdsHAY", description="YouTube video URL"),
 *     @OA\Property(property="webcam", type="string", nullable=true, description="Webcam embed code or URL"),
 *     @OA\Property(property="map_url", type="string", nullable=true, description="Path to beach map URL"),
 *     @OA\Property(
 *         property="weather",
 *         type="object",
 *         nullable=true,
 *         description="Current weather data from OpenWeatherMap",
 *         @OA\Property(property="temperature", type="number", format="float", example=23.5, description="Current temperature in Celsius"),
 *         @OA\Property(property="feels_like", type="number", format="float", example=22.1, description="Feels like temperature in Celsius"),
 *         @OA\Property(property="temp_min", type="number", format="float", example=21.0, description="Minimum temperature"),
 *         @OA\Property(property="temp_max", type="number", format="float", example=25.0, description="Maximum temperature"),
 *         @OA\Property(property="pressure", type="integer", example=1013, description="Atmospheric pressure in hPa"),
 *         @OA\Property(property="humidity", type="integer", example=65, description="Humidity percentage"),
 *         @OA\Property(property="condition", type="string", example="Clear", description="Weather condition (Clear, Clouds, Rain, etc.)"),
 *         @OA\Property(property="description", type="string", example="clear sky", description="Detailed weather description"),
 *         @OA\Property(property="icon", type="string", example="01d", description="Weather icon code"),
 *         @OA\Property(property="icon_url", type="string", example="https://openweathermap.org/img/wn/01d@2x.png", description="Full URL to weather icon"),
 *         @OA\Property(property="wind_speed", type="number", format="float", example=3.5, description="Wind speed in m/s"),
 *         @OA\Property(property="wind_deg", type="integer", example=180, description="Wind direction in degrees"),
 *         @OA\Property(property="clouds", type="integer", example=20, description="Cloudiness percentage"),
 *         @OA\Property(property="visibility", type="integer", example=10000, description="Visibility in meters"),
 *         @OA\Property(property="sunrise", type="string", example="06:30", description="Sunrise time (HH:mm)"),
 *         @OA\Property(property="sunset", type="string", example="20:15", description="Sunset time (HH:mm)"),
 *         @OA\Property(property="location_name", type="string", example="Hvar", description="Location name from weather API")
 *     ),
 *     @OA\Property(property="sea_temperature", type="number", format="float", nullable=true, example=22.5, description="Sea surface temperature in Celsius (approximation from weather data)")
 * )
 */
```

---

## Step 5: Regenerate Swagger Documentation

Run the Swagger generation command:

```bash
./vendor/bin/sail artisan l5-swagger:generate
```

Or if not using Sail:

```bash
php artisan l5-swagger:generate
```

---

## Step 6: Test the Implementation

### 6.1 Test API Response

Visit a beach details endpoint:

```
GET /api/v1/beach-details/{beach-slug}
```

Check the `embeds` section in the response:

```json
{
  "data": {
    "embeds": {
      "video_url": "https://youtu.be/...",
      "webcam": null,
      "map_url": null,
      "weather": {
        "temperature": 23.5,
        "feels_like": 22.1,
        "condition": "Clear",
        "description": "clear sky",
        "icon": "01d",
        "icon_url": "https://openweathermap.org/img/wn/01d@2x.png",
        "humidity": 65,
        "wind_speed": 3.5
      },
      "sea_temperature": 23.5
    }
  }
}
```

### 6.2 Check Cache

Weather data is cached for 1 hour. To verify caching is working:

```bash
./vendor/bin/sail artisan tinker
```

```php
$service = app(\App\Services\WeatherService::class);
$weather = $service->getCurrentWeather(45.5, 14.2);
dd($weather);
```

---

## Notes

### API Rate Limits

OpenWeatherMap free tier allows:
- **60 calls/minute**
- **1,000,000 calls/month**

With 1-hour caching, this should be more than sufficient.

### Sea Temperature Accuracy

OpenWeatherMap's free tier doesn't provide dedicated sea surface temperature. The `sea_temperature` field uses the general temperature, which is a reasonable approximation for coastal areas.

For more accurate sea temperature data, consider:
- **NOAA API** (free, US-focused)
- **Stormglass.io** (paid, global coverage)
- **World Weather Online Marine API** (paid)

### Error Handling

The service gracefully handles:
- Missing API key (logs warning, returns null)
- API timeouts (10-second timeout)
- API errors (logs error, returns null)
- Network failures (catches exceptions, returns null)

Frontend should handle `null` values for weather data.

---

## Summary

✅ **Created**: `WeatherService` with caching and error handling  
✅ **Updated**: `BeachDetailsResource` to include weather data  
✅ **Updated**: Swagger documentation for new weather fields  
✅ **Configured**: OpenWeatherMap API key in services config  

**Next**: Frontend implementation to display the weather data in widgets.

