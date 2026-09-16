/**
 * Per-group CSS assembler — `dist/css/{group}.css`.
 *
 * One file per core token group, for consumers importing a single group. Same
 * variables as the group's section of `dist/tokens.css` (semantic declarations,
 * `--day` / `--night` primitives, the group's `--inverse` variables), without
 * the theme switching blocks: the file declares values, it does not react to
 * `prefers-color-scheme` or `[data-theme]`.
 *
 * ## Output
 * ```css
 * :root {
 *   --np--color: #222;
 *   --np--color--inverse: #eee;
 *
 *   /* Day mode primitives *\/
 *   --np--color--day: #222;
 *
 *   /* Night mode primitives *\/
 *   --np--color--night: #eee;
 * }
 * ```
 */

import { generateTokenGroupCss } from '../../src/utilities/css/coreTokenCss.js'

/** Blank line, header comment, body — nothing when the body is empty. */
function section(header: string, body: string[]): string[] {
  return body.length === 0 ? [] : ['', header, ...body]
}

/**
 * @param cssName - Kebab-case group name
 * @param variants - Day/base values keyed by variant
 * @param nightVariants - Night overrides keyed by variant (sparse)
 * @param inverseVariants - The group's `$inverse` day values, when it has any
 * @param inverseNightVariants - The group's `$inverse` night values
 * @returns The file contents
 */
export function buildIndividualCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>,
  inverseVariants?: Record<string, string>,
  inverseNightVariants?: Record<string, string>
): string {
  const group = generateTokenGroupCss(cssName, variants, nightVariants)
  const inverse = inverseVariants
    ? generateTokenGroupCss(cssName, inverseVariants, inverseNightVariants ?? {}, true)
    : { semanticLines: [], dayPrimitives: [], nightPrimitives: [] }

  return [
    ':root {',
    ...group.semanticLines,
    ...inverse.semanticLines,
    ...section('\t/* Day mode primitives */', [...group.dayPrimitives, ...inverse.dayPrimitives]),
    ...section('\t/* Night mode primitives */', [...group.nightPrimitives, ...inverse.nightPrimitives]),
    '}',
  ].join('\n')
}
