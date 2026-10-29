import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-29: "when you chat, the conversation does not scroll: the new question and answer are not
 * shown, only the scrollbar moves". The message list is a fixed-height scroll container and nothing ever
 * set its scrollTop, so new messages were appended below the visible area.
 */
const page = () => readFileSync(join(process.cwd(), 'src/app/[locale]/ai/chat/page.tsx'), 'utf8');

test('follow only when the reader is near the bottom', async () => {
  const { distanceFromBottom, shouldAutoScroll, CHAT_FOLLOW_THRESHOLD } = await import('@/lib/utils/chat-scroll');
  expect(distanceFromBottom({ scrollTop: 400, scrollHeight: 1000, clientHeight: 600 })).toBe(0);
  expect(distanceFromBottom({ scrollTop: 0, scrollHeight: 1000, clientHeight: 600 })).toBe(400);
  expect(distanceFromBottom({ scrollTop: 0, scrollHeight: 300, clientHeight: 600 })).toBe(0);
  expect(shouldAutoScroll(0)).toBe(true);
  expect(shouldAutoScroll(CHAT_FOLLOW_THRESHOLD)).toBe(true);
  expect(shouldAutoScroll(CHAT_FOLLOW_THRESHOLD + 1)).toBe(false);
  expect(shouldAutoScroll(50, 20)).toBe(false);
});

test('scroll target: bottom for a short newest message, its start for a long one', async () => {
  const { chatScrollTarget, CHAT_TOP_GAP } = await import('@/lib/utils/chat-scroll');
  // Short answer (top at 1300 of 1500 content, 600 visible): scroll to the bottom (900).
  expect(chatScrollTarget({ scrollHeight: 1500, clientHeight: 600 }, 1300)).toBe(900);
  // Long answer starting at 700 (800 px tall): pin its start below the top gap, not the bottom.
  expect(chatScrollTarget({ scrollHeight: 1500, clientHeight: 600 }, 700)).toBe(700 - CHAT_TOP_GAP);
  // Content shorter than the container: nothing to scroll.
  expect(chatScrollTarget({ scrollHeight: 400, clientHeight: 600 }, 200)).toBe(0);
  expect(chatScrollTarget({ scrollHeight: 1500, clientHeight: 600 }, null)).toBe(900);
  expect(chatScrollTarget({ scrollHeight: 1500, clientHeight: 600 }, 5)).toBe(0);
});

test('the chat page scrolls its own message container (not the window) after render and on resize', () => {
  const src = page();
  expect(src).toContain('ref={scrollRef}');
  expect(src).toContain('onScroll={handleScroll}');
  expect(src).toContain('container.scrollTop = chatScrollTarget(');
  expect(src).toMatch(/useLayoutEffect\(\(\) => \{\s*if \(followRef\.current\) scrollToNewest\(\);\s*\}, \[messages\.length, isLoading/);
  expect(src).toContain('new ResizeObserver(');
  expect(src).not.toContain('scrollIntoView');
  expect(src).not.toContain('window.scrollTo');
  // Sending always resumes following.
  expect(src).toMatch(/followRef\.current = true;\s*setMessages\(\(prev\) => \[\.\.\.prev, userMessage\]\)/);
});
