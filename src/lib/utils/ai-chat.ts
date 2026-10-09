import { env } from '@/env';

/** Beach as returned by POST /api/v1/ai/chat (all fields from the database, in the page language). */
export interface ChatBeach {
  id: number;
  name: string;
  slug?: string;
  country_code?: string;
  city?: string | null;
  type?: string | null;
  facilities?: string[];
  distance_km?: number | null;
  match_score?: number | null;
  main_image?: string | null;
  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;
}

export interface ChatReply {
  session_id: string;
  message: string;
  beaches?: ChatBeach[];
  suggestions?: string[];
}

/** Message keys in `AI.chat` for a failed request. */
export type ChatErrorKey = 'error' | 'errorBusy' | 'errorTooMany' | 'errorTooLong';

export function chatErrorKey(status: number): ChatErrorKey {
  if (status === 503) return 'errorBusy';
  if (status === 429) return 'errorTooMany';
  if (status === 413) return 'errorTooLong';
  return 'error';
}

/**
 * One chat turn. The session id keeps the conversation (the backend remembers earlier turns and the beaches
 * it showed); Accept-Language = page language so beach names and URL slugs match the website's URLs.
 */
export async function sendChatMessage(args: {
  message: string;
  sessionId: string | null;
  locale: string;
  token: string | null;
  location: { latitude: number; longitude: number } | null;
}): Promise<{ ok: true; reply: ChatReply } | { ok: false; error: ChatErrorKey }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': args.locale,
    };
    if (args.token) headers.Authorization = `Bearer ${args.token}`;

    const response = await fetch(`${env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: args.message,
        ...(args.sessionId ? { session_id: args.sessionId } : {}),
        ...(args.location ? { context: { location: args.location } } : {}),
      }),
    });
    if (!response.ok) return { ok: false, error: chatErrorKey(response.status) };

    return { ok: true, reply: (await response.json()) as ChatReply };
  } catch {
    return { ok: false, error: 'error' };
  }
}

export interface MessagePart {
  text: string;
  beach?: ChatBeach;
}

/**
 * Splits the answer text so that every mention of a recommended beach's name becomes a link part.
 * The backend asks the model to write the names exactly as in the list; longer names are matched first
 * ("Plaža Zlatni rat" before "Zlatni rat"), case-insensitively.
 */
export function linkBeachNames(text: string, beaches: ChatBeach[] | undefined): MessagePart[] {
  const named = (beaches ?? []).filter((b) => b.name && b.name.trim().length > 2);
  if (!text || named.length === 0) return [{ text }];

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sorted = [...named].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(`(${sorted.map((b) => escape(b.name.trim())).join('|')})`, 'giu');
  const byName = new Map(sorted.map((b) => [b.name.trim().toLocaleLowerCase(), b]));

  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => {
      const beach = byName.get(part.toLocaleLowerCase());
      return beach ? { text: part, beach } : { text: part };
    });
}
