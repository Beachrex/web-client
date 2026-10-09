'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  MIN_PASSWORD_LENGTH,
  setNewPassword,
  signInWithPassword,
  type AuthErrorKey,
} from '@/lib/utils/password-auth';

const inputClass =
  'w-full rounded-md border border-[#D9D9D9] px-3 py-2 font-figtree text-[15px] text-[#222222] focus:border-[#0069AB] focus:outline-none';

/**
 * New password from the e-mail link (`?token=…&email=…`). After saving, the user is signed in
 * with the new password.
 */
export function ResetPasswordForm() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  // Read once: the effect below removes them from the address bar.
  const [token] = useState(() => searchParams.get('token') ?? '');
  const [email] = useState(() => searchParams.get('email') ?? '');
  const locale = useLocale();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<AuthErrorKey | 'passwordsDontMatch' | null>(null);
  const [done, setDone] = useState<'signedIn' | 'changed' | null>(null);
  const [busy, setBusy] = useState(false);

  const linkBroken = !token || !email;

  // The token is kept in state; take it out of the address bar (history, analytics, screenshots).
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('passwordsDontMatch');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await setNewPassword(token, email, password);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    const signIn = await signInWithPassword(email, password);
    setBusy(false);
    if (signIn.ok) {
      login(signIn.value.token, signIn.value.user);
      setDone('signedIn');
    } else {
      setDone('changed');
    }
  };

  const homeLink = (
    <Link
      href={`/${locale}`}
      className="inline-block rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f]"
    >
      {t('returnHome')}
    </Link>
  );

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="status" className="rounded-md bg-[#EAF4FB] p-4 font-figtree text-[15px] text-[#1A3C68]">
          {done === 'signedIn' ? t('resetDone') : t('resetDoneSignIn')}
        </p>
        {homeLink}
      </div>
    );
  }

  if (linkBroken || error === 'resetInvalidLink') {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="font-figtree text-[15px] text-red-600">
          {t('resetInvalidLink')}
        </p>
        <Link
          href={`/${locale}/auth/forgot-password`}
          className="inline-block rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f]"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <p className="font-figtree text-[14px] text-[#4D4D4D]">{email}</p>
      <label className="flex flex-col gap-1 font-figtree text-[14px] text-[#4D4D4D]">
        {t('newPassword')}
        <input
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="text-[13px] text-[#8C8C8C]">{t('passwordHint')}</span>
      </label>
      <label className="flex flex-col gap-1 font-figtree text-[14px] text-[#4D4D4D]">
        {t('confirmPassword')}
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        disabled={busy || password.length < MIN_PASSWORD_LENGTH || !confirm}
        className="rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f] disabled:opacity-60"
      >
        {t('savePassword')}
      </button>
    </form>
  );
}
