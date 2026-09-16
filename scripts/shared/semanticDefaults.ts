/**
 * Semantic defaults — the base value of every token group.
 *
 * The values `:root` declares (`generateCss`) and each type union lists
 * (`generateTypes`).
 *
 * Kept out of `readTokenSources.ts` on purpose: `src/constants/breakpoints.ts`
 * imports `src/generated/breakpointsData.js`, which `generateTokens` creates.
 * Only pipelines that run after `build:tokens` may import this module.
 */

import { BREAKPOINT_PHONE } from '../../src/constants/breakpoints.js'
import type { Tokens, TokenSourceModel } from './types.js'

/**
 * @param model - Validated sources from `readTokenSources`
 * @returns Core → themed day → phone breakpoint groups (later groups win on collision)
 */
export function semanticDefaults(model: TokenSourceModel): Tokens {
  return { ...model.core, ...model.themes.day, ...(model.breakpointTokens[BREAKPOINT_PHONE] ?? {}) }
}
