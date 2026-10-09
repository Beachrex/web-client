'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithPassword, type AuthErrorKey } from '@/lib/utils/password-auth';

const inputClass =
  'w-full rounded-md border border-[#D9D9D9] px-3 py-2 font-figtree text-[15px] text-[#222222] focus:border-[#0069AB] focus:outline-none';

/** E-mail + password sign-in with a "Forgot password?" link (accounts imported from the old site). */
export function EmailLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    login(result.value.token, result.value.user);
    onSuccess?.();
  };

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1 font-figtree text-[14px] text-[#4D4D4D]">
        {t('email')}
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 font-figtree text-[14px] text-[#4D4D4D]">
        {t('password')}
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && (
        <p role="alert" className="font-figtree text-[14px] text-red-600">
          {t(error)}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !email || !password}
        className="rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f] disabled:opacity-60"
      >
        {busy ? t('signingIn') : t('signIn')}
      </button>
      <Link
        href={`/${locale}/auth/forgot-password`}
        className="font-figtree text-[14px] text-[#0069AB] hover:underline"
      >
        {t('forgotPassword')}
      </Link>
    </form>
  );
}
