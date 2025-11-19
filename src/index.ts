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

// Export all constants individually
export * from './constants.js'

// Export all tokens individually
export * from './tokens.js'

// Export deprecated constants (for backwards compatibility)
export * from './deprecated.js'

// Export constants under StyleConstants namespace
export * as StyleConstants from './constants.js'

// Export tokens under StyleTokens namespace
export * as StyleTokens from './tokens.js'

// Export all type definitions
export type * from './types.js'
export type * as StyleTypes from './types.js'