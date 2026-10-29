/**
 * TASK-010: pure helpers for the AI chat widget (unit-tested in e2e/ai-chat-widget.unit.spec.ts).
 *
 * - which page the visitor is on (`page_context` for POST /api/v1/ai/chat, an untrusted hint the backend
 *   validates and resolves itself),
 * - where the widget is shown,
 * - the conversation kept in localStorage so it survives closing the tab or the browser.
 */
import { globalRoutes } from '@/i18n/routing';
import type { ChatBeach } from '@/lib/utils/ai-chat';

export const AI_CHAT_PAGE_TYPES = [
  'home', 'beach', 'destination', 'country', 'region', 'island', 'city', 'search', 'map', 'article', 'other',
] as const;
export type AiChatPageType = (typeof AI_CHAT_PAGE_TYPES)[number];

/** Same limits as the backend (`PageContextHint`). */
export const PAGE_CONTEXT_MAX_PATH = 300;
export const PAGE_CONTEXT_MAX_TITLE = 120;

export interface PageContext {
  page_type: AiChatPageType;
  path?: string;
  beach_id?: number;
  title?: string;
}

/** What a page tells the widget about itself (beach pages: the beach id; places: their type and name). */
export interface AiChatPageInfo {
  pageType: AiChatPageType;
  beachId?: number | null;
  title?: string | null;
}

const words = (map: Record<string, string>) => new Set(Object.values(map));
const BEACHES_WORDS = words(globalRoutes.beaches);
const MAP_WORDS = words(globalRoutes.beachMap);
const TYPE_WORDS = new Set([...words(globalRoutes.beachType), ...words(globalRoutes.userType)]);
const ABOUT_WORDS = words(globalRoutes.about);

/** Path accepted by the backend: starts with "/", only [A-Za-z0-9-._~/%], at most 300 characters. */
export function safePagePath(pathname: string): string {
  const bare = (pathname.split(/[?#]/)[0] ?? '/') || '/';
  const encoded = (bare.startsWith('/') ? bare : `/${bare}`).replace(/[^A-Za-z0-9\-._~/%]/g, (ch) => encodeURIComponent(ch));
  // Fall back to "%" escapes only; anything still outside the set (e.g. "!" "(") is dropped.
  const clean = encoded.replace(/[^A-Za-z0-9\-._~/%]/g, '');
  if (clean.length <= PAGE_CONTEXT_MAX_PATH) return clean;
  // Never cut a %XX escape in half.
  return clean.slice(0, PAGE_CONTEXT_MAX_PATH).replace(/%[0-9A-Fa-f]?$/, '');
}

/** Page type from the URL alone (localized route words of all 19 locales). Beach vs. place needs the page itself. */
export function pageTypeFromPath(pathname: string): AiChatPageType {
  const segments = (pathname.split(/[?#]/)[0] ?? '').split('/').filter(Boolean);
  const rest = segments.slice(1); // drop the locale
  if (rest.length === 0) return 'home';
  const [first] = rest;
  if (first === undefined) return 'home';
  if (BEACHES_WORDS.has(first)) {
    if (rest.length <= 2) return 'destination'; // all beaches, a continent
    if (rest.length === 3) return 'country';
    return 'destination'; // region / island / town / beach: the page registers its own type
  }
  if (MAP_WORDS.has(first)) return 'map';
  if (TYPE_WORDS.has(first)) return 'destination';
  if (first === 'p' || ABOUT_WORDS.has(first)) return 'article';
  if (first === 'search') return 'search';
  return 'other';
}

/** "Plaža Bačvice | BeachRex" → "Plaža Bačvice". */
export function cleanDocumentTitle(title: string | null | undefined): string {
  return (title ?? '').replace(/\s*[|–—-]\s*beach\s?rex.*$/i, '').replace(/\s+/g, ' ').trim();
}

/**
 * `page_context` for the chat request. A page that registered itself wins over the URL guess; the beach id is
 * only sent for beach pages. Title: the page's own name, else the document title.
 */
export function buildPageContext(
  pathname: string,
  info: AiChatPageInfo | null,
  documentTitle?: string | null,
): PageContext {
  const pageType = info?.pageType ?? pageTypeFromPath(pathname);
  const context: PageContext = { page_type: pageType, path: safePagePath(pathname) };
  const beachId = info?.beachId;
  if (pageType === 'beach' && typeof beachId === 'number' && Number.isInteger(beachId) && beachId > 0 && beachId <= 2147483647) {
    context.beach_id = beachId;
  }
  const title = cleanDocumentTitle(info?.title ?? documentTitle).slice(0, PAGE_CONTEXT_MAX_TITLE).trim();
  if (title && pageType !== 'home') context.title = title;
  return context;
}

/** The widget is shown only when the AI switch is on, and never on the full chat page itself. */
export function isAiChatWidgetVisible(aiEnabled: boolean, pathname: string | null | undefined): boolean {
  if (!aiEnabled) return false;
  const segments = (pathname ?? '').split(/[?#]/)[0]!.split('/').filter(Boolean);
  return !(segments[1] === 'ai' && segments[2] === 'chat');
}

// ---------------------------------------------------------------------------------------------------------------
// Persistence (owner 2026-10-29: the conversation must survive closing the tab or the browser by accident)

export const AI_CHAT_STORAGE_KEY = 'beachrex.aiChat.v1';
export const AI_CHAT_MAX_MESSAGES = 50;
/** Forgotten after 7 days without a new message. */
export const AI_CHAT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string (no hydration issues)
  beaches?: ChatBeach[];
  suggestions?: string[];
  format?: 'markdown' | 'text';
  /** Page language the answer was given in: beach slugs are in that language. */
  locale?: string;
}

export interface StoredChat {
  v: 1;
  sessionId: string | null;
  updatedAt: number;
  messages: ChatMessage[];
}

/** Keeps the newest `max` messages. */
export function capMessages<T>(messages: T[], max: number = AI_CHAT_MAX_MESSAGES): T[] {
  return messages.length > max ? messages.slice(messages.length - max) : messages;
}

export function serializeChat(sessionId: string | null, messages: ChatMessage[], now: number): string {
  const stored: StoredChat = { v: 1, sessionId, updatedAt: now, messages: capMessages(messages) };
  return JSON.stringify(stored);
}

const isMessage = (m: unknown): m is ChatMessage => {
  if (!m || typeof m !== 'object') return false;
  const x = m as Record<string, unknown>;
  return (x.role === 'user' || x.role === 'assistant')
    && typeof x.content === 'string'
    && typeof x.timestamp === 'string'
    && (x.beaches === undefined || Array.isArray(x.beaches))
    && (x.suggestions === undefined || Array.isArray(x.suggestions))
    && (x.format === undefined || x.format === 'markdown' || x.format === 'text');
};

/** Stored conversation, or null when missing, corrupt, of another version or older than 7 days. */
export function restoreChat(raw: string | null | undefined, now: number): StoredChat | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (d.v !== 1 || typeof d.updatedAt !== 'number' || !Array.isArray(d.messages)) return null;
  if (now - d.updatedAt > AI_CHAT_TTL_MS) return null;
  const messages = capMessages(d.messages.filter(isMessage));
  if (messages.length === 0) return null;
  return {
    v: 1,
    sessionId: typeof d.sessionId === 'string' ? d.sessionId : null,
    updatedAt: d.updatedAt,
    messages,
  };
}
