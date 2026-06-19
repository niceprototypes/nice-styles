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
 * const large = getToken('fontSize', { variant: 'large' })
 * // → "var(--np--font-size--large)"
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
  parseBreakpointKey,
  breakpointKeyMatches,
  breakpointKeyRangeSize,
  compareBreakpointSpecificity,
  breakpointKeyQuery,
  isBreakpointName,
  isBreakpointKeyMap,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
  getToken,
  getTokenKey,
  getTokenValue,
  getThemeToken,
  getThemeTokenKey,
  getThemeTokenValue,
  getBreakpointToken,
  getBreakpointTokenKey,
  getBreakpointTokenValue,
  setCoreTokens,
  setThemeTokens,
  setBreakpointTokens,
  setBreakpoints,
  getConstant,
  getConstantKey,
  NAMESPACE,
  getComponentToken,
  getComponentTokenKey,
  getComponentTokenValue,
  getHSLA,
  getTextHeight,
  getTokenFromMap,
  getTokenByPath,
  camelToKebab,
  parseGoogleFontsUrl,
  parseAdobeFontsUrl,
  buildGoogleFontsConfig,
  buildAdobeFontsConfig,
  injectFontLinks,
  injectFonts,
  DEFAULT_THEME,
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
  BreakpointKey,
  BreakpointModifier,
  ParsedBreakpointKey,
  BreakpointValues,
  CssConstantOptions,
  TokenDefinition,
  TokenMap,
  ComponentTokenNode,
  TokenResult,
  TokenFromMapOptions,
  ThemeValue,
  BreakpointValue,
  FontAxis,
  GoogleFontMetadata,
  LinkAttributes,
  GoogleFontsConfig,
  AdobeFontMetadata,
  AdobeFontsConfig,
  InjectFontsConfig,
  GetHSLAOptions,
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
  ColorType,
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

// Export theme types
export type { ThemeType } from './themeTypes.js'

// Export the raw tokens data — flat core + day theme values + small size values.
// Renamed from `Theme` to `Colors` to avoid collision with the new <Theme>
// component exported from nice-react-styles. Despite the name, this object
// carries more than colors — flat core primitives (font-size, gap, etc.) and
// small-breakpoint size primitives — but the styled-components ThemeProvider
// consumption path inside nice-react-styles' StylesProvider only reads the
// color values today.
import tokensData from './generated/tokensData.js'
import themeTokensData from './generated/themeTokensData.js'
import breakpointTokensData from './generated/breakpointTokensData.js'
export const Colors = { ...tokensData, ...themeTokensData.day, ...breakpointTokensData.small }

// Export component tokens data — used by nice-react-styles to detect component prefixes
import componentTokensData from './generated/componentTokensData.js'
export { componentTokensData }

// Export raw theme and breakpoint token modules — used by nice-react-styles to seed
// color/backgroundColor/borderColor (theme-aware) and fontSize (breakpoint-aware)
// in its runtime registry with the original ThemeValue/BreakpointValue shapes.
export { default as themeTokensData } from './generated/themeTokensData.js'
export { default as breakpointTokensData } from './generated/breakpointTokensData.js'