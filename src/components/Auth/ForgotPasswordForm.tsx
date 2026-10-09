'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { requestPasswordReset, type AuthErrorKey } from '@/lib/utils/password-auth';

/** Asks for the account e-mail; the answer is the same whether or not the account exists. */
export function ForgotPasswordForm() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await requestPasswordReset(email.trim());
    setBusy(false);
    if (result.ok) setSent(true);
    else setError(result.error);
  };

  if (sent) {
    return (
      <p role="status" className="rounded-md bg-[#EAF4FB] p-4 font-figtree text-[15px] text-[#1A3C68]">
        {t('forgotSent')}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1 font-figtree text-[14px] text-[#4D4D4D]">
        {t('email')}
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-[#D9D9D9] px-3 py-2 font-figtree text-[15px] text-[#222222] focus:border-[#0069AB] focus:outline-none"
        />
      </label>
      {error && (
        <p role="alert" className="font-figtree text-[14px] text-red-600">
          {t(error)}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !email.includes('@')}
        className="rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f] disabled:opacity-60"
      >
        {t('sendLink')}
      </button>
    </form>
  );
}
