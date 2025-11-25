/**
 * Main Entry Point for nice-styles
 *
 * This module exports all design tokens in both constant and token formats,
 * along with TypeScript type definitions.
 *
 * ## Exports
 *
 * ### Constants (SCREAMING_SNAKE_CASE)
 * Raw constant values for direct usage:
 * ```ts
 * import { FONT_SIZE_BASE, FOREGROUND_COLOR_LINK } from 'nice-styles'
 * ```
 *
 * ### Token Function
 * Dynamic token retrieval with CSS variables and raw values:
 * ```ts
 * import { getToken } from 'nice-styles'
 * const fontSize = getToken('fontSize')
 * console.log(fontSize.key)   // "--font-size-base"
 * console.log(fontSize.var)   // "var(--font-size-base)"
 * console.log(fontSize.value) // "16px"
 *
 * const large = getToken('fontSize', 'large')
 * console.log(large.value) // "24px"
 * ```
 *
 * ### Types
 * TypeScript type definitions:
 * ```ts
 * import type { StyleNamedTokenProps } from 'nice-styles'
 * ```
 *
 * @module index
 */

// Export all constants and tokens from services
export * from './services/index.js'

// Export the raw tokens.json data
import tokensData from './tokens.json' assert { type: 'json' }
export const Theme = tokensData