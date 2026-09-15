/**
 * The single token getter.
 *
 * Every token — core, custom (`setTokens`), theme, breakpoint, inverse, and
 * component — resolves through `getToken` against one store (`registry`), keyed
 * by CSS variable name.
 *
 * @example getToken("gap")                                           // "var(--np--gap)"
 * @example getToken("color", "base", { theme: "night" })             // "var(--np--color--night)"
 * @example getToken("fontSize", "large", { breakpoint: "tablet" })    // "var(--np--font-size--large--tablet)"
 * @example getToken("color", "base", { inverse: true })               // "var(--np--color--inverse)"
 * @example getToken("spacing", "large", { prefix: "button" })         // "var(--np--button--spacing--large)"
 * @example getToken(["icon", "size"], "small", { prefix: "button" })  // "var(--np--button--icon--size--small)"
 * @example getToken("gap", "base", { as: "key" })                     // "--np--gap"
 * @example getToken("fontSize", "base", { as: "value" })              // "14px"
 *
 * - `as`: `"var"` (default) — `var(--np--…)`; `"key"` — bare variable name;
 *   `"value"` — raw value.
 * - Layers: the runtime layer (`setTokens`) is read over the seed layer
 *   (generated data), per theme and per breakpoint — the same order as the
 *   injected stylesheet over `tokens.css`. `pristine` reads the seed only.
 * - Unregistered name: the `var` / `key` forms return the computed name and warn
 *   once if it is still unregistered after module evaluation settles, so a read
 *   that runs before `setTokens` is not an error. The `value` form throws.
 * - A `theme` the token has no value for throws. A `breakpoint` pin in the
 *   `var` / `key` forms throws unless a generated `--{breakpoint}` primitive exists.
 */

import { getConstantKey } from './getConstant.js'
import { isBreakpointName } from './breakpointKey.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { resolveBreakpointValue } from '../utilities/resolveBreakpointValue.js'
import { formatError } from '../utilities/formatError.js'
import { DEFAULT_THEME, DEFAULT_BREAKPOINT, STYLE_VALUE_KEYS } from '../constants/styleValues.js'
import { registry, type TokenEntry, type TokenValue } from '../registry/index.js'

/** Accessor form returned by `getToken`. */
export type TokenAccessor = 'var' | 'key' | 'value'

export interface TokenOptions {
  /** Component prefix (e.g. "button"); omit for core and custom tokens. */
  prefix?: string
  /** Pin to a theme primitive (e.g. "night"). */
  theme?: string
  /** Pin to a breakpoint primitive (e.g. "tablet"). */
  breakpoint?: string
  /** Inverse-color dimension (`--inverse` segment). */
  inverse?: boolean
  /** Read the generated seed only, ignoring runtime overrides. */
  pristine?: boolean
  /** Accessor form; default `"var"`. */
  as?: TokenAccessor
}

/** Keys already scheduled for an unregistered-token check (one warning per key). */
const scheduledChecks = new Set<string>()

/**
 * Warn if `key` is still unregistered once the current synchronous run
 * (module evaluation, including a later `setTokens` call) has finished.
 */
function checkRegisteredLater(key: string): void {
  if (scheduledChecks.has(key)) return
  scheduledChecks.add(key)
  queueMicrotask(() => {
    if (!registry.has(key)) {
      console.warn(
        `getToken: "${key}" is not registered. If it is a custom token, make sure setTokens runs; otherwise check the name — var(${key}) will not resolve.`
      )
    }
  })
}

/** Human-readable token label for error messages, e.g. `button:icon.size.small`. */
function describe(path: string[], variant: string, prefix?: string): string {
  return `${prefix ? `${prefix}:` : ''}${[...path, variant].join('.')}`
}

/** Layers to read, most specific first. */
function layersOf(entry: TokenEntry, pristine: boolean): TokenValue[] {
  const layers = pristine ? [entry.seed] : [entry.runtime, entry.seed]
  return layers.filter((layer): layer is TokenValue => layer !== undefined)
}

/** Throw unless some layer holds a value for `theme`. */
function assertTheme(layers: TokenValue[], theme: string, path: string[], variant: string, prefix?: string): void {
  const available = layers.some((layer) => isStyleValue('theme', layer) && layer[theme] !== undefined)
  if (!available) {
    throw new Error(
      formatError('modeNotFound', { mode: theme, tokenName: describe(path, '', prefix).replace(/\.$/, ''), variantName: variant })
    )
  }
}

/** Throw unless `breakpoint` is a known breakpoint name. */
function assertBreakpointName(breakpoint: string): void {
  if (!isBreakpointName(breakpoint)) {
    throw new Error(
      formatError('breakpointNotFound', { name: breakpoint, available: STYLE_VALUE_KEYS.breakpoint.join(', ') })
    )
  }
}

/** Throw unless a generated `--{breakpoint}` primitive exists (seeded breakpoint cells only). */
function assertBreakpointPrimitive(entry: TokenEntry, breakpoint: string, label: string): void {
  const seeded = entry.seed
  if (!isStyleValue('breakpoint', seeded) || seeded[breakpoint] === undefined) {
    throw new Error(`getToken: "${label}" has no generated --${breakpoint} primitive`)
  }
}

/** Resolve the raw value across layers for an optional theme or breakpoint. */
function resolveValue(layers: TokenValue[], label: string, theme?: string, breakpoint?: string): string {
  for (const layer of layers) {
    if (isStyleValue('breakpoint', layer)) {
      const value = resolveBreakpointValue(layer, (breakpoint ?? DEFAULT_BREAKPOINT) as typeof DEFAULT_BREAKPOINT)
      if (value !== undefined) return String(value)
    } else if (isStyleValue('theme', layer)) {
      const value = layer[theme ?? DEFAULT_THEME]
      if (value !== undefined) return String(value)
    } else {
      return String(layer)
    }
  }
  throw new Error(
    `getToken: no value for "${label}"${theme ? ` in theme "${theme}"` : ''}${breakpoint ? ` at breakpoint "${breakpoint}"` : ''}`
  )
}

export function getToken(name: string | string[], variant: string = 'base', options: TokenOptions = {}): string {
  const { prefix, theme, breakpoint, inverse = false, pristine = false, as = 'var' } = options
  const path = Array.isArray(name) ? name : [name]
  const label = describe(path, variant, prefix)

  if (theme !== undefined && breakpoint !== undefined) {
    throw new Error(`getToken: "${label}" cannot pin both a theme and a breakpoint`)
  }
  if (breakpoint !== undefined) assertBreakpointName(breakpoint)

  const entryKey = getConstantKey(path, variant, { pkg: prefix, inverse })
  const key = getConstantKey(path, variant, { pkg: prefix, inverse, theme, breakpoint })
  const entry = registry.get(entryKey)

  if (!entry) {
    if (as === 'value') {
      throw new Error(formatError('tokenNotFound', { tokenName: label, prefix: prefix ?? 'core', available: '' }))
    }
    checkRegisteredLater(entryKey)
    return as === 'key' ? key : `var(${key})`
  }

  const layers = layersOf(entry, pristine)
  if (theme !== undefined) assertTheme(layers, theme, path, variant, prefix)
  if (as === 'value') return resolveValue(layers, label, theme, breakpoint)
  if (breakpoint !== undefined) assertBreakpointPrimitive(entry, breakpoint, label)
  return as === 'key' ? key : `var(${key})`
}
