import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * TASK-010 (owner 2026-10-29): the AI chat as a widget on every page that knows the current page, and
 * (same day) a conversation that survives closing the tab or the browser, with a "New conversation" button.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const helpers = () => import('@/lib/utils/ai-chat-widget');

test('page type from the URL in every locale', async () => {
  const { pageTypeFromPath } = await helpers();
  expect(pageTypeFromPath('/en')).toBe('home');
  expect(pageTypeFromPath('/si/')).toBe('home');
  expect(pageTypeFromPath('/en/beaches')).toBe('destination');
  expect(pageTypeFromPath('/si/plaze/evropa')).toBe('destination');
  expect(pageTypeFromPath('/si/plaze/evropa/hrvaska')).toBe('country');
  expect(pageTypeFromPath('/de/strande/europa/kroatien?x=1')).toBe('country');
  expect(pageTypeFromPath('/el/paralies/evropi/ellada/kriti/chania/balos')).toBe('destination');
  expect(pageTypeFromPath('/en/beach-map')).toBe('map');
  expect(pageTypeFromPath('/ru/karta-plyazhey')).toBe('map');
  expect(pageTypeFromPath('/si/tip-plaze/pesek')).toBe('destination');
  expect(pageTypeFromPath('/en/p/terms')).toBe('article');
  expect(pageTypeFromPath('/hr/o-nama')).toBe('article');
  expect(pageTypeFromPath('/en/ai/itinerary')).toBe('other');
});

test('page_context: a registered beach page sends its id, other pages a title, never junk', async () => {
  const { buildPageContext, safePagePath, cleanDocumentTitle, PAGE_CONTEXT_MAX_PATH } = await helpers();

  expect(buildPageContext('/si/plaze/evropa/hrvaska/split/plaza-bacvice', { pageType: 'beach', beachId: 989, title: 'Plaža Bačvice' }, 'x')).toEqual({
    page_type: 'beach', path: '/si/plaze/evropa/hrvaska/split/plaza-bacvice', beach_id: 989, title: 'Plaža Bačvice',
  });
  // The beach id is only sent for beach pages, and only a valid one.
  expect(buildPageContext('/si/plaze/a/b/c', { pageType: 'city', beachId: 5, title: 'Split' }).beach_id).toBeUndefined();
  expect(buildPageContext('/si/plaze/a/b/c', { pageType: 'beach', beachId: 0 }).beach_id).toBeUndefined();
  expect(buildPageContext('/si/plaze/a/b/c', { pageType: 'beach', beachId: 1.5 }).beach_id).toBeUndefined();
  expect(buildPageContext('/si/plaze/a/b/c', { pageType: 'beach', beachId: 2147483648 }).beach_id).toBeUndefined();

  // Without a registered page: URL guess + document title without the site suffix; home sends no title.
  expect(buildPageContext('/en/beaches/europe/croatia', null, 'Beaches in Croatia | BeachRex')).toEqual({
    page_type: 'country', path: '/en/beaches/europe/croatia', title: 'Beaches in Croatia',
  });
  expect(buildPageContext('/en', null, 'BeachRex')).toEqual({ page_type: 'home', path: '/en' });
  expect(cleanDocumentTitle('Zlatni rat – Beachrex')).toBe('Zlatni rat');
  expect(buildPageContext('/en/x', null, 'a'.repeat(200)).title).toHaveLength(120);

  // Path: query/hash dropped, non-ASCII percent-encoded, only the backend's characters, ≤ 300, no cut escapes.
  expect(safePagePath('/el/παραλίες?q=1#top')).toBe('/el/%CF%80%CE%B1%CF%81%CE%B1%CE%BB%CE%AF%CE%B5%CF%82');
  expect(safePagePath('/en/a b!(c)')).toBe('/en/a%20bc');
  expect(safePagePath('')).toBe('/');
  const long = safePagePath(`/${'š'.repeat(200)}`);
  expect(long.length).toBeLessThanOrEqual(PAGE_CONTEXT_MAX_PATH);
  expect(long).toMatch(/^\/(%[0-9A-F]{2})+$/);
  expect(/^\/[A-Za-z0-9\-._~/%]*$/.test(safePagePath('/en/"><script>'))).toBe(true);
});

test('widget visibility: off switch hides it everywhere, the full chat page never shows it', async () => {
  const { isAiChatWidgetVisible } = await helpers();
  expect(isAiChatWidgetVisible(false, '/en')).toBe(false);
  expect(isAiChatWidgetVisible(false, '/en/beaches')).toBe(false);
  expect(isAiChatWidgetVisible(true, '/en')).toBe(true);
  expect(isAiChatWidgetVisible(true, '/si/plaze/evropa/hrvaska')).toBe(true);
  expect(isAiChatWidgetVisible(true, '/en/ai')).toBe(true);
  expect(isAiChatWidgetVisible(true, '/en/ai/itinerary')).toBe(true);
  expect(isAiChatWidgetVisible(true, '/en/ai/chat')).toBe(false);
  expect(isAiChatWidgetVisible(true, '/si/ai/chat/')).toBe(false);
  expect(isAiChatWidgetVisible(true, null)).toBe(true);
});

