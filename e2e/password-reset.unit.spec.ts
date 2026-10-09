import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner request 2026-10-09: e-mail sign-in with "Forgot password?" and the reset pages
 * (imported old-site accounts have a random password).
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const KEYS = [
  'orDivider', 'signInWithEmail', 'email', 'password', 'signIn', 'forgotPassword', 'invalidCredentials',
  'tooManyAttempts', 'genericError', 'forgotTitle', 'forgotDescription', 'sendLink', 'forgotSent', 'resetTitle',
  'newPassword', 'confirmPassword', 'passwordHint', 'passwordsDontMatch', 'savePassword', 'resetDone',
  'resetDoneSignIn', 'resetInvalidLink', 'requestNewLink',
];

test('sign-in and reset texts exist in all 19 locales', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const file of files) {
    const auth = (JSON.parse(read(`messages/${file}`)) as { Auth: Record<string, string> }).Auth;
    for (const key of KEYS) expect(auth[key], `${file} Auth.${key}`).toBeTruthy();
  }
});

test('API status maps to the right message', async () => {
  const { errorKeyForStatus } = await import('@/lib/utils/password-auth');
  expect(errorKeyForStatus(422, 'invalidCredentials')).toBe('invalidCredentials');
  expect(errorKeyForStatus(422, 'resetInvalidLink')).toBe('resetInvalidLink');
  expect(errorKeyForStatus(429, 'invalidCredentials')).toBe('tooManyAttempts');
  expect(errorKeyForStatus(500, 'invalidCredentials')).toBe('genericError');
  expect(errorKeyForStatus(undefined, 'invalidCredentials')).toBe('genericError');
});

test('reset pages exist, are not indexed and the AI pages offer e-mail sign-in', () => {
  const layout = read('src/app/[locale]/auth/layout.tsx');
  expect(layout).toContain('index: false');
  expect(layout).toContain("referrer: 'no-referrer'");
  expect(read('src/app/[locale]/auth/forgot-password/page.tsx')).toContain('<ForgotPasswordForm');
  expect(read('src/app/[locale]/auth/reset-password/page.tsx')).toContain('<ResetPasswordForm');
  expect(read('src/components/Auth/EmailLoginForm.tsx')).toContain('/auth/forgot-password');
  for (const page of ['src/app/[locale]/ai/chat/page.tsx', 'src/app/[locale]/ai/itinerary/page.tsx']) {
    expect(read(page)).toContain('<SignInOptions />');
  }
});
