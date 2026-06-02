/**
 * Adobe Fonts (Typekit) metadata types used by `parseAdobeFontsUrl` and the
 * React `StylesProvider` to load an Adobe Fonts web project ("kit").
 *
 * Mirrors `googleFonts.ts`. Adobe Fonts ships every `@font-face` rule inside
 * the kit stylesheet, so — unlike Google Fonts — there are no per-axis details
 * to parse from the URL: the kit id and its CSS URL are all that's needed.
 */

import type { LinkAttributes } from './googleFonts.js'

/**
 * Parsed metadata from an Adobe Fonts kit reference.
 * Contains everything needed to inject the kit stylesheet.
 */
export interface AdobeFontMetadata {
  /** The Adobe Fonts web project (kit) id, e.g. 'abc1def' */
  kitId: string
  /** The kit stylesheet URL, e.g. 'https://use.typekit.net/abc1def.css' */
  cssUrl: string
}

/**
 * Configuration for loading an Adobe Fonts kit.
 * Passed to `StylesProvider` to enable dynamic font loading.
 */
export interface AdobeFontsConfig {
  /**
   * Array of link elements to inject into the document head.
   */
  links: LinkAttributes[]

  /**
   * Optional: parsed kit metadata, mirroring `GoogleFontsConfig.fonts`.
   */
  fonts?: AdobeFontMetadata[]
}
