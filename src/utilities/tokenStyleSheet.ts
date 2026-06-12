/**
 * tokenStyleSheet — Singleton style sheet manager for Nice token CSS.
 *
 * All token CSS produced by `setTokens` / `generateTokenCSS` is collected
 * into a single `<style data-nice-tokens>` element in `<head>`. Calling with
 * the same prefix replaces the previous CSS for that prefix, so multiple
 * `setTokens` calls don't duplicate `:root` blocks.
 *
 * Sibling helper: `breakpointStyleSheet.ts` (same pattern, different
 * `data-*` attribute, single-writer instead of prefix-keyed).
 *
 * SSR-safe: no-ops when `document` is not available.
 * HMR-safe: reuses an existing `<style data-nice-tokens>` element if present.
 */

const STYLE_ATTR = "data-nice-tokens"

/** Map of prefix → CSS string, used to deduplicate and rebuild. */
const cssMap = new Map<string, string>()

/** Cached reference to the shared `<style>` element. */
let styleElement: HTMLElement | null = null

/**
 * Returns the shared `<style data-nice-tokens>` element, creating it on first
 * use. Returns null in non-browser environments (SSR).
 */
function getStyleElement(): HTMLElement | null {
  if (typeof document === "undefined") return null

  if (!styleElement) {
    styleElement =
      document.querySelector(`style[${STYLE_ATTR}]`) ||
      (() => {
        const el = document.createElement("style")
        el.setAttribute(STYLE_ATTR, "")
        document.head.appendChild(el)
        return el
      })()
  }

  return styleElement
}

/** Rebuilds the full CSS content from all registered prefixes. */
function rebuild() {
  const el = getStyleElement()
  if (!el) return
  el.textContent = Array.from(cssMap.values()).join("\n")
}

/**
 * Inject token CSS into the shared `<style data-nice-tokens>` element.
 * Deduplicates by prefix — calling again with the same prefix replaces
 * the previous CSS.
 *
 * @param prefix - Token prefix for deduplication (e.g. "tile", "button")
 * @param css - Full CSS string including `:root` block and any media queries
 */
export function injectTokenCSS(prefix: string, css: string): void {
  cssMap.set(prefix, css)
  rebuild()
}
