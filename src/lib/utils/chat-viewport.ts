/**
 * Mobile layout of the AI chat widget (owner 2026-10-29: "ta AI chat widget na mobile responsive popravi").
 * Unit-tested in e2e/ai-chat-viewport.unit.spec.ts.
 *
 * On phones the widget is a full-screen sheet. When the on-screen keyboard opens, iOS Safari (and Chrome on
 * Android by default) only shrink the *visual* viewport: a `position: fixed; inset: 0` panel keeps the full
 * layout height, the browser scrolls the page so the focused input is visible, and the header ends up above
 * the screen while the page shows through below the composer. The sheet therefore follows
 * `window.visualViewport` (top = offsetTop, height = height) instead of the layout viewport.
 */

/**
 * When the widget is a full-screen sheet instead of the 400px desktop panel: narrow screens and phones in
 * landscape (wide but short). Must match the `.ai-chat-panel` media query in src/styles/globals.css.
 */
export const CHAT_SHEET_MEDIA = '(max-width: 639px), (max-height: 499px)';

/** The visual viewport this much (px) shorter than the layout viewport means an on-screen keyboard is open. */
export const KEYBOARD_MIN_HEIGHT = 120;

export interface VisualViewportMetrics {
  height: number;
  offsetTop: number;
  scale: number;
}

export interface ChatSheetRect {
  /** Distance (px) of the visible area from the top of the layout viewport. */
  top: number;
  /** Visible height (px): the space between the top of the screen and the keyboard. */
  height: number;
  /** The keyboard is open: the composer sits directly on it, no bottom safe-area padding. */
  keyboardOpen: boolean;
}

/**
 * Where the sheet goes. `null` = no usable visual viewport (old browser) or the visitor has pinch-zoomed:
 * the CSS fallback (`top: 0; height: 100dvh`) applies.
 *
 * @param layoutHeight `document.documentElement.clientHeight` (not changed by the keyboard)
 */
export function chatSheetRect(vv: VisualViewportMetrics | null, layoutHeight: number): ChatSheetRect | null {
  if (!vv || !(vv.height > 0) || !Number.isFinite(vv.offsetTop)) return null;
  if (vv.scale > 1.01) return null;
  const height = Math.round(vv.height);
  // Rubber-band overscroll on iOS can report a negative offset for a moment.
  const top = Math.max(0, Math.round(vv.offsetTop));
  return { top, height, keyboardOpen: layoutHeight - height > KEYBOARD_MIN_HEIGHT };
}

/**
 * Keep the page behind the sheet from scrolling, iOS included (`overflow: hidden` on body alone does not stop
 * touch scrolling there): pin the body at its scroll position and restore both on unlock.
 */
export function lockBodyScroll(): () => void {
  const { body, documentElement } = document;
  const scrollY = window.scrollY;
  const previous = body.getAttribute('style');
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  const previousBehavior = documentElement.style.scrollBehavior;
  return () => {
    if (previous === null) body.removeAttribute('style');
    else body.setAttribute('style', previous);
    // No smooth scrolling back to where the visitor was.
    documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollY);
    documentElement.style.scrollBehavior = previousBehavior;
  };
}
