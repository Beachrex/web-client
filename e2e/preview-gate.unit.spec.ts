import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import {
  PREVIEW_COOKIE_MAX_AGE,
  previewGateDecision,
  previewPageLocale,
  readPreviewGateConfig,
  sanitizeReturnPath,
  signPreviewCookie,
  verifyPreviewCookie,
  type PreviewGateConfig,
} from '@/lib/preview-gate/preview-gate';

/**
 * Owner 2026-10-29: dev and uat websites only after an e-mail magic link; production always open.
 * Backend ADR "Closed dev/uat websites behind an e-mail magic link".
 */
const SECRET = 'a'.repeat(64);
const NOW = Date.UTC(2026, 9, 29, 12, 0, 0);
const dev: PreviewGateConfig = { enabled: true, secret: SECRET, baseUrl: 'https://dev.beachrex.com' };

test.describe('preview cookie', () => {
  test('a signed cookie verifies until it expires (30 days)', async () => {
    const cookie = await signPreviewCookie(SECRET, NOW);
    expect(cookie).toMatch(/^v1\.\d+\.[0-9a-f]{16}\.[A-Za-z0-9_-]+$/);
    expect(await verifyPreviewCookie(SECRET, cookie, NOW)).toBe(true);
    expect(await verifyPreviewCookie(SECRET, cookie, NOW + (PREVIEW_COOKIE_MAX_AGE - 1) * 1000)).toBe(true);
    expect(await verifyPreviewCookie(SECRET, cookie, NOW + PREVIEW_COOKIE_MAX_AGE * 1000)).toBe(false);
  });

  test('another secret, a changed expiry or a broken value is rejected', async () => {
    const cookie = await signPreviewCookie(SECRET, NOW);
    const [v, exp, nonce, sig] = cookie.split('.') as [string, string, string, string];
    expect(await verifyPreviewCookie('b'.repeat(64), cookie, NOW)).toBe(false);
    expect(await verifyPreviewCookie(SECRET, `${v}.${Number(exp) + 3600}.${nonce}.${sig}`, NOW)).toBe(false);
    expect(await verifyPreviewCookie(SECRET, `${v}.${exp}.${nonce}.${sig.slice(0, -1)}x`, NOW)).toBe(false);
    for (const bad of [undefined, '', 'v1', 'v2.1.2.3', 'x'.repeat(200), `${cookie}.extra`]) {
      expect(await verifyPreviewCookie(SECRET, bad, NOW), String(bad)).toBe(false);
    }
    expect(await verifyPreviewCookie('', cookie, NOW)).toBe(false);
  });
});

