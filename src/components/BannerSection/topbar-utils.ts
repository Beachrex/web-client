

export function formatRegionPillLabel(
  name: string,
  maxChars = 5,
): string {
  return name.toUpperCase().slice(0, maxChars);
}
