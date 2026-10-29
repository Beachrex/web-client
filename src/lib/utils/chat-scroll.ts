/**
 * Scroll decisions for the AI chat message list (pure, unit-tested in e2e/ai-chat-scroll.unit.spec.ts).
 *
 * The list is its own scroll container (fixed max height, `overflow-y-auto`), so the page never jumps
 * under the sticky header: we only ever set the container's `scrollTop`.
 */

/** How close to the bottom (px) still counts as "following" the conversation. */
export const CHAT_FOLLOW_THRESHOLD = 120;

/** Gap (px) kept above the newest message when its start is pinned to the top of the list. */
export const CHAT_TOP_GAP = 16;

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/** Pixels between the visible bottom edge of the container and the end of its content (never negative). */
export function distanceFromBottom({ scrollTop, scrollHeight, clientHeight }: ScrollMetrics): number {
  return Math.max(0, scrollHeight - clientHeight - scrollTop);
}

/**
 * Follow new content only when the reader is at (or near) the bottom. A reader who scrolled up to read
 * older messages is left alone.
 */
export function shouldAutoScroll(distance: number, threshold: number = CHAT_FOLLOW_THRESHOLD): boolean {
  return distance <= threshold;
}

/**
 * Where to scroll so the newest message is shown like in common chat apps: scroll to the bottom, unless
 * that would push the start of the newest message above the visible area (a long answer with beach
 * cards); then pin the message start to the top of the list instead.
 *
 * @param lastMessageTop offset of the newest message's top edge inside the scroll content (px)
 */
export function chatScrollTarget(
  { scrollHeight, clientHeight }: Omit<ScrollMetrics, 'scrollTop'>,
  lastMessageTop: number | null,
  gap: number = CHAT_TOP_GAP,
): number {
  const bottom = Math.max(0, scrollHeight - clientHeight);
  if (lastMessageTop === null) return bottom;
  return Math.max(0, Math.min(bottom, lastMessageTop - gap));
}
