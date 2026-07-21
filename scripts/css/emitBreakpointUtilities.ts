/**
 * Native breakpoint utility-class emitter — the DEFAULT, plain-import asset.
 *
 * Emits `breakpoints.css`: real `@media` blocks wrapping utility classes, so a
 * CSS file gets breakpoint behavior with a bare `@import` and zero consumer-side
 * transform — the same contract as `tokens.css` / `reset.css`, working in any
 * bundler (Vite, esbuild, the Storybook manager) with no PostCSS.
 *
 * ```css
 * @import "nice-styles/breakpoints.css";
 * <div class="np-hide-tablet-up">…</div>   <!-- hidden at ≥ tablet -->
 * ```
 *
 * ## Initial utility vocabulary
 *
 * One display utility per breakpoint alias — `.np-hide-<alias>` sets
 * `display: none` within that alias's query. Aliases mirror the breakpoint-key
 * space (`tablet`, `tablet-up`, `tablet-down`, …). This is the conventional
 * responsive primitive (cf. `.d-md-none`, `md:hidden`); extend the vocabulary
 * here as needs surface — every addition stays native by construction.
 *
 * All aliases come from {@link breakpointAliases}, so the pixel floors track
 * `src/tokens/breakpoints.json` alongside the `@custom-media` file and the
 * responsive token cascade.
 *
 * @module scripts/css/emitBreakpointUtilities
 */

import { breakpointAliases } from './breakpointAliases.js'

const HEADER = `/**
 * Auto-generated from src/tokens/breakpoints.json — do not edit by hand.
 * Native breakpoint utility classes (plain @import, no consumer transform).
 *
 * Usage:
 *   @import "nice-styles/breakpoints.css";
 *   <div class="np-hide-tablet-up">…</div>   <!-- hidden at >= tablet -->
 */
`

/** Class-name form of an alias label: `tablet--up` → `tablet-up`. */
function classSuffix(name: string): string {
  return name.replace(/--/g, '-')
}

/**
 * Build the `breakpoints.css` string of native utility classes.
 *
 * @returns The complete CSS file contents.
 */
export function buildBreakpointUtilitiesCss(): string {
  const body = breakpointAliases()
    .map(({ name, condition }) =>
      `@media ${condition} {\n  .np-hide-${classSuffix(name)} { display: none !important; }\n}`
    )
    .join('\n\n')
  return `${HEADER}\n${body}\n`
}