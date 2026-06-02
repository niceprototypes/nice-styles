import type { AdobeFontMetadata } from '../types/adobeFonts.js'

/** Adobe Fonts kit stylesheets are always served from this origin. */
const TYPEKIT_CSS_BASE = 'https://use.typekit.net'

/**
 * Parses an Adobe Fonts (Typekit) kit reference into metadata.
 *
 * Accepts either a bare kit id or a full kit stylesheet URL — Adobe gives you
 * the kit id in the embed snippet, so both forms are convenient. Mirrors
 * `parseGoogleFontsUrl`, but there are no axes to extract: the kit stylesheet
 * carries every `@font-face` rule itself.
 *
 * @example
 * ```ts
 * parseAdobeFontsUrl('abc1def')
 * // → { kitId: 'abc1def', cssUrl: 'https://use.typekit.net/abc1def.css' }
 *
 * parseAdobeFontsUrl('https://use.typekit.net/abc1def.css')
 * // → { kitId: 'abc1def', cssUrl: 'https://use.typekit.net/abc1def.css' }
 * ```
 */
export function parseAdobeFontsUrl(kitIdOrUrl: string): AdobeFontMetadata | null {
  try {
    const trimmed = kitIdOrUrl.trim()
    if (!trimmed) return null

    // URL form — pull the kit id out of the stylesheet filename.
    if (trimmed.includes('typekit.net') || trimmed.includes('://')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
      const kitId = (urlObj.pathname.split('/').pop() || '').replace(/\.css$/, '')
      if (!kitId) return null
      return { kitId, cssUrl: `${TYPEKIT_CSS_BASE}/${kitId}.css` }
    }

    // Bare kit-id form.
    return { kitId: trimmed, cssUrl: `${TYPEKIT_CSS_BASE}/${trimmed}.css` }
  } catch (error) {
    console.error('Failed to parse Adobe Fonts kit reference:', error)
    return null
  }
}
