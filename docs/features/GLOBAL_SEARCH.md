# Global Search Feature

## Overview

The Global Search feature provides a powerful, real-time search experience powered by Meilisearch. Users can search across beaches, cities, islands, regions, and countries with instant autocomplete suggestions.

## Features

✅ **Real-time Search** - Results appear as you type (300ms debounce)  
✅ **Multi-entity Search** - Search across beaches, cities, islands, regions, and countries  
✅ **Keyboard Navigation** - Navigate results with arrow keys, select with Enter  
✅ **Responsive Design** - Adapts to mobile, tablet, and desktop layouts  
✅ **Multilingual** - Supports all 14 languages with localized results  
✅ **Smart Routing** - Automatically navigates to the correct page based on result type  
✅ **Beautiful UI** - Smooth animations, custom icons, and polished design  

## Components

### GlobalSearch Component

**Location:** `src/components/Header/GlobalSearch.tsx`

**Props:**
```typescript
interface GlobalSearchProps {
    className?: string;           // Container class
    placeholder?: string;         // Custom placeholder text
    buttonClassName?: string;     // Search button styling
    inputClassName?: string;      // Input field styling
}
```

**Usage:**
```tsx
import GlobalSearch from '@/components/Header/GlobalSearch';

<GlobalSearch 
    className="max-w-[500px] w-full"
    inputClassName="px-3 py-2 text-sm"
    buttonClassName="w-[113px] h-[41px]"
/>
```

### useDebounce Hook

**Location:** `src/hooks/useDebounce.ts`

**Purpose:** Delays search API calls until user stops typing

**Usage:**
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300); // 300ms delay
```

## API Integration

### Search Endpoint

**URL:** `GET /api/v1/search`

**Query Parameters:**
- `q` (required) - Search query string
- `limit` (optional) - Number of results (default: 10)

**Headers:**
- `Accept-Language` - Locale for localized results (e.g., 'en', 'si')
- `Accept` - `application/json`

**Example Request:**
```bash
curl -H "Accept-Language: en" \
  "https://dev-api.beachrex.com/api/v1/search?q=miami&limit=10"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 123,
      "type": "beach",
      "name": "Miami Beach",
      "slug": "miami-beach",
      "location": "Miami, Florida, USA",
      "beaches_count": null,
      "main_image": "img/beaches/miami-beach.jpg"
    },
    {
      "id": 45,
      "type": "city",
      "name": "Miami",
      "slug": "miami",
      "location": "Florida, USA",
      "beaches_count": 15,
      "main_image": "img/cities/miami.jpg"
    }
  ],
  "meta": {
    "total": 2,
    "query": "miami"
  }
}
```

## Search Result Types

### Beach
- **Icon:** Location marker (HiLocationMarker)
- **URL Pattern:** `/beaches/{slug}`
- **Badge Color:** Blue
- **Shows:** Beach name, location

### City
- **Icon:** City buildings (MdLocationCity)
- **URL Pattern:** `/beaches/city/{slug}`
- **Badge Color:** Blue
- **Shows:** City name, location, beach count

### Island
- **Icon:** Island (GiIsland)
- **URL Pattern:** `/beaches/island/{slug}`
- **Badge Color:** Blue
- **Shows:** Island name, location, beach count

### Region
- **Icon:** Landscape (MdLandscape)
- **URL Pattern:** `/beaches/region/{slug}`
- **Badge Color:** Blue
- **Shows:** Region name, location, beach count

### Country
- **Icon:** Globe (GiWorld)
- **URL Pattern:** `/beaches/{slug}`
- **Badge Color:** Blue
- **Shows:** Country name, beach count

## Translations

### English (messages/en.json)
```json
{
  "Search": {
    "typeBeach": "Beach",
    "typeCity": "City",
    "typeIsland": "Island",
    "typeRegion": "Region",
    "typeCountry": "Country",
    "beaches": "beaches",
    "noResults": "No results found. Try a different search term.",
    "searching": "Searching...",
    "clearSearch": "Clear search"
  }
}
```

### Slovenian (messages/si.json)
```json
{
  "Search": {
    "typeBeach": "Plaža",
    "typeCity": "Mesto",
    "typeIsland": "Otok",
    "typeRegion": "Regija",
    "typeCountry": "Država",
    "beaches": "plaže",
    "noResults": "Ni rezultatov. Poskusite z drugim iskalnim izrazom.",
    "searching": "Iskanje...",
    "clearSearch": "Počisti iskanje"
  }
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` | Move to next result |
| `↑` | Move to previous result |
| `Enter` | Select highlighted result |
| `Esc` | Close search dropdown |

## Styling

### Custom CSS Animations

**Location:** `src/styles/globals.css`

```css
/* Fade-in animation for dropdown */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

/* Custom scrollbar for search results */
.search-results-scroll::-webkit-scrollbar {
  width: 6px;
}

.search-results-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.search-results-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}
```

### Responsive Breakpoints

**Mobile (< md):**
- Compact search bar
- Smaller icons and text
- Full-width dropdown

**Tablet (md to lg):**
- Medium-sized search bar
- Standard icons
- Constrained dropdown width

**Desktop (>= lg):**
- Full-featured search bar
- Large icons and text
- Max-width dropdown (500px)

## Performance Optimizations

### Debouncing
- **Delay:** 300ms
- **Purpose:** Reduces API calls while typing
- **Implementation:** Custom `useDebounce` hook

### Caching
- **Strategy:** React Query (via ApiClientProvider)
- **Stale Time:** 5 minutes
- **GC Time:** 10 minutes

### Lazy Loading
- Results load on-demand
- No pre-fetching
- Minimal initial bundle size

## User Experience

### Loading States
- Shows "..." in search button while loading
- Prevents duplicate requests
- Graceful error handling

### Empty States
- "No results found" message when query returns nothing
- Minimum 2 characters required for search
- Clear button to reset search

### Visual Feedback
- Hover effects on results
- Selected result highlighting (keyboard navigation)
- Smooth animations
- Icon-based type indicators

## Integration with SearchBar

The GlobalSearch component is integrated into the SearchBar component at three responsive breakpoints:

**Mobile:**
```tsx
<GlobalSearch 
    className="w-[95%] sm:w-[90%]"
    inputClassName="text-xs sm:text-sm"
    buttonClassName="w-[38px] sm:w-[43px] h-[36px] sm:h-[41px] px-0"
