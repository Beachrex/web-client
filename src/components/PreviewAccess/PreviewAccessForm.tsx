'use client';

import { useState } from 'react';

interface Texts {
  emailLabel: string;
  submit: string;
  sending: string;
  sent: string;
  failed: string;
}

/**
 * Asks the API for a one-time link. The browser calls the API directly, so the API's per-IP limit sees the
 * visitor's address (not the website server's).
 */
export default function PreviewAccessForm({
  apiEndpoint,
  locale,
  returnPath,
  texts,
}: {
  apiEndpoint: string;
  locale: string;
  returnPath: string;
  texts: Texts;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch(`${apiEndpoint.replace(/\/$/, '')}/api/v1/preview-access/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': locale },
        body: JSON.stringify({ email, return_path: returnPath }),
      });
      setState(response.ok ? 'sent' : 'failed');
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <p role="status" className="text-base leading-6">
        {texts.sent}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="preview-email" className="text-sm font-semibold">
        {texts.emailLabel}
      </label>
      <input
        id="preview-email"
        type="email"
        required
        autoComplete="email"
        maxLength={255}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-base"
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="min-h-[44px] rounded-lg px-4 py-2 font-bold text-white disabled:opacity-60"
        style={{ background: '#1A3C68' }}
      >
        {state === 'sending' ? texts.sending : texts.submit}
      </button>
      {state === 'failed' && (
        <p role="alert" className="text-sm text-red-700">
          {texts.failed}
        </p>
      )}
    </form>
  );
}
