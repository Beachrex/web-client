import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-09: "the AI chat works badly and gives no links to beaches". The page now keeps the
 * conversation (session id), sends the page language, links beach names inside the answer and shows
 * specific error messages.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const beach = (id: number, name: string) => ({
  id, name, slug: `plaza-${id}`, continent_slug: 'evropa', country_slug: 'hrvaska',
});

test('beach names in the answer become link parts (longest name first, any case)', async () => {
  const { linkBeachNames } = await import('@/lib/utils/ai-chat');
  const parts = linkBeachNames('Priporočam Plaža Zlatni rat in zlatni rat mini.', [beach(1, 'Zlatni rat'), beach(2, 'Plaža Zlatni rat')]);

  expect(parts.map((p) => p.text).join('')).toBe('Priporočam Plaža Zlatni rat in zlatni rat mini.');
  expect(parts.filter((p) => p.beach).map((p) => [p.text, p.beach?.id])).toEqual([['Plaža Zlatni rat', 2], ['zlatni rat', 1]]);
  expect(linkBeachNames('Brez plaž.', [])).toEqual([{ text: 'Brez plaž.' }]);
  expect(linkBeachNames('Regex (chars) [x]', [beach(3, '(chars)')]).find((p) => p.beach)?.text).toBe('(chars)');
});

test('API status maps to a specific message', async () => {
  const { chatErrorKey } = await import('@/lib/utils/ai-chat');
  expect(chatErrorKey(503)).toBe('errorBusy');
  expect(chatErrorKey(429)).toBe('errorTooMany');
  expect(chatErrorKey(413)).toBe('errorTooLong');
  expect(chatErrorKey(500)).toBe('error');
});

test('the request keeps the session, page language, token and location', () => {
  const helper = read('src/lib/utils/ai-chat.ts');
  expect(helper).toContain("'Accept-Language': args.locale");
  expect(helper).toContain('session_id: args.sessionId');
  expect(helper).toContain('Authorization');
  expect(helper).toContain('context: { location: args.location }');
  const page = read('src/app/[locale]/ai/chat/page.tsx');
  expect(page).toContain('setSessionId(result.reply.session_id)');
  expect(page).toContain('linkBeachNames(message.content, message.beaches)');
  expect(page).not.toContain('Surface:');
  expect(page).not.toContain('% match');
});

test('new chat texts exist in all 19 locales', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const file of files) {
    const chat = (JSON.parse(read(`messages/${file}`)) as { AI: { chat: Record<string, string> } }).AI.chat;
    for (const key of ['match', 'useLocation', 'locationOn', 'locationDenied', 'errorBusy', 'errorTooMany', 'errorTooLong']) {
      expect(chat[key], `${file} AI.chat.${key}`).toBeTruthy();
    }
    expect(chat.match, file).toContain('{percent}');
  }
});

test('agent markdown: own links become relative, foreign links stay text, bold and list lines', async () => {
  const { parseAgentMarkdown } = await import('@/lib/utils/ai-chat');
  const lines = parseAgentMarkdown(
    'Priporočam [Plaža Bačvice](https://dev.beachrex.com/si/plaze/evropa/hrvaska/split/plaza-bacvice) — **pesek**.\n'
    + '- [Zlatni rat](https://beachrex.com/si/plaze/evropa/hrvaska/bol/zlatni-rat)\n'
    + '- [Zlo](https://evil.example/phish) <script>x</script>',
    'https://dev.beachrex.com',
  );

  expect(lines[0]).toEqual([
    { text: 'Priporočam ' },
    { text: 'Plaža Bačvice', href: '/si/plaze/evropa/hrvaska/split/plaza-bacvice' },
    { text: ' — ' },
    { text: 'pesek', bold: true },
    { text: '.' },
  ]);
  expect(lines[1]).toEqual([{ text: '• ' }, { text: 'Zlatni rat', href: '/si/plaze/evropa/hrvaska/bol/zlatni-rat' }]);
  expect(lines[2].find((p) => p.text === 'Zlo')?.href).toBeUndefined();
  expect(lines[2].map((p) => p.text).join('')).toContain('<script>x</script>'); // rendered as text by React, never as HTML
});
