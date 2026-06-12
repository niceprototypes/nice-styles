import type { LinkAttributes } from '../types/googleFonts.js'

/** Marks `<link>` elements injected by Nice, so repeat calls can deduplicate. */
const FONT_LINK_ATTR = 'data-nice-font'

/**
 * Inject font `<link>` elements (preconnect + stylesheet) into `<head>`.
 *
 * The JS-only analog of the React `FontLoader` — same `LinkAttributes[]`, but
 * appends real DOM nodes instead of rendering JSX. Mirrors `tokenStyleSheet`:
 * SSR-safe (no-ops when `document` is unavailable) and idempotent (skips a link
 * whose `href` is already present), so repeat calls don't duplicate tags.
 *
 * @param links - Preconnect / stylesheet links, typically from
 *   `buildGoogleFontsConfig` / `buildAdobeFontsConfig`.
 */
export function injectFontLinks(links: LinkAttributes[]): void {
  if (typeof document === 'undefined') return // SSR — no head to write to

  for (const link of links) {
    // Idempotent — don't re-add a link already injected for this href.
    if (document.querySelector(`link[${FONT_LINK_ATTR}][href="${link.href}"]`)) {
      continue
    }

    const el = document.createElement('link')
    el.setAttribute(FONT_LINK_ATTR, '')
    el.rel = link.rel
    el.href = link.href
    if (link.crossOrigin) el.crossOrigin = link.crossOrigin
    if (link.media) el.media = link.media
    document.head.appendChild(el)
  }
}
