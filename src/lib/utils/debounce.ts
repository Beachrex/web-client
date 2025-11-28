/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns The debounced function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Expands a bounding box by a given factor to prefetch data for adjacent areas
 *
 * @param bounds - The original bounding box
 * @param factor - Expansion factor (e.g., 1.5 = 50% larger in each direction)
 * @returns Expanded bounding box
 */
export function expandBounds(
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  },
  factor = 1.5
): {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
} {
  const latDiff = ((bounds.max_lat - bounds.min_lat) * (factor - 1)) / 2;
  const lonDiff = ((bounds.max_lon - bounds.min_lon) * (factor - 1)) / 2;

  return {
    min_lat: Math.max(-90, bounds.min_lat - latDiff),
    max_lat: Math.min(90, bounds.max_lat + latDiff),
    min_lon: Math.max(-180, bounds.min_lon - lonDiff),
    max_lon: Math.min(180, bounds.max_lon + lonDiff),
  };
}

/**
 * Calculate the overlap percentage between two bounding boxes
 *
 * @param bounds1 - First bounding box
 * @param bounds2 - Second bounding box
 * @returns Overlap percentage (0-1)
 */
export function calculateBoundsOverlap(
  bounds1: { min_lat: number; max_lat: number; min_lon: number; max_lon: number },
  bounds2: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }
): number {
  const latOverlap = Math.max(
    0,
    Math.min(bounds1.max_lat, bounds2.max_lat) - Math.max(bounds1.min_lat, bounds2.min_lat)
  );
  const lonOverlap = Math.max(
    0,
    Math.min(bounds1.max_lon, bounds2.max_lon) - Math.max(bounds1.min_lon, bounds2.min_lon)
  );

  const overlapArea = latOverlap * lonOverlap;
  const bounds1Area = (bounds1.max_lat - bounds1.min_lat) * (bounds1.max_lon - bounds1.min_lon);

  return bounds1Area > 0 ? overlapArea / bounds1Area : 0;
}

