# Handoff: Fix for Beach Images With Special Characters in URLs

## Context / Problem

Some beach and country images are stored in the CDN under folder/file names containing special characters (e.g. `č`, `š`, `ž`). Example path from the API / DB:

- `/public/img/beaches/hr-37-o-brač/hr-37-o-brač-sl10.jpg`

The actual object in the CDN, however, is stored using **NFD (decomposed) Unicode**, which results in a different byte representation. For example, `č` is stored as `c` + combining caron (`c` + `U+030C`), and when percent-encoded it becomes:

- `/public/img/beaches/hr-37-o-brac%CC%8C/hr-37-o-brac%CC%8C-sl10.jpg`

Initially, our URL-building logic used `encodeURIComponent` directly on the NFC string, producing:

- `/public/img/beaches/hr-37-o-bra%C4%8D/hr-37-o-bra%C4%8D-sl10.jpg`

This path **does not exist** in the CDN, so images with such characters 404’d in Next.js.

## High-Level Solution

1. Introduce a shared utility that **normalizes** each path segment to NFD (decomposed form) **before** percent-encoding it.
2. Use this helper for:
   - Paths where we construct URLs from `folderName` + `filename`.
   - Paths coming directly from the API as `image_path` / `main_image`.
3. Update all components that build CDN URLs to use this shared helper.

This ensures our generated URLs match the exact Unicode decomposition used by the CDN (e.g. `brac%CC%8C`), so images load correctly.

## Implementation Details

### 1. New / updated helpers in `src/lib/utils/beach-images.ts`

#### `encodePathSegment`

```ts
function encodePathSegment(segment: string): string {
  if (!segment) return segment;

  // Fast path: pure ASCII, nothing to encode
  if (/^[\u0000-\u007F]*$/.test(segment)) {
    return segment;
  }

  // Normalize to NFD so characters like "č" become "c" + combining caron,
  // then percent-encode the bytes. This matches how objects are stored in the CDN
  // (e.g. 'brač' -> 'brac%CC%8C').
  return encodeURIComponent(segment.normalize('NFD'));
}
```

Notes:
- Pure ASCII segments are left untouched (fast path, avoids unnecessary work).
- Non-ASCII segments:
  - First normalized with `segment.normalize('NFD')`.
  - Then encoded with `encodeURIComponent`, producing URLs that match the CDN keys.

#### `encodeCdnImagePath`

Used when we already have a path from the API (e.g. `country.image_path`):

```ts
export function encodeCdnImagePath(path: string): string {
  if (!path) return path;

  const queryIndex = path.search(/[?#]/);
  let main = path;
  let suffix = '';

  if (queryIndex !== -1) {
    main = path.slice(0, queryIndex);
    suffix = path.slice(queryIndex);
  }

  const encoded = main
    .split('/')
    .map(segment => encodePathSegment(segment))
    .join('/');

  return encoded + suffix;
}
```

Behavior:
- Preserves `/` separators.
- Preserves query string / fragment (`?`, `#`) as-is.
- Only encodes individual path segments, and only when needed.

#### `buildBeachImageUrl`

Updated so folder and filename are encoded via `encodePathSegment`:

```ts
export function buildBeachImageUrl(
  folderName: string | null | undefined,
  filename: string | null | undefined,
  mobileUpload = false
): string | null {
  if (!folderName || !filename) {
    return null;
  }

  const basePath = mobileUpload ? 'img/beaches_mobile' : 'img/beaches';

  const safeFolder = encodePathSegment(folderName);
  const safeFilename = encodePathSegment(filename);

  return `${env.NEXT_PUBLIC_CDN_ENDPOINT}/${basePath}/${safeFolder}/${safeFilename}`;
}
```

All callers of `buildBeachImageUrl` now automatically get correctly encoded URLs.

### 2. Components updated to use the encoder

#### `src/components/PropertyCard/DynamicPropertyCard.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Image URL construction updated**:

```ts
const imageUrl = beach.main_image
  ? `${cdnEndpoint}${encodeCdnImagePath(beach.main_image)}`
  : '/images/propertycard/card-banner.jpg';
```

#### `src/components/DestinationCard.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Image URL construction updated**:

```ts
const src = country.image_path
  ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(country.image_path)}`
  : '/images/topdestination/spain.jpg';
```

#### `src/components/Continent/SearchBeach.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Country image mapping updated**:

```ts
image: country.image_path
  ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(country.image_path)}`
  : '/images/spain.jpg',
```

#### `src/components/CountryPage/CountrySearchBeaches.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Country image mapping updated**:

```ts
image: country.image_path
  ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(country.image_path)}`
  : '/images/spain.jpg',
```

#### `src/components/regions/RegionSearchBeaches.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Country image mapping updated**:

```ts
image: country.image_path
  ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(country.image_path)}`
  : '/images/spain.jpg',
```

#### `src/components/CityPage/citySearchBeaches.tsx`

- **Import added**:

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';
```

- **Country image mapping updated**:

```ts
image: country.image_path
  ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(country.image_path)}`
  : '/images/spain.jpg',
```

## How to Use This Going Forward

**When you build a CDN URL from a full path provided by the API** (e.g. `image_path`, `main_image`):

```ts
import { encodeCdnImagePath } from '@/lib/utils/beach-images';

const url = `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(apiPath)}`;
```

**When you build a CDN URL from `folderName` + `filename`**:

```ts
import { buildBeachImageUrl } from '@/lib/utils/beach-images';

const url = buildBeachImageUrl(folderName, fileName, mobileUploadFlag);
```

In both cases, special characters (including those with diacritics) will be normalized to NFD and correctly percent-encoded to match the CDN's storage format.

## Verification

- Manually verified on a beach whose folder name contains `č` (e.g. `hr-37-o-brač`).
- The generated URL now matches the working CDN URL:
  - `.../hr-37-o-brac%CC%8C/hr-37-o-brac%CC%8C-sl10.jpg`
- User has confirmed the images now load correctly in the UI.

## Notes / Limitations

- No automated tests were added for this behavior (test runner `yarn` was not available in the execution environment). It would be useful to add unit tests around `encodeCdnImagePath` and `buildBeachImageUrl` to lock in this behavior.
- If new image usages are introduced (e.g. new components showing countries / beaches), they should always call `encodeCdnImagePath` or `buildBeachImageUrl` instead of concatenating raw `image_path` or folder+filename into URLs.

