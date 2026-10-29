import { env } from '@/env';
import { isTurnstileChallenge } from '@/lib/utils/turnstile';

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
  /** 'markdown' when the tool-calling agent answered (links as [name](url)); plain text otherwise. */
  format?: 'markdown' | 'text';
  beaches?: ChatBeach[];
  suggestions?: string[];
}

/** Message keys in `AI.chat` for a failed request. */
export type ChatErrorKey = 'error' | 'errorBusy' | 'errorTooMany' | 'errorTooLong' | 'errorResting' | 'errorRobot';

/**
 * `body` is the parsed JSON error body when there is one: a 503 with `reason: "daily_limit"` means the free daily
 * cost limit is reached (back at midnight), a 403 `turnstile_*` that the robot check is missing or failed.
 */
export function chatErrorKey(status: number, body?: unknown): ChatErrorKey {
  const data = (body && typeof body === 'object' ? body : {}) as { error?: unknown; reason?: unknown };
  if (status === 503 && data.reason === 'daily_limit') return 'errorResting';
  if (isTurnstileChallenge(status, data.error)) return 'errorRobot';
  if (status === 503) return 'errorBusy';
  if (status === 429) return 'errorTooMany';
  if (status === 413) return 'errorTooLong';
  return 'error';
}

/**
 * One chat turn. The session id keeps the conversation (the backend remembers earlier turns and the beaches
 * it showed); Accept-Language = page language so beach names and URL slugs match the website's URLs.
 * `challenge: true` = the server wants a (new) Turnstile token; the caller runs the widget and sends again.
 */
export async function sendChatMessage(args: {
  message: string;
  sessionId: string | null;
  locale: string;
  token: string | null;
  location: { latitude: number; longitude: number } | null;
  /** TASK-010: the page the chat is open on (an untrusted hint; the backend validates and resolves it). */
  pageContext?: { page_type: string; path?: string; beach_id?: number; title?: string } | null;
  /** Cloudflare Turnstile token, when the website has Turnstile on and this message needs one. */
  turnstileToken?: string | null;
}): Promise<{ ok: true; reply: ChatReply } | { ok: false; error: ChatErrorKey; challenge?: boolean }> {
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
        ...(args.pageContext ? { page_context: args.pageContext } : {}),
        ...(args.turnstileToken ? { turnstile_token: args.turnstileToken } : {}),
      }),
    });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const error = chatErrorKey(response.status, body);
      return { ok: false, error, ...(error === 'errorRobot' ? { challenge: true } : {}) };
    }

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

export interface RichPart {
  text: string;
  href?: string;
  bold?: boolean;
}

/**
 * Minimal, safe rendering of the agent's markdown: [text](url) links to our own site only (made relative so
 * they work on every environment), **bold**, and "- " list lines. Anything else stays plain text; no HTML.
 */
export function parseAgentMarkdown(text: string, siteOrigin: string): RichPart[][] {
  const origin = siteOrigin.replace(/\/+$/, '');
  const ownPath = (url: string): string | null => {
    if (url.startsWith('/') && !url.startsWith('//')) return url;
    if (origin && url.startsWith(`${origin}/`)) return url.slice(origin.length);
    const match = /^https:\/\/(?:[a-z0-9-]+\.)?beachrex\.com(\/[^\s]*)$/i.exec(url);
    return match?.[1] ?? null;
  };

  return text.split(/\r?\n/).map((rawLine) => {
    const line = rawLine.replace(/^\s*[-*]\s+/, '• ');
    const parts: RichPart[] = [];
    const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(line)) !== null) {
      if (m.index > last) parts.push({ text: line.slice(last, m.index) });
      if (m[1] !== undefined && m[2] !== undefined) {
        const href = ownPath(m[2]);
        parts.push(href ? { text: m[1], href } : { text: m[1] });
      } else if (m[3] !== undefined) {
        parts.push({ text: m[3], bold: true });
      }
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push({ text: line.slice(last) });
    return parts;
  });
}
