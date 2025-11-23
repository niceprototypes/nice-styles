/**
 * Dynamic Token Services
 *
 * This module provides functions for working with design tokens.
 * It reads from tokens.json to provide:
 * - CSS variable names (--font-size-base)
 * - JS constant names (FONT_SIZE_BASE)
 */

export { getCssConstant } from './getCssConstant.js'
export { getJsConstant } from './getJsConstant.js'