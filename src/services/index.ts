/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 */

export { getBreakpoint, getBreakpointValue } from './getBreakpoint.js'
export type { BreakpointName } from './getBreakpoint.js'
export {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
} from '../constants/breakpoints.js'
export type { BreakpointValues } from '../constants/breakpoints.js'
export { getToken, getTokenKey, getTokenValue } from './getToken.js'
export { getModeToken, getModeTokenKey, getModeTokenValue } from './getModeToken.js'
export { getBreakpointToken, getBreakpointTokenKey, getBreakpointTokenValue } from './getBreakpointToken.js'
export { setCoreTokens } from './setCoreTokens.js'
export { setModeTokens } from './setModeTokens.js'
export { setBreakpointTokens } from './setBreakpointTokens.js'
export { setBreakpoints } from './setBreakpoints.js'
export { getConstant, getConstantKey, NAMESPACE } from './getConstant.js'
export type { CssConstantOptions } from './getConstant.js'
export { getComponentToken, getComponentTokenKey, getComponentTokenValue } from './getComponentToken.js'
export { getInvertedMode } from './getInvertedMode.js'
export { default as getTextHeight } from './getTextHeight.js'

export { parseGoogleFontsUrl } from './parseGoogleFontsUrl.js'

// Style-value types and constants
export type { ModeValue, BreakpointValue } from '../types/styleValues.js'
export type { FontAxis, GoogleFontMetadata, LinkAttributes, GoogleFontsConfig } from '../types/googleFonts.js'
export { DEFAULT_MODE, DEFAULT_BREAKPOINT, STYLE_VALUE_KEYS } from '../constants/styleValues.js'
export type { StyleValueKind } from '../constants/styleValues.js'
export { isStyleValue } from '../utilities/isStyleValue.js'

// Registry — seeded at module load via init.ts → registry/index.ts side-effect
export { registry, registerTokens, seedDimensionedTokens } from '../registry/index.js'
export type { RegistryEntry, DimensionedTokenSeed } from '../registry/index.js'

// Runtime CSS injection for createTokens / setBreakpoints
export { injectTokenCSS } from '../utilities/tokenStyleSheet.js'

// CSS generation — pure JS core of createTokens. The React wrapper in
// nice-react-styles calls this then injectTokenCSS.
export { generateTokenCSS } from './generateTokenCSS.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
export type { TokenDefinition, TokenMap, ComponentTokenNode, TokenResult, TokenFromMapOptions } from '../utilities/getTokenFromMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'
