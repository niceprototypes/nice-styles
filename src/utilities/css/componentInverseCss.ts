/**
 * Component inverse-color derivation.
 *
 * Every component color token is a bare alias to a core color —
 * `--np--ink--color--light: var(--np--color--light)`. The core color has an
 * inverse dimension (`--np--color--light--inverse`), but the component alias
 * does not: `--inverse` is a name suffix, not a scope, so nothing propagates
 * into it the way `night` propagates through `componentAliasCss`.
 *
 * Rather than author a parallel `$inverse` tree in every component file, this
 * derives the component's inverse variable from the alias it already declares:
 * if `ink.color.light` points at a core color that has an inverse, then
 * `--np--ink--color--light--inverse` points at that core inverse. Component
 * color data stays single-sourced, and a component gains the inverse dimension
 * by aliasing a core color — nothing else.
 *
 * ## Input
 * Component base trees keyed by prefix, plus a map built by
 * {@link buildCoreInverseMap} from the core `$inverse` day and night values.
 *
 * ## Output
 * One semantic declaration per derived variable, and the night/day
 * reassignments that switch it with the theme. No primitives are minted — the
 * reassignments target the core inverse's own `--day` / `--night` primitives.
 *
 * @example
 * // input: ink color.light = "var(--np--color--light)"; core color.light has an inverse
 * // semanticLines: ["\t--np--ink--color--light--inverse: var(--np--color--light--inverse);"]
 * // nightMediaBody: ["\t\t--np--ink--color--light--inverse: var(--np--color--light--night--inverse);"]
 */

import { getConstantKey, NAMESPACE } from '../../services/getConstant.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import { walkTokenTree } from './treeWalk.js'
import type { CssEmitResult, FlatTokens, TokenTree } from './types.js'

/** A value that is exactly one `var()` of a namespaced variable; group 1 is the variable. */
const BARE_ALIAS = new RegExp(`^var\\((--${NAMESPACE}--[a-z0-9-]+)\\)$`)

/**
 * The core variable a bare alias references. Fallbacks (`var(--a, b)`) and
 * composite values (`calc(…)`) are not bare aliases.
 *
 * @param value - A component token value
 * @returns `--np--color--light` for `var(--np--color--light)`; null for anything but a single bare `var()`
 */
export function extractCoreVar(value: string): string | null {
  const match = value.match(BARE_ALIAS)
  return match ? match[1] : null
}

/** The inverse variables a core color variable can be followed into. */
export interface CoreInverseTarget {
  /** The core's inverse semantic variable (`--np--color--light--inverse`) */
  inverse: string
  /** Its night primitive, when the group has an inverse night value */
  night?: string
  /** Its day primitive, present whenever `night` is */
  day?: string
}

/**
 * Map each core semantic color variable to its inverse counterparts, so an
 * alias to that variable can be followed into the inverse dimension.
 *
 * Night is read from the core `$inverse` night values, not the base
 * `$themes.night`: the reassignment targets the inverse's own primitive, which
 * exists only where the inverse defines a night value.
 *
 * @param inverseTokens - Core `$inverse` day values, keyed by group
 * @param inverseNightTokens - Core `$inverse` night values, keyed by group
 * @returns Core variable (`--np--color--light`) → its inverse targets; groups with no inverse are absent
 */
export function buildCoreInverseMap(
  inverseTokens: FlatTokens,
  inverseNightTokens: FlatTokens
): Map<string, CoreInverseTarget> {
  const map = new Map<string, CoreInverseTarget>()

  for (const [group, variants] of Object.entries(inverseTokens)) {
    for (const variant of Object.keys(variants)) {
      // A night primitive is only emitted where the inverse itself defines one
      const themed = inverseNightTokens[group]?.[variant] !== undefined
      map.set(getConstantKey(group, variant), {
        inverse: getConstantKey(group, variant, { inverse: true }),
        night: themed ? getConstantKey(group, variant, { theme: 'night', inverse: true }) : undefined,
        day: themed ? getConstantKey(group, variant, { theme: 'day', inverse: true }) : undefined,
      })
    }
  }

  return map
}

/**
 * Emit the inverse variable for every component token that aliases a core color
 * with an inverse dimension.
 *
 * @param componentTokens - Component base trees keyed by prefix
 * @param coreInverse - Map from {@link buildCoreInverseMap}
 * @returns Line arrays for the assembler; no primitives are minted (see {@link CssEmitResult})
 */
export function generateComponentInverseCss(
  componentTokens: Record<string, TokenTree>,
  coreInverse: Map<string, CoreInverseTarget>
): CssEmitResult {
  const result: CssEmitResult = { semanticLines: [], dayPrimitives: [], nightPrimitives: [], nightMediaBody: [], dayPinBody: [] }

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    walkTokenTree(tree, (path, value) => {
      // Only a bare alias to a core token that has an inverse can be followed —
      // literals, composite values, and non-color aliases (gap, fontSize) are skipped
      const coreVar = extractCoreVar(value)
      if (!coreVar) return
      const target = coreInverse.get(coreVar)
      if (!target) return

      // The derived variable sits beside the base one, with `--inverse` last
      const cssKey = getConstantKey(`${prefix}.${path.join('.')}`, { inverse: true })
      result.semanticLines.push(declarationLine(cssKey, `var(${target.inverse})`))

      // Follow the core inverse into the theme blocks, exactly as the base alias
      // follows the core: night for prefers-color-scheme and the night pin, day
      // so a `[data-theme="day"]` pin under OS dark points back at the day value
      if (target.night && target.day) {
        result.nightMediaBody.push(reassignmentLine(cssKey, target.night))
        result.dayPinBody.push(reassignmentLine(cssKey, target.day))
      }
    })
  }

  return result
}