test.describe('gate decision', () => {
  test('dev/uat without a cookie go to the e-mail form; with a cookie they are open', async () => {
    const cookie = await signPreviewCookie(SECRET, NOW);
    for (const baseUrl of ['https://dev.beachrex.com', 'https://uat.beachrex.com']) {
      const config = { ...dev, baseUrl };
      expect(await previewGateDecision(config, '/si/plaze', undefined, NOW)).toBe('login');
      expect(await previewGateDecision(config, '/', 'garbage', NOW)).toBe('login');
      expect(await previewGateDecision(config, '/si/plaze', cookie, NOW)).toBe('open');
    }
  });

  test('production is always open, even when switched on', async () => {
    for (const baseUrl of ['https://beachrex.com', 'https://www.beachrex.com', 'beachrex.com']) {
      expect(await previewGateDecision({ ...dev, baseUrl }, '/en', undefined, NOW)).toBe('open');
      expect(await previewGateDecision({ ...dev, baseUrl, secret: '' }, '/en', undefined, NOW)).toBe('open');
    }
  });

  test('off unless PREVIEW_GATE_ENABLED is exactly true', async () => {
    for (const value of [undefined, '', 'false', '1', 'yes']) {
      const config = readPreviewGateConfig({ PREVIEW_GATE_ENABLED: value, PREVIEW_GATE_SECRET: SECRET, NEXT_PUBLIC_BASE_URL: 'https://dev.beachrex.com' });
      expect(await previewGateDecision(config, '/en', undefined, NOW), String(value)).toBe('open');
    }
    const on = readPreviewGateConfig({ PREVIEW_GATE_ENABLED: ' TRUE ', PREVIEW_GATE_SECRET: SECRET, NEXT_PUBLIC_BASE_URL: 'https://dev.beachrex.com' });
    expect(await previewGateDecision(on, '/en', undefined, NOW)).toBe('login');
  });

  test('switched on without a usable secret fails closed', async () => {
    expect(await previewGateDecision({ ...dev, secret: '' }, '/en', undefined, NOW)).toBe('misconfigured');
    expect(await previewGateDecision({ ...dev, secret: 'short' }, '/en', undefined, NOW)).toBe('misconfigured');
    // a cookie signed with a short secret does not open it either
    const cookie = await signPreviewCookie('short', NOW);
    expect(await previewGateDecision({ ...dev, secret: 'short' }, '/en', cookie, NOW)).toBe('misconfigured');
  });

  test('gate pages, Next internals and static files never need the cookie', async () => {
    for (const path of ['/preview-access', '/preview-access/callback', '/preview-access/verify', '/_next/static/x.js', '/_next/data/x', '/robots.txt', '/favicon.ico', '/site.webmanifest', '/images/x.png', '/brand/a.svg']) {
      expect(await previewGateDecision(dev, path, undefined, NOW), path).toBe('open');
    }
    for (const path of ['/', '/en', '/preview-accessx', '/si/plaze/evropa', '/en/ai/chat']) {
      expect(await previewGateDecision(dev, path, undefined, NOW), path).toBe('login');
    }
  });
});

test.describe('return path', () => {
  test('keeps same-site paths', () => {
    expect(sanitizeReturnPath('/si/plaze?x=1#top')).toBe('/si/plaze?x=1#top');
    expect(sanitizeReturnPath('/')).toBe('/');
  });

  test('anything else becomes the home page (no open redirect)', () => {
    for (const bad of [null, undefined, '', 'https://evil.example', '//evil.example', '/\\evil.example', '\\\\evil.example', 'javascript:alert(1)', '/\nLocation: x', 'evil.example/x', `/${'a'.repeat(600)}`, '/preview-access', '/preview-access/verify']) {
      expect(sanitizeReturnPath(bad), String(bad)).toBe('/');
    }
  });
});

test('gate page language: the wanted page, then the browser, then English', () => {
  expect(previewPageLocale('/si/plaze', 'de-DE,de;q=0.9')).toBe('si');
  expect(previewPageLocale('/', 'sl-SI,sl;q=0.9,en;q=0.8')).toBe('si');
  expect(previewPageLocale('/', 'uk,ru;q=0.5')).toBe('ua');
  expect(previewPageLocale('/', 'ja,zh;q=0.5')).toBe('en');
  expect(previewPageLocale(null, null)).toBe('en');
});

test.describe('middleware wiring', () => {
  const source = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');

  test('the gate runs before the locale handling and reads the env at runtime', () => {
    const gate = source.indexOf('previewGateDecision(');
    expect(gate).toBeGreaterThan(0);
    expect(gate).toBeLessThan(source.indexOf('legacySlovenianPath(request'));
    expect(gate).toBeLessThan(source.indexOf('beachesMiddleware(request)'));
    expect(source).toContain('process.env.PREVIEW_GATE_ENABLED');
    expect(source).toContain('process.env.PREVIEW_GATE_SECRET');
  });

  test('the secret is never public', () => {
    for (const file of ['src/middleware.ts', 'src/lib/preview-gate/preview-gate.ts', 'src/env.ts', 'Dockerfile.prod']) {
      expect(readFileSync(join(process.cwd(), file), 'utf8'), file).not.toContain('NEXT_PUBLIC_PREVIEW');
    }
  });
});
