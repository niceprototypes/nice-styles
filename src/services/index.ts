/**
 * Dynamic Token Services
 *
 * This module provides the single source of truth for all design tokens.
 * It reads from tokens.json and dynamically generates:
 * - CSS variable names (--font-size-base)
 * - JS constant names (FONT_SIZE_BASE)
 * - Token objects (fontSize.base)
 * - TypeScript types
 *
 * This eliminates the need for constants.ts, tokens.ts, and types.ts
 */

export { getCssConstant } from './getCssConstant.js'
export { getJsConstant } from './getJsConstant.js'
export type * from './types.js'