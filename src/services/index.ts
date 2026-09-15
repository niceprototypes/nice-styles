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
export { getToken } from './getToken.js'
export type { TokenOptions, TokenAccessor } from './getToken.js'
export { setBreakpoints } from './setBreakpoints.js'
export { getConstant, getConstantKey, NAMESPACE } from './getConstant.js'
export type { CssConstantOptions } from './getConstant.js'
export { transformColor } from './transformColor.js'
export type { TransformColorOptions } from './transformColor.js'
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
export { registry, registerTokens } from '../registry/index.js'
export type { TokenEntry, TokenValue } from '../registry/index.js'

// Runtime CSS injection for setTokens / setBreakpoints
export { injectTokenCSS } from '../utilities/tokenStyleSheet.js'

// CSS generation — pure JS core of setTokens. The React wrapper in
// nice-react-styles calls this then injectTokenCSS.
export { generateTokenCSS } from './generateTokenCSS.js'

// Write `data-theme` on the document root to switch the day/night token cascade.
export { applyTheme } from './applyTheme.js'
export type { ThemeName } from './applyTheme.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export type { TokenDefinition, TokenMap, ComponentTokenNode } from '../types/tokenMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'