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
 * import { getToken } from 'nice-styles'
 * const fontSize = getToken('fontSize')
 * console.log(fontSize.key)   // "--np--font-size--base"
 * console.log(fontSize.var)   // "var(--np--font-size--base)"
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

// Initialize the token store — must run before any getter is called
import './init.js'

// Export all constants and tokens from services
export {
  getBreakpoint,
  getBreakpointValue,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
  getToken,
  getTokenKey,
  getTokenValue,
  getModeToken,
  getModeTokenKey,
  getModeTokenValue,
  getBreakpointToken,
  getBreakpointTokenKey,
  getBreakpointTokenValue,
  setCoreTokens,
  setModeTokens,
  setBreakpointTokens,
  setBreakpoints,
  getConstant,
  getConstantKey,
  NAMESPACE,
  getComponentToken,
  getComponentTokenKey,
  getComponentTokenValue,
  getInvertedMode,
  getTextHeight,
  getTokenFromMap,
  getTokenByPath,
  camelToKebab,
  parseGoogleFontsUrl,
  DEFAULT_MODE,
  DEFAULT_BREAKPOINT,
  STYLE_VALUE_KEYS,
  isStyleValue,
  registry,
  registerTokens,
  seedDimensionedTokens,
  injectTokenCSS,
  generateTokenCSS,
} from './services/index.js'
export type {
  BreakpointName,
  BreakpointValues,
  CssConstantOptions,
  TokenDefinition,
  TokenMap,
  ComponentTokenNode,
  TokenResult,
  TokenFromMapOptions,
  ModeValue,
  BreakpointValue,
  FontAxis,
  GoogleFontMetadata,
  LinkAttributes,
  GoogleFontsConfig,
  StyleValueKind,
  RegistryEntry,
  DimensionedTokenSeed,
} from './services/index.js'

// Export type definitions
export type {
  AnimationDurationType,
  AnimationEasingType,
  BackgroundColorType,
  BackgroundSizeType,
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

// Export the raw tokens data — flat core + day color values + small size values
import tokensData from './generated/tokensData.js'
import modeTokensData from './generated/modeTokensData.js'
import breakpointTokensData from './generated/breakpointTokensData.js'
export const Theme = { ...tokensData, ...modeTokensData.day, ...breakpointTokensData.small }

// Export component tokens data — used by nice-react-styles to detect component prefixes
import componentTokensData from './generated/componentTokensData.js'
export { componentTokensData }

// Export raw color and size token modules — used by nice-react-styles to seed
// foregroundColor/backgroundColor/borderColor (mode-aware) and fontSize (breakpoint-aware)
// in its runtime registry with the original ModeValue/BreakpointValue shapes.
export { default as modeTokensData } from './generated/modeTokensData.js'
export { default as breakpointTokensData } from './generated/breakpointTokensData.js'