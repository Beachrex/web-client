import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-29: free AI chat $5/day ("resting until tomorrow" instead of a generic error) and Cloudflare
 * Turnstile on the chat (backend ADR "AI chat daily cost cap and Turnstile").
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

test('the daily limit and the robot check get their own messages', async () => {
  const { chatErrorKey } = await import('@/lib/utils/ai-chat');

  expect(chatErrorKey(503, { error: 'service_unavailable', reason: 'daily_limit', retry_after: '2026-10-30T00:00:00+01:00' })).toBe('errorResting');
  expect(chatErrorKey(503, { error: 'ai_unavailable' })).toBe('errorBusy');
  expect(chatErrorKey(503, null)).toBe('errorBusy');
  expect(chatErrorKey(403, { error: 'turnstile_required' })).toBe('errorRobot');
  expect(chatErrorKey(403, { error: 'turnstile_failed' })).toBe('errorRobot');
  expect(chatErrorKey(403, { error: 'forbidden' })).toBe('error');
  expect(chatErrorKey(429, { reason: 'daily_limit' })).toBe('errorTooMany');
});

test('turnstile is off without a site key and only a 403 turnstile_* is a challenge', async () => {
  const { turnstileEnabled, isTurnstileChallenge, TURNSTILE_ACTION, TURNSTILE_SCRIPT_URL } = await import('@/lib/utils/turnstile');

  expect(turnstileEnabled(undefined)).toBe(false);
  expect(turnstileEnabled(null)).toBe(false);
  expect(turnstileEnabled('  ')).toBe(false);
  expect(turnstileEnabled('0x4AAAAAAA')).toBe(true);

  expect(isTurnstileChallenge(403, 'turnstile_required')).toBe(true);
  expect(isTurnstileChallenge(403, 'turnstile_failed')).toBe(true);
  expect(isTurnstileChallenge(400, 'turnstile_required')).toBe(false);
  expect(isTurnstileChallenge(403, 'ai_disabled')).toBe(false);

  // must match TurnstileVerifier::ACTION in the backend; explicit rendering only (no auto widgets)
  expect(TURNSTILE_ACTION).toBe('ai_chat');
  expect(TURNSTILE_SCRIPT_URL).toBe('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
});

test('the token goes with the first message and once more when the server asks', () => {
  const helper = read('src/lib/utils/ai-chat.ts');
  expect(helper).toContain('turnstile_token: args.turnstileToken');

  const context = read('src/contexts/AiChatContext.tsx');
  expect(context).toContain('turnstileToken: sessionId ? null : await robotToken()');
  expect(context).toContain('result.challenge');
  expect(context).toContain('env.NEXT_PUBLIC_TURNSTILE_SITE_KEY');
});

test('the site key is a build-time value of the production image', () => {
  const docker = read('Dockerfile.prod');
  expect(docker).toContain('ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  expect(docker).toContain('ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}');
  expect(read('src/env.ts')).toContain('NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY');
});

test('the new messages exist in all 19 languages', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  const en = JSON.parse(read('messages/en.json')).AI.chat;
  for (const file of files) {
    const chat = JSON.parse(read(`messages/${file}`)).AI.chat;
    for (const key of ['errorResting', 'errorRobot']) {
      expect(typeof chat[key], `${file} AI.chat.${key}`).toBe('string');
      expect(chat[key].length, `${file} AI.chat.${key}`).toBeGreaterThan(20);
      if (file !== 'en.json') expect(chat[key], `${file} AI.chat.${key} is translated`).not.toBe(en[key]);
    }
  }
});
