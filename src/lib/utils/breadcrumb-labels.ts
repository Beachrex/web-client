/**
 * Breadcrumb labels from API objects (owner 2026-10-12, Greek beach page: the breadcrumb read
 * "Paralies > … > Obalno Kraska > Beach Mesecev Zaliv", built from URL slugs, never translated).
 *
 * Collects `slug → name` from the page's own object and its nested places (continent, country, region,
 * island, city, beach `location` / `basic_info`). Prev/next `navigation` is not walked.
 */
const NESTED_KEYS = ['continent', 'country', 'region', 'island', 'city', 'location', 'basic_info'] as const;

export function breadcrumbLabels(...roots: unknown[]): Record<string, string> {
  const labels: Record<string, string> = {};

  const visit = (node: unknown, depth: number): void => {
    if (!node || typeof node !== 'object' || depth > 3) return;
    const record = node as Record<string, unknown>;
    const { slug, name } = record;
    if (typeof slug === 'string' && slug && typeof name === 'string' && name.trim() && !(slug in labels)) {
      labels[slug] = name.trim();
    }
    for (const key of NESTED_KEYS) visit(record[key], depth + 1);
  };

  roots.forEach((root) => visit(root, 0));
  return labels;
}

/** Human label of one URL segment: a known name, else the slug in title case. */
export function breadcrumbLabel(segment: string, labels: Record<string, string> = {}): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep the raw segment
  }
  const known = labels[decoded];
  if (known) return known;
  return decoded
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
