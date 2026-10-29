/**
 * Cloudflare Turnstile for the AI chat (owner 2026-10-29, backend ADR "AI chat daily cost cap and Turnstile").
 *
 * Off when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is empty (local, tests, until the owner adds the widget). On: the widget
 * runs in "execute" mode (only when the chat needs a token) and shows itself only if Cloudflare wants an interaction.
 * The backend remembers a verified conversation, so a token is needed for the first message only (or when the
 * server answers 403 `turnstile_required` / `turnstile_failed`).
 */

export const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
/** Must match `TurnstileVerifier::ACTION` in the backend. */
export const TURNSTILE_ACTION = 'ai_chat';
const TOKEN_TIMEOUT_MS = 60_000;

export function turnstileEnabled(siteKey: string | null | undefined): siteKey is string {
  return typeof siteKey === 'string' && siteKey.trim().length > 0;
}

/** The server asked for a (new) robot check. */
export function isTurnstileChallenge(status: number, error: unknown): boolean {
  return status === 403 && (error === 'turnstile_required' || error === 'turnstile_failed');
}

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi | null> | null = null;

function loadScript(): Promise<TurnstileApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => {
      scriptPromise = null; // blocked or offline: try again next time
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * One fresh token, or null when Turnstile could not run (script blocked, error, timeout). The message is then
 * sent without a token and the server decides (403 → the chat shows the robot-check message).
 */
export async function getTurnstileToken(container: HTMLElement, siteKey: string): Promise<string | null> {
  const api = await loadScript();
  if (!api) return null;

  return new Promise((resolve) => {
    let widgetId: string | undefined;
    let done = false;
    const finish = (token: string | null) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (widgetId !== undefined) {
        try {
          api.remove(widgetId);
        } catch {
          // already gone
        }
      }
      resolve(token);
    };
    const timer = window.setTimeout(() => finish(null), TOKEN_TIMEOUT_MS);

    try {
      widgetId = api.render(container, {
        sitekey: siteKey,
        action: TURNSTILE_ACTION,
        execution: 'execute',
        appearance: 'interaction-only',
        language: 'auto',
        callback: (token: string) => finish(token),
        'error-callback': () => finish(null),
        'expired-callback': () => finish(null),
        'timeout-callback': () => finish(null),
      });
      if (widgetId === undefined) finish(null);
      else api.execute(widgetId);
    } catch {
      finish(null);
    }
  });
}
