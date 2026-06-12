import { buildGoogleFontsConfig } from './buildGoogleFontsConfig.js'
import { buildAdobeFontsConfig } from './buildAdobeFontsConfig.js'
import { injectFontLinks } from './injectFontLinks.js'
import type { GoogleFontsConfig, LinkAttributes } from '../types/googleFonts.js'
import type { AdobeFontsConfig } from '../types/adobeFonts.js'

/** Font sources for `injectFonts` — mirrors the `StylesProvider` font props, plus raw links. */
export interface InjectFontsConfig {
  /** Google Fonts CSS URL (or a prebuilt `GoogleFontsConfig`). */
  googleFonts?: string | GoogleFontsConfig
  /** Adobe Fonts (Typekit) kit id / stylesheet URL (or a prebuilt `AdobeFontsConfig`). */
  adobeFonts?: string | AdobeFontsConfig
  /**
   * Raw `<link>` descriptors for any other font source — self-hosted fonts, a
   * non-Google/Adobe CDN, etc. Injected verbatim; the same `LinkAttributes[]`
   * shape the React `FontLoader` `links` prop accepts.
   */
  links?: LinkAttributes[]
}

/**
 * JS-only font loader — injects the preconnect + stylesheet `<link>` tags into
 * `<head>` for the given Google, Adobe, and/or custom font sources. The
 * framework-free equivalent of passing `googleFonts` / `adobeFonts` to
 * `StylesProvider`; use it when working outside React. For a fully custom font
 * (not Google or Adobe), pass `links` directly.
 *
 * Call once at startup. SSR-safe and idempotent (see `injectFontLinks`).
 *
 * @example
 * import { injectFonts } from "nice-styles"
 *
 * // Google and/or Adobe by URL
 * injectFonts({
 *   googleFonts: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
 * })
 *
 * @example
 * // A custom (self-hosted / other-CDN) font via raw links
 * injectFonts({
 *   links: [
 *     { rel: "preconnect", href: "https://cdn.example.com" },
 *     { rel: "stylesheet", href: "https://cdn.example.com/my-font.css" },
 *   ],
 * })
 */
export function injectFonts({ googleFonts, adobeFonts, links }: InjectFontsConfig): void {
  if (googleFonts) {
    const config = buildGoogleFontsConfig(googleFonts)
    if (config) injectFontLinks(config.links)
  }
  if (adobeFonts) {
    const config = buildAdobeFontsConfig(adobeFonts)
    if (config) injectFontLinks(config.links)
  }
  if (links) {
    injectFontLinks(links)
  }
}