/>
```

**Tablet:**
```tsx
<GlobalSearch 
    className="flex-1"
    inputClassName="text-sm"
    buttonClassName="w-[80px] h-[36px] px-3 py-2"
/>
```

**Desktop:**
```tsx
<GlobalSearch 
    className="max-w-[500px] w-full"
    inputClassName="px-3 py-2 text-sm"
    buttonClassName="w-[113px] h-[41px] px-[34px] py-[11px]"
/>
```

## Testing

### Manual Testing Checklist

- [ ] Search returns results for beaches
- [ ] Search returns results for cities
- [ ] Search returns results for islands
- [ ] Search returns results for regions
- [ ] Search returns results for countries
- [ ] Keyboard navigation works (↑↓ Enter Esc)
- [ ] Clear button works
- [ ] Clicking outside closes dropdown
- [ ] Results link to correct pages
- [ ] Multilingual search works
- [ ] Mobile responsive design
- [ ] Tablet responsive design
- [ ] Desktop responsive design
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] Debouncing prevents excessive API calls

### Example Test Queries

| Query | Expected Results |
|-------|------------------|
| "miami" | Miami Beach, Miami City |
| "croatia" | Croatia (country), Croatian beaches |
| "hvar" | Hvar Island, Hvar City, Hvar beaches |
| "split" | Split City, Split beaches |
| "europe" | Europe (continent), European countries |

## Future Enhancements

### Planned Features
- [ ] Search history (recent searches)
- [ ] Popular searches suggestions
- [ ] Image thumbnails in results
- [ ] Search filters (type, location)
- [ ] Voice search
- [ ] Search analytics
- [ ] Autocomplete suggestions
- [ ] Fuzzy matching improvements

### Performance Improvements
- [ ] Implement virtual scrolling for large result sets
- [ ] Add request cancellation for outdated queries
- [ ] Optimize bundle size with code splitting
- [ ] Add service worker caching

## Troubleshooting

### Search not working
1. Check API endpoint configuration in `.env`
2. Verify Meilisearch server is running
3. Check browser console for errors
4. Verify Accept-Language header is set

### No results returned
1. Verify data is indexed in Meilisearch
2. Check search query length (minimum 2 characters)
3. Try different search terms
4. Check API response in Network tab

### Dropdown not appearing
1. Check z-index conflicts
2. Verify `isOpen` state is true
3. Check CSS animations are loaded
4. Inspect element positioning

### Keyboard navigation not working
1. Verify input has focus
2. Check `handleKeyDown` event listener
3. Ensure results array is populated
4. Check `selectedIndex` state updates

## Related Documentation

- [Meilisearch Deployment Guide](../../BR-api2/docs/deployment/MEILISEARCH_HETZNER_SETUP.md)
- [API Documentation](../../BR-api2/docs/api/SEARCH_ENDPOINT.md)
- [Translation Guide](../integrations/TRANSLATIONS.md)

---

**Last Updated:** 2025-12-01  
**Version:** 1.0  
**Author:** BeachRex Development Team

