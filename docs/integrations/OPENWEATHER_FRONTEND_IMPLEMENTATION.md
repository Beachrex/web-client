# OpenWeatherMap Frontend Implementation Guide

This guide explains the frontend changes needed to display real-time weather and sea temperature data from the Laravel backend.

---

## ✅ What Was Implemented

### 1. Weather Types (`src/types/weather.ts`)
- TypeScript interfaces for weather data structure
- `WeatherData` interface matching backend response
- `BeachEmbedsWithWeather` interface for type safety

### 2. WeatherWidget Component (`src/components/BannerSection/WeatherWidget.tsx`)
- Updated to accept weather data as props
- Displays real temperature from API
- Shows weather icon from OpenWeatherMap
- Displays location name from beach data
- Graceful fallback to placeholder values

### 3. SeaTempWidget Component (`src/components/Beach/BeachBanner/SeaTempWidget.tsx`)
- Updated to accept sea temperature as prop
- Displays real sea temperature from API
- Shows `--` when temperature is unavailable
- Handles null/undefined values gracefully

### 4. BeachBannerSection Component (`src/components/Beach/BeachBanner/BeachBannerSection.tsx`)
- Extracts weather data from `beachDetails.embeds.weather`
- Extracts sea temperature from `beachDetails.embeds.sea_temperature`
- Passes data to WeatherWidget and SeaTempWidget
- Uses location hierarchy for weather widget location name

---

## 📋 Implementation Steps

### Step 1: Create Weather Types

File: `src/types/weather.ts`

This file defines TypeScript interfaces for the weather data structure. It provides type safety until the auto-generated types are updated.

**Key interfaces:**
- `WeatherData` - Complete weather data from OpenWeatherMap
- `BeachEmbedsWithWeather` - Extended embeds type with weather data

### Step 2: Update WeatherWidget

File: `src/components/BannerSection/WeatherWidget.tsx`

**Changes:**
- Added props interface for weather data and location name
- Displays dynamic temperature instead of hardcoded `23°C`
- Shows weather icon from API instead of static beach icon
- Displays location name from beach data
- Fallback to placeholder values when data is unavailable

**Before:**
```tsx
<WeatherWidget />
```

**After:**
```tsx
<WeatherWidget 
  weather={weatherData} 
  locationName={locationName} 
/>
```

### Step 3: Update SeaTempWidget

File: `src/components/Beach/BeachBanner/SeaTempWidget.tsx`

**Changes:**
- Accepts `tempC` as optional prop (can be null/undefined)
- Displays `--` when temperature is unavailable
- Rounds temperature to nearest integer
- Conditionally shows °C unit

**Before:**
```tsx
<SeaTempWidget tempC={8} />
```

**After:**
```tsx
<SeaTempWidget tempC={seaTemperature} />
```

### Step 4: Update BeachBannerSection

File: `src/components/Beach/BeachBanner/BeachBannerSection.tsx`

**Changes:**
- Imports `WeatherData` type
- Extracts weather data from `beachDetails.embeds.weather`
- Extracts sea temperature from `beachDetails.embeds.sea_temperature`
- Builds location name from geographic hierarchy
- Passes data to widgets

**Location name priority:**
1. City name
2. Island name
3. Region name
4. Country name

---

## 🔄 After Backend Deployment

### Regenerate TypeScript Types

After the backend is deployed and Swagger documentation is regenerated, run:

```bash
npm run generate-api-client
```

This will update `src/lib/api-client/types.gen.ts` with the new weather data structure.

**Expected changes in types.gen.ts:**

```typescript
export type BeachDetailsSchema = {
  embeds?: {
    video_url?: string | null;
    webcam?: string | null;
    map_url?: string | null;
    weather?: {
      temperature?: number;
      feels_like?: number;
      temp_min?: number;
      temp_max?: number;
      pressure?: number | null;
      humidity?: number | null;
      condition?: string;
      description?: string;
      icon?: string | null;
      icon_url?: string | null;
      wind_speed?: number | null;
      wind_deg?: number | null;
      clouds?: number | null;
      visibility?: number | null;
      sunrise?: string | null;
      sunset?: string | null;
      location_name?: string | null;
    } | null;
    sea_temperature?: number | null;
  };
};
```

### Remove Temporary Types

After regenerating types, you can optionally remove the temporary type assertions in `BeachBannerSection.tsx`:

**Before:**
```tsx
const weatherData = beachDetails?.embeds?.weather as WeatherData | null | undefined;
const seaTemperature = beachDetails?.embeds?.sea_temperature as number | null | undefined;
```

**After:**
```tsx
const weatherData = beachDetails?.embeds?.weather;
const seaTemperature = beachDetails?.embeds?.sea_temperature;
```

---

## 🎨 UI Changes

### WeatherWidget

**Before:**
- Temperature: `23°C` (hardcoded)
- Location: `Krk` (hardcoded)
- Icon: Static beach icon

**After:**
- Temperature: Dynamic from API (e.g., `23°C`)
- Location: From beach data (e.g., `Hvar`)
- Icon: Weather icon from OpenWeatherMap

