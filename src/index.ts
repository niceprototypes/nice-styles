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
 * ### Core Token Function
 * Static core token retrieval with CSS variables and raw values:
 * ```ts
 * import { getCoreToken } from 'nice-styles'
 * const fontSize = getCoreToken('fontSize')
 * console.log(fontSize.key)   // "--np--font-size--base"
 * console.log(fontSize.var)   // "var(--np--font-size--base)"
 * console.log(fontSize.value) // "16px"
 *
 * const large = getCoreToken('fontSize', 'large')
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

// Export type definitions
export type {
  AnimationDurationType,
  AnimationEasingType,
  BackgroundColorType,
  BorderColorType,
  BorderRadiusType,
  BorderWidthType,
  BoxShadowType,
  CellHeightType,
  ForegroundColorType,
  FontFamilyType,
  FontSizeType,
  FontWeightType,
  GapType,
  LetterSpacingType,
  LineHeightType,
  ComponentPrefix,
} from './generated/types.js'

// Export layout types
export type {
  SpacingShorthandType,
  SpacingDefinitionType,
  SpacingResponsiveType,
  SpacingType,
} from './layoutTypes.js'

// Export mode types
export type { ModeType } from './modeTypes.js'

// Export the raw tokens data
import tokensData from './generated/tokensData.js'
export const Theme = tokensData