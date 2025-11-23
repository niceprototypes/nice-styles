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
 * ### Tokens (camelCase objects)
 * Organized token objects for semantic access:
 * ```ts
 * import { fontSize, foregroundColor } from 'nice-styles'
 * console.log(fontSize.base) // "16px"
 * console.log(foregroundColor.link) // "hsla(202, 100%, 50%, 1)"
 * ```
 *
 * ### Namespaced Exports
 * All constants/tokens under a namespace:
 * ```ts
 * import { StyleConstants, StyleTokens } from 'nice-styles'
 * console.log(StyleConstants.FONT_SIZE_BASE) // "16px"
 * console.log(StyleTokens.fontSize.base) // "16px"
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

// Export constants and tokens under namespaces
export * as StyleConstants from './services/index.js'
export * as StyleTokens from './services/index.js'