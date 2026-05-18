/**
 * Google Fonts metadata types used by `parseGoogleFontsUrl` and the React
 * `StylesProvider` to load fonts and emit `@font-face` declarations.
 */

/**
 * Variable font axis configuration.
 * Represents a single axis in a variable font (e.g., wght, opsz, ROND).
 */
export interface FontAxis {
  /** The axis tag (e.g., 'wght', 'opsz', 'ROND', 'slnt') */
  tag: string
  /** Minimum value for this axis */
  min: number
  /** Maximum value for this axis */
  max: number
  /** Default/preferred value for this axis */
  default?: number
}

/**
 * Parsed metadata from a Google Fonts URL.
 * Contains all information needed to generate `@font-face` rules.
 */
export interface GoogleFontMetadata {
  /** The font family name (e.g., 'Google Sans Flex') */
  family: string
  /** Variable font axes with their ranges */
  axes: FontAxis[]
  /** Display strategy (swap, block, fallback, optional) */
  display?: 'swap' | 'block' | 'fallback' | 'optional'
  /** The original Google Fonts CSS URL */
  cssUrl: string
}

/**
 * `<link>` element attributes for loading external resources.
 * Used primarily for Google Fonts preconnect and stylesheet loading.
 */
export interface LinkAttributes {
  /** The relationship between the current document and the linked resource */
  rel: 'preconnect' | 'stylesheet' | 'dns-prefetch'
  /** The URL of the linked resource */
  href: string
  /** CORS settings for the fetch (use 'anonymous' for Google Fonts) */
  crossOrigin?: 'anonymous' | 'use-credentials'
  /** Media query for when the stylesheet should apply */
  media?: string
}

/**
 * Configuration for loading Google Fonts.
 * Passed to `StylesProvider` to enable dynamic font loading.
 */
export interface GoogleFontsConfig {
  /**
   * Array of link elements to inject into the document head.
   */
  links: LinkAttributes[]

  /**
   * Optional: Generate `@font-face` declarations for specific font weights.
   * If provided, will create granular `@font-face` rules mapped to nice-styles
   * fontWeight tokens.
   */
  fonts?: GoogleFontMetadata[]
}
