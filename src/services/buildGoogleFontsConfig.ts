import { parseGoogleFontsUrl } from './parseGoogleFontsUrl.js'
import type { GoogleFontsConfig, LinkAttributes } from '../types/googleFonts.js'

/**
 * Build a normalized `GoogleFontsConfig` from a Google Fonts CSS URL (or pass a
 * prebuilt config through unchanged). Produces the preconnect + stylesheet
 * `<link>` set for optimal loading — the same links `StylesProvider` injects.
 *
 * Framework-agnostic shared logic: consumed by the React `StylesProvider` and
 * by the JS-only `injectFonts`. Returns `null` on an unparseable URL.
 *
 * @param googleFonts - A Google Fonts CSS URL, or an already-built config.
 * @returns The config (`links` + `fonts`), or null for an empty input or unparseable URL
 */
export function buildGoogleFontsConfig(
  googleFonts: string | GoogleFontsConfig
): GoogleFontsConfig | null {
  // Empty string (or a falsy value from an untyped caller) — nothing to load
  if (!googleFonts) return null
  // Already a config object — pass through.
  if (typeof googleFonts === 'object') return googleFonts

  // Font metadata (family, axes) for the config's `fonts` list
  const metadata = parseGoogleFontsUrl(googleFonts)
  if (!metadata) {
    console.error('Failed to parse Google Fonts URL:', googleFonts)
    return null
  }

  // Preconnect to the two Google Fonts origins (DNS/TLS warmup), then the stylesheet.
  const links: LinkAttributes[] = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'stylesheet', href: googleFonts },
  ]

  return { links, fonts: [metadata] }
}
