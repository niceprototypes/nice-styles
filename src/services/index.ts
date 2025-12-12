/**
 * Dynamic Token Services
 *
 * This module provides functions for working with design tokens.
 * It reads from tokens.json to provide:
 * - CSS variable names (--core--font-size--base)
 * - JS constant names (FONT_SIZE_BASE)
 * - Token values (fontSize.base)
 */

export { getToken } from './getToken.js'
export { getCssConstant } from './getCssConstant.js'
export type { CssConstantResult } from './getCssConstant.js'
export { camelToKebab } from './camelToKebab.js'
export { camelToScreaming } from './camelToScreaming.js'