import { parseAdobeFontsUrl } from './parseAdobeFontsUrl.js'
import type { AdobeFontsConfig } from '../types/adobeFonts.js'
import type { LinkAttributes } from '../types/googleFonts.js'

/**
 * Build a normalized `AdobeFontsConfig` from an Adobe Fonts (Typekit) kit id or
 * stylesheet URL (or pass a prebuilt config through unchanged). Emits the
 * preconnect + kit-stylesheet `<link>` set — the same links `StylesProvider`
 * injects. Adobe ships every `@font-face` in the kit stylesheet, so there are
 * no axes to parse.
 *
 * Framework-agnostic shared logic: consumed by the React `StylesProvider` and
 * by the JS-only `injectFonts`. Returns `null` on an unparseable reference.
 *
 * @param adobeFonts - A kit id / stylesheet URL, or an already-built config.
 */
export function buildAdobeFontsConfig(
  adobeFonts: string | AdobeFontsConfig
): AdobeFontsConfig | null {
  if (!adobeFonts) return null
  // Already a config object — pass through.
  if (typeof adobeFonts === 'object') return adobeFonts

  const metadata = parseAdobeFontsUrl(adobeFonts)
  if (!metadata) {
    console.error('Failed to parse Adobe Fonts kit reference:', adobeFonts)
    return null
  }

  const links: LinkAttributes[] = [
    { rel: 'preconnect', href: 'https://use.typekit.net' },
    { rel: 'preconnect', href: 'https://p.typekit.net', crossOrigin: 'anonymous' },
    { rel: 'stylesheet', href: metadata.cssUrl },
  ]

  return { links, fonts: [metadata] }
}
