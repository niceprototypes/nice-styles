import { DEFAULT_THEME, NIGHT_THEME } from '../constants/styleValues.js'
import { registry } from '../registry/createRegistry.js'
import { getConstant, getConstantKey } from '../services/getConstant.js'
import { isBreakpointKeyMap } from './breakpointKeyMap.js'
import { isStyleValue } from './isStyleValue.js'
import { extractCoreVar } from './css/componentInverseCss.js'
import type { ThemeValue } from '../types/styleValues.js'

/** The themes a token ships values for: the default and its OS dark-mode pair. */
const SHIPPED_THEMES = [DEFAULT_THEME, NIGHT_THEME]

/**
 * A token's generated value per shipped theme, read from the registry's seed layer:
 * - a themed token (core, or a component token with a `$themes.night` override): its values;
 * - a component alias to a themed core token (`var(--np--color)`): the core's theme primitives,
 *   so each theme keeps following the core;
 * - any other value: the same value in every theme.
 *
 * @returns Values keyed by theme, or undefined for a token the sources don't define
 */
function themeDefaults(address: string, variant: string): Record<string, string | number> | undefined {
  const seed = registry.get(getConstantKey(address, variant))?.seed
  if (seed === undefined || isBreakpointKeyMap(seed)) return undefined
  if (isStyleValue('theme', seed)) return seed

  // An alias to a themed core token follows that core's primitive in each theme
  const coreVar = typeof seed === 'string' ? extractCoreVar(seed) : null
  const core = coreVar ? registry.get(coreVar) : undefined
  if (core && isStyleValue('theme', core.seed)) {
    const coreAddress = core.path.join('.')
    return Object.fromEntries(SHIPPED_THEMES.map((theme) => [theme, getConstant(coreAddress, core.variant, { theme })]))
  }

  // A theme-independent value holds in every theme
  return Object.fromEntries(SHIPPED_THEMES.map((theme) => [theme, seed as string | number]))
}

/**
 * Fill a partial theme value (`{ day }` or `{ night }` alone) with the token's own values for
 * the themes it leaves out, so overriding one theme leaves the others as they were. Anything
 * else — plain values, breakpoint maps, complete theme values — is returned unchanged.
 *
 * @param address - Token address without the variant (`"color"`, `"logo.color"`)
 * @param variant - Variant name (`"base"`)
 * @param value - The value a `setTokens` map gives this variant
 * @returns The value, with missing shipped themes filled from the token's defaults
 *
 * @example
 * completeThemeValue("logo.color", "base", { day: "red" })
 * // { day: "red", night: "var(--np--color--night)" }
 */
export function completeThemeValue(address: string, variant: string, value: unknown): unknown {
  // Only a plain object naming a shipped theme can be a theme value
  if (typeof value !== 'object' || value === null || Array.isArray(value) || isBreakpointKeyMap(value)) return value
  const given = value as ThemeValue
  const missing = SHIPPED_THEMES.filter((theme) => given[theme] === undefined)
  if (missing.length === 0 || missing.length === SHIPPED_THEMES.length) return value

  const defaults = themeDefaults(address, variant)
  // A token the sources don't define has nothing to fill from
  if (!defaults) return value
  const filled = Object.fromEntries(missing.flatMap((theme) => (defaults[theme] === undefined ? [] : [[theme, defaults[theme]]])))
  // Default theme first, matching how theme values are written everywhere else
  return { [DEFAULT_THEME]: given[DEFAULT_THEME] ?? filled[DEFAULT_THEME], ...filled, ...given }
}
