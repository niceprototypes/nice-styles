/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 *
 * Re-exported by the package entry (`src/index.ts`), which also runs the
 * registry seeding side effect.
 */

// Breakpoints — media query strings and pixel floors for a key (`tablet+`)
export { getBreakpoint, getBreakpointValue } from './getBreakpoint.js'
export type { BreakpointName } from './getBreakpoint.js'

// Breakpoint keys — parsing, matching, and specificity of `name` / `name+` / `name-`
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

// Breakpoint constants — names, order, and the live threshold table
export {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINT_ORDER,
  SETTABLE_BREAKPOINTS,
  BREAKPOINTS,
} from '../constants/breakpoints.js'
export type { BreakpointValues, SettableBreakpoint } from '../constants/breakpoints.js'

// Token access — the single getter and its enumeration counterpart
export { getToken } from './getToken.js'
export type { TokenOptions, TokenAccessor } from './getToken.js'
export { resolveColorProp } from './resolveColorProp.js'
export type { ColorTokenProp, ColorPropObject, ChannelValue } from './resolveColorProp.js'
export { listTokens } from './listTokens.js'
export type { TokenListing, ListTokensFilter, TokenSource } from './listTokens.js'

// Variable names without a registry lookup
export { getConstant, getConstantKey, NAMESPACE } from './getConstant.js'
export type { CssConstantOptions } from './getConstant.js'

// Value helpers — color channel shifts and text height
export { transformColor } from './transformColor.js'
export type { TransformColorOptions } from './transformColor.js'
export { default as getTextHeight } from './getTextHeight.js'

// Font URL parsers — metadata from Google Fonts URLs and Adobe kit references
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
export type { TokenEntry, TokenValue, TokenLayer, TokenIdentity } from '../registry/index.js'

// Runtime CSS injection for setTokens
export { injectTokenCSS } from '../utilities/tokenStyleSheet.js'

// CSS generation — pure JS core of setTokens. The React wrapper in
// nice-react-styles calls this then injectTokenCSS.
export { generateTokenCSS } from './generateTokenCSS.js'

// Write `data-theme` on the document root to switch the day/night token cascade.
export { applyTheme } from './applyTheme.js'
export type { ThemeName } from './applyTheme.js'

// Token map types (from types/) and the kebab-case helper (from utilities/), for sibling packages
export type { TokenDefinition, TokenMap, ComponentTokenNode } from '../types/tokenMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'
