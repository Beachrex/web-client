'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { EmailLoginForm } from './EmailLoginForm';
import { GoogleLoginButton } from './GoogleLoginButton';

/** Google sign-in plus, on request, the e-mail/password form (with "Forgot password?"). */
export function SignInOptions() {
  const t = useTranslations('Auth');
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="flex w-full max-w-xs flex-col items-stretch gap-2">
      <GoogleLoginButton fullWidth />
      <div className="flex items-center gap-2 font-figtree text-[13px] text-[#8C8C8C]" aria-hidden="true">
        <span className="h-px flex-1 bg-[#E7E7E7]" />
        {t('orDivider')}
        <span className="h-px flex-1 bg-[#E7E7E7]" />
      </div>
      {showEmail ? (
        <div className="rounded-md border border-[#E7E7E7] bg-white p-4">
          <EmailLoginForm />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="font-figtree text-[14px] text-[#0069AB] hover:underline"
        >
          {t('signInWithEmail')}
        </button>
      )}
    </div>
  );
}
