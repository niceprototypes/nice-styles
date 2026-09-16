/**
 * `@custom-media` breakpoint emitter — the OPTIONAL, PostCSS-only asset.
 *
 * Emits `breakpoints.custom-media.css`: named `@custom-media` aliases so a CSS
 * file can gate media queries on the breakpoint source of truth:
 *
 * ```css
 * @import "nice-styles/breakpoints.custom-media.css";
 * @media (--np--tablet--up) { … }
 * ```
 *
 * ## Not part of the plain-import set
 *
 * `@custom-media` is not browser-native — resolving it requires
 * `postcss-custom-media` (or `postcss-preset-env`) in the CONSUMER's build, at
 * the consumer's usage site. That breaks the "plain `@import`, zero consumer
 * transform" contract the rest of the CSS assets share, so this file is an
 * opt-in convenience for pipelines that already run PostCSS (e.g. a Vite build),
 * NOT the default breakpoint asset.
 *
 * For the plain-import path, use {@link module:scripts/css/emitBreakpointUtilities}
 * (native utility classes) or responsive tokens in `tokens.css`.
 *
 * Because that resolution happens at the consumer's build time, a runtime
 * `setTokens({ breakpoints })` call does NOT retroactively change these aliases.
 *
 * @module scripts/css/emitCustomMedia
 */

import { breakpointAliases } from './breakpointAliases.js'
import { generatedHeader } from '../shared/generatedHeader.js'

const HEADER = generatedHeader('src/tokens/breakpoints.json', [
  'OPTIONAL @custom-media breakpoints — requires postcss-custom-media in the',
  'consuming build (not part of the plain-import set). For the native path use',
  'nice-styles/breakpoints.css (utility classes) or responsive tokens.',
  '',
  'Usage:',
  '  @import "nice-styles/breakpoints.custom-media.css";',
  '  @media (--np--tablet--up) { ... }',
])

/**
 * Build the `breakpoints.custom-media.css` string of `@custom-media` aliases.
 *
 * @returns The complete CSS file contents.
 */
export function buildCustomMediaCss(): string {
  const body = breakpointAliases()
    .map(({ name, condition }) => `@custom-media --np--${name} ${condition};`)
    .join('\n')
  return `${HEADER}\n${body}\n`
}