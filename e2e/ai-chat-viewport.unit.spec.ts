import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-29: "ta AI chat widget na mobile responsive popravi". On an iPhone with the keyboard open the
 * widget header was scrolled off the screen, a white gap filled the top half and the page showed through
 * below the composer: the full-screen panel used the layout viewport (`inset-0`) while the keyboard only
 * shrinks the visual viewport. The sheet now follows window.visualViewport.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

test('sheet rect follows the visual viewport (keyboard open and closed)', async () => {
  const { chatSheetRect, KEYBOARD_MIN_HEIGHT } = await import('@/lib/utils/chat-viewport');
  // iPhone 13, keyboard closed.
  expect(chatSheetRect({ height: 664, offsetTop: 0, scale: 1 }, 664)).toEqual({ top: 0, height: 664, keyboardOpen: false });
  // Keyboard open: iOS scrolled the layout viewport by 290px, 374px left above the keyboard.
  expect(chatSheetRect({ height: 374.4, offsetTop: 290.2, scale: 1 }, 664)).toEqual({ top: 290, height: 374, keyboardOpen: true });
  // Android Chrome (resizes-visual): offset 0, shorter viewport.
  expect(chatSheetRect({ height: 420, offsetTop: 0, scale: 1 }, 780)).toEqual({ top: 0, height: 420, keyboardOpen: true });
  // A small browser-bar change is not a keyboard.
  expect(chatSheetRect({ height: 664 - KEYBOARD_MIN_HEIGHT, offsetTop: 0, scale: 1 }, 664)?.keyboardOpen).toBe(false);
  // iOS rubber-band overscroll: never above the screen.
  expect(chatSheetRect({ height: 664, offsetTop: -12, scale: 1 }, 664)?.top).toBe(0);
});

test('no visual viewport or a pinch-zoomed page: CSS fallback (100dvh)', async () => {
  const { chatSheetRect } = await import('@/lib/utils/chat-viewport');
  expect(chatSheetRect(null, 664)).toBeNull();
  expect(chatSheetRect({ height: 300, offsetTop: 100, scale: 2 }, 664)).toBeNull();
  expect(chatSheetRect({ height: 0, offsetTop: 0, scale: 1 }, 664)).toBeNull();
  expect(chatSheetRect({ height: 500, offsetTop: Number.NaN, scale: 1 }, 664)).toBeNull();
});

test('sheet media query matches the CSS (portrait phones and landscape phones)', async () => {
  const { CHAT_SHEET_MEDIA } = await import('@/lib/utils/chat-viewport');
  expect(CHAT_SHEET_MEDIA).toBe('(max-width: 639px), (max-height: 499px)');
  // The desktop panel applies exactly where the sheet does not.
  expect(read('src/styles/globals.css')).toContain('@media (min-width: 640px) and (min-height: 500px) {\n  .ai-chat-panel {');
});

test('widget: sheet tracks the viewport, locks the page, keeps 44px header buttons and a 16px input', () => {
  const widget = read('src/components/AiChat/AiChatWidget.tsx');
  expect(widget).toContain("panel.style.setProperty('--ai-chat-top'");
  expect(widget).toContain("panel.style.setProperty('--ai-chat-height'");
  expect(widget).toContain("vv?.addEventListener('resize', schedule)");
  expect(widget).toContain("vv?.addEventListener('scroll', schedule)");
  expect(widget).toContain('lockBodyScroll()');
  expect(widget).toContain('className="ai-chat-panel');
  expect(widget).not.toContain('fixed inset-0'); // the old layout-viewport panel
  expect((widget.match(/h-11/g) ?? []).length).toBeGreaterThanOrEqual(3);
  expect(widget).toContain("aria-label={t('widget.close')}");
  const css = read('src/styles/globals.css');
  expect(css).toMatch(/\.ai-chat-panel \{[^}]*top: var\(--ai-chat-top, 0px\);[^}]*height: var\(--ai-chat-height, 100vh\);/);
  expect(css).toMatch(/\.ai-chat-input \{\s*font-size: 16px !important;/);
  expect(read('src/components/AiChat/ChatComposer.tsx')).toContain('ai-chat-input');
});

test('message list: long words wrap, the list follows when the keyboard shrinks it', () => {
  const list = read('src/components/AiChat/ChatMessageList.tsx');
  expect(list).toContain('[overflow-wrap:anywhere]');
  expect(list).toContain('observer.observe(container)');
});
