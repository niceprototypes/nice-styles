/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 */

export { getBreakpoint, getBreakpointValue } from './getBreakpoint.js'
export type { BreakpointName } from './getBreakpoint.js'
export {
  parseBreakpointKey,
  breakpointKeyMatches,
  breakpointKeyRangeSize,
  compareBreakpointSpecificity,
  breakpointKeyQuery,
  isBreakpointName,
  isBreakpointKeyMap,
} from './breakpointKey.js'
export type { BreakpointKey, BreakpointModifier, ParsedBreakpointKey } from './breakpointKey.js'
export {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
} from '../constants/breakpoints.js'
export type { BreakpointValues } from '../constants/breakpoints.js'
export { getToken, getTokenKey, getTokenValue } from './getToken.js'
export { getThemeToken, getThemeTokenKey, getThemeTokenValue } from './getThemeToken.js'
export { getBreakpointToken, getBreakpointTokenKey, getBreakpointTokenValue } from './getBreakpointToken.js'
export { setCoreTokens } from './setCoreTokens.js'
export { setThemeTokens } from './setThemeTokens.js'
export { setBreakpointTokens } from './setBreakpointTokens.js'
export { setBreakpoints } from './setBreakpoints.js'
export { getConstant, getConstantKey, NAMESPACE } from './getConstant.js'
export type { CssConstantOptions } from './getConstant.js'
export { getComponentToken, getComponentTokenKey, getComponentTokenValue } from './getComponentToken.js'
export { default as getTextHeight } from './getTextHeight.js'

export { parseGoogleFontsUrl } from './parseGoogleFontsUrl.js'
export { parseAdobeFontsUrl } from './parseAdobeFontsUrl.js'

// Font loading — framework-agnostic config builders, the JS-only <head>
// injector (analog of the React FontLoader), and the injectFonts convenience entry.
export { buildGoogleFontsConfig } from './buildGoogleFontsConfig.js'
export { buildAdobeFontsConfig } from './buildAdobeFontsConfig.js'
export { injectFontLinks } from './injectFontLinks.js'
export { injectFonts } from './injectFonts.js'
export type { InjectFontsConfig } from './injectFonts.js'

// Style-value types and constants
export type { ThemeValue, BreakpointValue } from '../types/styleValues.js'
export type { FontAxis, GoogleFontMetadata, LinkAttributes, GoogleFontsConfig } from '../types/googleFonts.js'
export type { AdobeFontMetadata, AdobeFontsConfig } from '../types/adobeFonts.js'
export { DEFAULT_THEME, DEFAULT_BREAKPOINT, STYLE_VALUE_KEYS } from '../constants/styleValues.js'
export type { StyleValueKind } from '../constants/styleValues.js'
export { isStyleValue } from '../utilities/isStyleValue.js'

// Registry — seeded at module load via init.ts → registry/index.ts side-effect
export { registry, registerTokens, seedDimensionedTokens } from '../registry/index.js'
export type { RegistryEntry, DimensionedTokenSeed } from '../registry/index.js'

// Runtime CSS injection for setTokens / setBreakpoints
export { injectTokenCSS } from '../utilities/tokenStyleSheet.js'

// CSS generation — pure JS core of setTokens. The React wrapper in
// nice-react-styles calls this then injectTokenCSS.
export { generateTokenCSS } from './generateTokenCSS.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
export type { TokenDefinition, TokenMap, ComponentTokenNode, TokenResult, TokenFromMapOptions } from '../utilities/getTokenFromMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'