test('persistence: round trip, cap to the newest 50, 7-day expiry, corrupt or foreign data → nothing', async () => {
  const { serializeChat, restoreChat, capMessages, AI_CHAT_MAX_MESSAGES, AI_CHAT_TTL_MS } = await helpers();
  const now = Date.UTC(2026, 9, 29, 12);
  const msg = (i: number) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: `m${i}`, timestamp: new Date(now).toISOString() });

  const raw = serializeChat('abc', [msg(0), { ...msg(1), format: 'markdown' as const, locale: 'si', beaches: [] }], now);
  expect(restoreChat(raw, now)).toEqual({
    v: 1, sessionId: 'abc', updatedAt: now,
    messages: [msg(0), { ...msg(1), format: 'markdown', locale: 'si', beaches: [] }],
  });

  const many = Array.from({ length: 60 }, (_, i) => msg(i));
  const restored = restoreChat(serializeChat(null, many, now), now)!;
  expect(restored.messages).toHaveLength(AI_CHAT_MAX_MESSAGES);
  expect(restored.messages[0]!.content).toBe('m10');
  expect(restored.messages.at(-1)!.content).toBe('m59');
  expect(capMessages([1, 2, 3], 2)).toEqual([2, 3]);
  expect(capMessages([1, 2], 2)).toEqual([1, 2]);

  // Expiry: exactly 7 days still restores, one millisecond more does not.
  expect(restoreChat(raw, now + AI_CHAT_TTL_MS)).not.toBeNull();
  expect(restoreChat(raw, now + AI_CHAT_TTL_MS + 1)).toBeNull();

  expect(restoreChat(null, now)).toBeNull();
  expect(restoreChat('', now)).toBeNull();
  expect(restoreChat('{not json', now)).toBeNull();
  expect(restoreChat('null', now)).toBeNull();
  expect(restoreChat('[1,2]', now)).toBeNull();
  expect(restoreChat(JSON.stringify({ v: 2, updatedAt: now, messages: [msg(0)] }), now)).toBeNull();
  expect(restoreChat(JSON.stringify({ v: 1, updatedAt: 'x', messages: [msg(0)] }), now)).toBeNull();
  expect(restoreChat(JSON.stringify({ v: 1, updatedAt: now, messages: [] }), now)).toBeNull();
  // Broken messages are dropped, good ones kept; a non-string session id becomes null.
  const mixed = restoreChat(JSON.stringify({
    v: 1, updatedAt: now, sessionId: 5,
    messages: [msg(0), { role: 'system', content: 'x', timestamp: '' }, { role: 'user', content: 1 }, null, { ...msg(1), format: 'html' }],
  }), now)!;
  expect(mixed.messages).toEqual([msg(0)]);
  expect(mixed.sessionId).toBeNull();
});

test('provider: localStorage wrapped in try/catch, versioned key, synced between tabs, reset clears it', () => {
  const src = read('src/contexts/AiChatContext.tsx');
  expect(read('src/lib/utils/ai-chat-widget.ts')).toContain("AI_CHAT_STORAGE_KEY = 'beachrex.aiChat.v1'");
  expect(src).not.toContain('sessionStorage');
  expect(src.match(/window\.localStorage\./g)).toHaveLength(3);
  expect(src.match(/try \{/g)?.length).toBeGreaterThanOrEqual(2);
  expect(src).toContain("window.addEventListener('storage', onStorage)");
  expect(src).toContain('fromOtherTabRef'); // no write-back loop between tabs
  expect(src).toMatch(/const reset = [\s\S]*?writeStorage\(null\)/);
  expect(src).toContain('pageContext });');
  expect(read('src/lib/utils/ai-chat.ts')).toContain('page_context: args.pageContext');
});

test('widget is mounted once in the locale layout, inside the AI switch provider; page and widget share the chat', () => {
  const layout = read('src/app/[locale]/layout.tsx');
  expect(layout.match(/<AiChatWidget \/>/g)).toHaveLength(1);
  expect(layout.indexOf('<SiteSettingsProvider')).toBeLessThan(layout.indexOf('<AiChatProvider>'));
  const widget = read('src/components/AiChat/AiChatWidget.tsx');
  expect(widget).toContain('if (!isAiChatWidgetVisible(aiAssistantEnabled, pathname)) return null;');
  expect(widget).toContain("e.key === 'Escape'");
  expect(widget).toContain('role="dialog"');
  expect(widget).toContain('z-[1080]'); // above the sticky header (1050), below media overlays (1100)
  const page = read('src/app/[locale]/ai/chat/page.tsx');
  expect(page).toContain('useAiChat()');
  expect(page).toContain('<ChatMessageList');
  const geo = read('src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx');
  expect(geo).toContain('<AiChatPageMarker pageType="beach" beachId={beach.basic_info?.id}');
});

test('widget texts exist in all 19 locales with the {name} placeholder', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  const en = (JSON.parse(read('messages/en.json')) as { AI: { chat: { widget: Record<string, string> } } }).AI.chat.widget;
  for (const file of files) {
    const w = (JSON.parse(read(`messages/${file}`)) as { AI: { chat: { widget: Record<string, string> } } }).AI.chat.widget;
    for (const key of Object.keys(en)) {
      expect(w[key], `${file} AI.chat.widget.${key}`).toBeTruthy();
      expect(w[key], `${file} ${key}`).not.toContain('{{');
      if (file !== 'en.json') expect(w[key], `${file} ${key} translated`).not.toBe(en[key]);
    }
    expect(w.greetingBeach, file).toContain('{name}');
    expect(w.placeholderBeach, file).toContain('{name}');
  }
});