**Fallback behavior:**
- Temperature: `23°C` (default)
- Location: `Loading...`
- Icon: Static beach icon

### SeaTempWidget

**Before:**
- Temperature: `8°C` (hardcoded)

**After:**
- Temperature: Dynamic from API (e.g., `22°C`)
- Shows `--` if unavailable

---

## 🧪 Testing

### Test 1: Check Weather Widget

1. Start dev server: `npm run dev`
2. Visit a beach page: `http://localhost:3000/en/beaches/europe/croatia/beach-slug`
3. Check weather widget displays:
   - ✅ Real temperature from API
   - ✅ Weather icon from OpenWeatherMap
   - ✅ Location name from beach data

### Test 2: Check Sea Temperature Widget

1. On the same beach page
2. Check sea temperature widget displays:
   - ✅ Real sea temperature from API
   - ✅ Shows `--` if unavailable

### Test 3: Check Fallback Behavior

1. Test with a beach that has no coordinates (weather data will be null)
2. Verify widgets show placeholder values
3. No errors in console

---

## 📊 Data Flow

```
Backend (Laravel)
  ↓
  WeatherService fetches from OpenWeatherMap
  ↓
  BeachDetailsResource formats data
  ↓
  API Response: /api/v1/beach-details/{slug}
  ↓
Frontend (Next.js)
  ↓
  BeachBannerSection extracts weather data
  ↓
  WeatherWidget displays temperature, icon, location
  ↓
  SeaTempWidget displays sea temperature
```

---

## 🚨 Error Handling

### Backend Returns Null Weather Data

**Scenario:** OpenWeatherMap API is down or API key is missing

**Frontend behavior:**
- WeatherWidget shows default values (23°C, "Loading...")
- SeaTempWidget shows `--`
- No errors in console

### Missing Beach Coordinates

**Scenario:** Beach has no latitude/longitude

**Frontend behavior:**
- Weather data will be null
- Widgets show placeholder values

### Network Error

**Scenario:** API request fails

**Frontend behavior:**
- React Query handles retry logic
- Shows loading state
- Falls back to placeholder values

---

## 🎯 Future Enhancements

### 1. Weather Forecast

Add 5-day forecast to beach pages:

```tsx
<WeatherForecast forecast={beachDetails?.embeds?.forecast} />
```

### 2. Weather Alerts

Display weather warnings:

```tsx
{weatherData?.alerts && (
  <WeatherAlert alerts={weatherData.alerts} />
)}
```

### 3. Historical Weather

Show average temperatures by month for trip planning:

```tsx
<MonthlyWeatherChart data={beachDetails?.weather_history} />
```

### 4. More Accurate Sea Temperature

When backend integrates with specialized marine API:

```tsx
<SeaTempWidget 
  tempC={beachDetails?.embeds?.sea_temperature}
  source="marine_api" // Show data source
/>
```

---

## ✅ Checklist

- [x] Created `src/types/weather.ts`
- [x] Updated `WeatherWidget.tsx`
- [x] Updated `SeaTempWidget.tsx`
- [x] Updated `BeachBannerSection.tsx`
- [ ] Test on dev server
- [ ] Regenerate TypeScript types (after backend deployment)
- [ ] Remove type assertions (optional, after types regenerated)
- [ ] Test on staging
- [ ] Deploy to production

---

## 📝 Notes

### Weather Icon Display

OpenWeatherMap provides weather icons at:
```
https://openweathermap.org/img/wn/{icon}@2x.png
```

The `@2x` suffix provides high-resolution icons suitable for retina displays.

### Location Name Priority

The location name is built from the geographic hierarchy:
1. **City** - Most specific (e.g., "Hvar")
2. **Island** - If no city (e.g., "Brač")
3. **Region** - If no island (e.g., "Dalmatia")
4. **Country** - Fallback (e.g., "Croatia")

This ensures the most relevant location name is displayed.

### Temperature Rounding

Temperatures are rounded to the nearest integer for better UI:
- `23.7°C` → `24°C`
- `22.3°C` → `22°C`

This matches the design and improves readability.

---

## 🆘 Troubleshooting

### Weather widget shows "Loading..."

1. Check if backend is returning weather data:
   ```bash
   curl http://localhost/api/v1/beach-details/beach-slug | jq '.data.embeds.weather'
   ```

2. Check browser console for errors

3. Verify `beachDetails` prop is passed correctly

### Sea temperature shows "--"

1. Check if backend is returning sea temperature:
   ```bash
   curl http://localhost/api/v1/beach-details/beach-slug | jq '.data.embeds.sea_temperature'
   ```

2. Verify beach has coordinates (latitude/longitude)

### TypeScript errors after regenerating types

1. Remove temporary type assertions in `BeachBannerSection.tsx`
2. Update imports to use generated types instead of `src/types/weather.ts`
3. Run `npm run type-check` to verify

---

## 📚 Resources

- OpenWeatherMap Icons: https://openweathermap.org/weather-conditions#Icon-list
- Next.js Image Component: https://nextjs.org/docs/api-reference/next/image
- React Query: https://tanstack.com/query/latest
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

