import { forgotPassword, getMe, loginUser, resetPassword } from '@/lib/api-client';
import type { MeResponse } from '@/lib/api-client';

/** Message keys in the `Auth` namespace shown for a failed e-mail sign-in or password reset. */
export type AuthErrorKey = 'invalidCredentials' | 'tooManyAttempts' | 'genericError' | 'resetInvalidLink';

export type AuthResult<T> = { ok: true; value: T } | { ok: false; error: AuthErrorKey };

/** 422 means "wrong input" (caller decides the message), 429 the rate limit, anything else a generic error. */
export function errorKeyForStatus(status: number | undefined, on422: AuthErrorKey): AuthErrorKey {
  if (status === 422) return on422;
  if (status === 429) return 'tooManyAttempts';
  return 'genericError';
}

/** POST /login, then GET /me with the new token (the context stores the /me shape, as after Google sign-in). */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ token: string; user: MeResponse }>> {
  try {
    const login = await loginUser({ body: { email, password } });
    const token = login.data?.token;
    if (!token) return { ok: false, error: errorKeyForStatus(login.response?.status, 'invalidCredentials') };

    const me = await getMe({ headers: { Authorization: `Bearer ${token}` } });
    if (!me.data) return { ok: false, error: 'genericError' };

    return { ok: true, value: { token, user: me.data } };
  } catch {
    return { ok: false, error: 'genericError' };
  }
}

/** POST /forgot-password. The API answers the same for known and unknown addresses. */
export async function requestPasswordReset(email: string): Promise<AuthResult<null>> {
  try {
    const res = await forgotPassword({ body: { email } });
    if (res.response?.ok) return { ok: true, value: null };
    return { ok: false, error: errorKeyForStatus(res.response?.status, 'genericError') };
  } catch {
    return { ok: false, error: 'genericError' };
  }
}

/** POST /reset-password. A 422 on `token` means the link is invalid, expired or already used. */
export async function setNewPassword(
  token: string,
  email: string,
  password: string,
): Promise<AuthResult<null>> {
  try {
    const res = await resetPassword({
      body: { token, email, password, password_confirmation: password },
    });
    if (res.response?.ok) return { ok: true, value: null };
    const errors = (res.error as { errors?: Record<string, unknown> } | undefined)?.errors;
    const on422: AuthErrorKey = errors && 'token' in errors ? 'resetInvalidLink' : 'genericError';
    return { ok: false, error: errorKeyForStatus(res.response?.status, on422) };
  } catch {
    return { ok: false, error: 'genericError' };
  }
}

export const MIN_PASSWORD_LENGTH = 8;
