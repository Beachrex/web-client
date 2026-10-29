import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Audit 2026-10-09 (E1): a page that threw while rendering showed the default English Next.js
 * error screen, and AI chat beach images used NEXT_PUBLIC_IMAGOR_ENDPOINT, which is never set,
 * so every image URL was relative and broken.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

test('localized error boundaries exist', () => {
  const error = read('src/app/[locale]/error.tsx');
  expect(error).toContain("'use client'");
  expect(error).toContain("useTranslations('ErrorPage')");
  expect(error).toContain('reset()');
  const globalError = read('src/app/global-error.tsx');
  expect(globalError).toContain('<html');
  expect(globalError).toContain('messages/${current}.json');
});

test('ErrorPage messages exist in all 19 locales', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const file of files) {
    const messages = JSON.parse(read(`messages/${file}`)) as { ErrorPage?: Record<string, string> };
    for (const key of ['title', 'subtitle', 'description', 'retry', 'goHome']) {
      expect(messages.ErrorPage?.[key], `${file} ErrorPage.${key}`).toBeTruthy();
    }
  }
});

test('AI chat beach images use the CDN builder', () => {
  const chat = read('src/components/AiChat/ChatMessageList.tsx'); // TASK-010: shared by page and widget
  expect(chat).not.toContain('NEXT_PUBLIC_IMAGOR_ENDPOINT');
  expect(chat).toContain("buildCdnUrl(beach.main_image, 'list')");
});
