/**
 * breakpointStyleSheet — Singleton style element for runtime breakpoint overrides.
 *
 * `setBreakpoints` re-emits the size-token @media cascade with new thresholds.
 * The resulting CSS is injected into a single `<style data-nice-breakpoints>`
 * element appended to `<head>`. Subsequent calls replace its contents, so the
 * stylesheet always reflects the most recent override set.
 *
 * SSR-safe: no-ops when `document` is unavailable.
 * HMR-safe: reuses any pre-existing element with the same data attribute.
 */

const STYLE_ATTR = 'data-nice-breakpoints'

let styleElement: HTMLStyleElement | null = null

/**
 * Returns the shared breakpoint style element, creating it on first use.
 * Returns null in non-browser environments.
 */
function getStyleElement(): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null

  if (!styleElement) {
    const existing = document.querySelector(`style[${STYLE_ATTR}]`)
    if (existing instanceof HTMLStyleElement) {
      styleElement = existing
    } else {
      const el = document.createElement('style')
      el.setAttribute(STYLE_ATTR, '')
      document.head.appendChild(el)
      styleElement = el
    }
  }

  return styleElement
}

/**
 * Replace the contents of the breakpoint override stylesheet.
 *
 * @param css - Complete CSS string (full @media blocks). Pass an empty string
 *   to clear any prior override.
 */
export function injectBreakpointCss(css: string): void {
  const el = getStyleElement()
  if (!el) return
  el.textContent = css
}
