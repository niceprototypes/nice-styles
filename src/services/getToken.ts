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
 * @example getToken("button.spacing:large")                          // "var(--np--button--spacing--large)"
 * @example getToken("button.icon.size:small")                        // "var(--np--button--icon--size--small)"
 * @example getToken("color:base:inverse")                            // "var(--np--color--inverse)"
 * @example getToken("gap", "base", { as: "key" })                     // "--np--gap"
 * @example getToken("fontSize", "base", { as: "value" })              // "14px"
 *
 * - `as`: `"var"` (default) — `var(--np--…)`; `"key"` — bare variable name;
 *   `"value"` — raw value. A value that is exactly one `var(--np--…)` reference
 *   to a registered token is followed to that token's value (recursively, same
 *   theme / breakpoint / pristine; a cycle throws). Expressions — `calc()`,
 *   `max()`, several vars, a var with a fallback — are returned unchanged.
 * - Layers: the runtime layer (`setTokens`) is read over the seed layer
 *   (generated data), per theme and per breakpoint — the same order as the
 *   injected stylesheet over `tokens.css`. `pristine` reads the seed only.
 * - Unregistered name: the `var` / `key` forms return the computed name and warn
 *   once if it is still unregistered after module evaluation settles, so a read
 *   that runs before `setTokens` is not an error. The `value` form throws.
 * - A `theme` the token has no value for throws. A `breakpoint` pin in the
 *   `var` / `key` forms throws unless a generated `--{breakpoint}` primitive exists.
 * - Types: the address form accepts `TokenAddress` only, and the two-argument
 *   form constrains the variant to its group's union (`TokenVariants`), so a
 *   renamed or invented token is a compile error. The variant may be omitted
 *   only for groups that have `base`. The path-array form stays untyped.
 */

import { getConstantKey, parseTokenName } from './getConstant.js'
import { applyChannels, relativeColor, type ChannelValue } from '../utilities/css/relativeColor.js'
import { isBreakpointName } from './breakpointKey.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { resolveBreakpointValue } from '../utilities/resolveBreakpointValue.js'
import { formatError } from '../utilities/formatError.js'
import { DEFAULT_THEME, DEFAULT_BREAKPOINT, STYLE_VALUE_KEYS } from '../constants/styleValues.js'
import { registry, type TokenEntry, type TokenValue } from '../registry/index.js'
import type { TokenAddress, TokenGroup, TokenVariants } from '../generated/types.js'

/** Accessor form returned by `getToken`. */
export type TokenAccessor = 'var' | 'key' | 'value'

/** Options for `getToken`; all optional. */
export interface TokenOptions {
  /** Pin to a theme primitive (e.g. "night"). */
  theme?: string
  /** Pin to a breakpoint primitive (e.g. "tablet"). */
  breakpoint?: string
  /** Inverse-color dimension (`--inverse` segment). Shorthand for `effect: "inverse"`. */
  inverse?: boolean
  /** Color-system effect appended as the last key segment. Set by the address's second colon (`"color:base:inverse"`). */
  effect?: string
  /**
   * Per-channel HSLA adjustments (`["+0", "-20", "*0.55", "+0"]`). The `var`
   * form returns relative color syntax wrapping the token's `var()`, so the
   * result still follows the theme cascade; the `value` form computes the same
   * adjustment as a literal. Not available as a `key` — see `relativeColor`.
   */
  transform?: readonly ChannelValue[]
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
 *
 * @param key - Registry key (the semantic variable name, without a theme or breakpoint suffix)
 */
function checkRegisteredLater(key: string): void {
  // One check per key for the lifetime of the module
  if (scheduledChecks.has(key)) return
  scheduledChecks.add(key)
  // A microtask runs after the current synchronous code, so a setTokens call later in the same module still counts
  queueMicrotask(() => {
    if (!registry.has(key)) {
      console.warn(
        `getToken: "${key}" is not registered. If it is a custom token, make sure setTokens runs; otherwise check the name — var(${key}) will not resolve.`
      )
    }
  })
}

/**
 * Human-readable token label for error messages, e.g. `button:icon.size.small`.
 *
 * @param path - Group path
 * @param variant - Variant name (`''` to label the group only)
 * @param prefix - Component prefix, if any
 * @returns `{prefix}:{path}.{variant}`
 */
function describe(path: string[], variant: string, prefix?: string): string {
  return `${prefix ? `${prefix}:` : ''}${[...path, variant].join('.')}`
}

/**
 * Layers to read, most specific first.
 *
 * @param entry - Registry entry
 * @param pristine - Skip the runtime layer
 * @returns The defined layers: `[runtime, seed]`, or `[seed]` when pristine
 */
function layersOf(entry: TokenEntry, pristine: boolean): TokenValue[] {
  const layers = pristine ? [entry.seed] : [entry.runtime, entry.seed]
  return layers.filter((layer): layer is TokenValue => layer !== undefined)
}

/**
 * Throw unless some layer holds a value for `theme`.
 *
 * @param layers - Layers from `layersOf`
 * @param theme - Theme name being pinned
 * @param path - Group path, for the message
 * @param variant - Variant name, for the message
 * @param prefix - Component prefix, for the message
 * @throws `modeNotFound` from `errors.json`
 */
function assertTheme(layers: TokenValue[], theme: string, path: string[], variant: string, prefix?: string): void {
  const available = layers.some((layer) => isStyleValue('theme', layer) && layer[theme] !== undefined)
  if (!available) {
    throw new Error(
      formatError('modeNotFound', { mode: theme, tokenName: describe(path, '', prefix).replace(/\.$/, ''), variantName: variant })
    )
  }
}

/**
 * Throw unless `breakpoint` is a known breakpoint name.
 *
 * @param breakpoint - Name being pinned
 * @throws `breakpointNotFound` from `errors.json`
 */
function assertBreakpointName(breakpoint: string): void {
  if (!isBreakpointName(breakpoint)) {
    throw new Error(
      formatError('breakpointNotFound', { name: breakpoint, available: STYLE_VALUE_KEYS.breakpoint.join(', ') })
    )
  }
}

/**
 * Throw unless a generated `--{breakpoint}` primitive exists (seeded breakpoint cells only).
 *
 * Runtime breakpoint values are emitted as `@media` reassignments of the
 * semantic variable, not as primitives, so only the seed layer can back a pin.
 *
 * @param entry - Registry entry
 * @param breakpoint - Breakpoint name being pinned
 * @param label - Token label, for the message
 * @throws when the seed is not a breakpoint map or has no value at `breakpoint`
 */
function assertBreakpointPrimitive(entry: TokenEntry, breakpoint: string, label: string): void {
  const seeded = entry.seed
  if (!isStyleValue('breakpoint', seeded) || seeded[breakpoint] === undefined) {
    throw new Error(`getToken: "${label}" has no generated --${breakpoint} primitive`)
  }
}

/**
 * Resolve the raw value across layers for an optional theme or breakpoint.
 *
 * Layers are tried in order; the first that yields a value wins. A plain
 * layer applies to every theme and breakpoint. A breakpoint layer resolves at
 * `breakpoint` (default `phone`); a theme layer reads `theme` (default `day`).
 * A layer that has no value for the requested cell falls through to the next.
 *
 * @param layers - Layers from `layersOf`
 * @param label - Token label, for the message
 * @param theme - Theme to read, if pinned
 * @param breakpoint - Breakpoint to resolve at, if pinned
 * @returns The value as a string
 * @throws when no layer has a value for the requested cell
 */
function resolveValue(layers: TokenValue[], label: string, theme?: string, breakpoint?: string): string {
  for (const layer of layers) {
    if (isStyleValue('breakpoint', layer)) {
      // Most specific key covering the breakpoint (ranges like `laptop+` included)
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

/** A value that is exactly one `var(--np--…)` reference with no fallback — an alias. */
const SINGLE_REFERENCE = /^var\(\s*(--np--[\w-]+)\s*\)$/

/**
 * Whether a token is an alias (one `var(--np--…)` reference) to a token that has a value for
 * `theme`, directly or through further aliases.
 *
 * @param layers - The alias token's layers, most authoritative first
 * @param theme - Theme being pinned
 * @param pristine - Read the seed layer only
 * @returns true when following the alias reaches a value for `theme`
 */
function aliasHasTheme(layers: TokenValue[], theme: string, pristine: boolean): boolean {
  const visited = new Set<string>()
  let current = layers
  for (;;) {
    const plain = current.find((layer) => !isStyleValue('theme', layer) && !isStyleValue('breakpoint', layer))
    const match = typeof plain === 'string' ? plain.match(SINGLE_REFERENCE) : null
    const target = match ? registry.get(match[1]) : undefined
    if (!target || visited.has(target.key)) return false
    visited.add(target.key)
    current = layersOf(target, pristine)
    if (current.some((layer) => isStyleValue('theme', layer) && layer[theme] !== undefined)) return true
  }
}


/**
 * Follow an alias value to the value of the token it references.
 *
 * Only a value that is exactly one `var(--np--…)` reference to a registered
 * token is followed, repeatedly, until it reaches a value that is not such a
 * reference. Anything else — `calc()`, `max()`, several vars, a var with a
 * fallback, a reference to an unregistered name — is an expression the browser
 * evaluates, so it is returned unchanged. Each hop is read with the caller's
 * theme, breakpoint, and pristine flag, matching how the CSS alias resolves
 * inside the same pin.
 *
 * @param value - Resolved value of the requested token
 * @param startKey - Registry key of the requested token, the first cycle guard entry
 * @param label - Token label, for the message
 * @param theme - Theme to read at each hop, if pinned
 * @param breakpoint - Breakpoint to resolve at at each hop, if pinned
 * @param pristine - Read the seed layer only at each hop
 * @returns The first value in the chain that is not a single registered reference
 * @throws when the chain returns to a token already visited, or a hop has no value for the pin
 */
function followReferences(
  value: string,
  startKey: string,
  label: string,
  theme: string | undefined,
  breakpoint: string | undefined,
  pristine: boolean
): string {
  const visited = new Set([startKey])
  let current = value
  for (;;) {
    const match = SINGLE_REFERENCE.exec(current.trim())
    if (!match) return current
    const refKey = match[1]
    const refEntry = registry.get(refKey)
    // An unregistered name has no value to follow; the var() is the answer
    if (!refEntry) return current
    if (visited.has(refKey)) {
      throw new Error(`getToken: "${label}" has a circular reference through ${refKey}`)
    }
    visited.add(refKey)
    current = resolveValue(layersOf(refEntry, pristine), refKey, theme, breakpoint)
  }
}

/**
 * @param name - Group name, or a group path for nested component groups
 * @param variant - Variant name; `base` is the unsuffixed default
 * @param options - See `TokenOptions`
 * @returns `var(--np--…)`, the bare variable name, or the raw value, per `options.as`
 * @throws on a theme and breakpoint pinned together, an unknown breakpoint name,
 *   a theme the token has no value for, a breakpoint pin without a generated
 *   primitive (`var` / `key`), or an unregistered token / missing value (`value`)
 */
export function getToken(address: TokenAddress, options?: TokenOptions): string
export function getToken<G extends TokenGroup>(
  name: G,
  ...args: 'base' extends TokenVariants[G]
    ? [variant?: TokenVariants[G], options?: TokenOptions]
    : [variant: TokenVariants[G], options?: TokenOptions]
): string
export function getToken(name: string[], variant?: string, options?: TokenOptions): string
export function getToken(
  name: string | string[],
  variantOrOptions: string | TokenOptions = 'base',
  maybeOptions: TokenOptions = {}
): string {
  // The second argument is the variant (older form) or the options object, since
  // an address carries its own variant (`"fontSize:large"`)
  const variant = typeof variantOrOptions === 'string' ? variantOrOptions : 'base'
  const options = typeof variantOrOptions === 'string' ? maybeOptions : variantOrOptions
  const { theme, breakpoint, inverse = false, effect: optionEffect, transform, pristine = false, as = 'var' } = options
  // The namespace lives in the address (`"button.icon.size:small"`), never in the options
  const { prefix, path, variant: nameVariant, effect: nameEffect } = parseTokenName(name)
  const variantName = nameVariant ?? variant
  // Rebuilt for the key calls below, since only the address carries the namespace
  const address = prefix ? `${prefix}.${path.join('.')}` : path.join('.')
  const effect = nameEffect ?? optionEffect ?? (inverse ? 'inverse' : undefined)
  const label = describe(path, variantName, prefix)

  // Validate options before touching the registry — a primitive has one suffix only
  if (theme !== undefined && breakpoint !== undefined) {
    throw new Error(`getToken: "${label}" cannot pin both a theme and a breakpoint`)
  }
  if (breakpoint !== undefined) assertBreakpointName(breakpoint)
  if (transform !== undefined) {
    // A transformed color is an expression, not a declared variable
    if (as === 'key') {
      throw new Error(`getToken: "${label}" cannot return a key with a transform — a transformed color has no variable name`)
    }
  }

  // The entry is keyed by the semantic name; the returned key carries the pin suffix
  const entryKey = getConstantKey(address, variantName, { effect })
  const key = getConstantKey(address, variantName, { effect, theme, breakpoint })
  const entry = registry.get(entryKey)

  // The `var` form, with the transform wrapping the reference when one is given
  const varForm = (): string => (transform ? relativeColor(`var(${key})`, transform) : `var(${key})`)

  // Unregistered: names are still computable, values are not
  if (!entry) {
    if (as === 'value') {
      throw new Error(formatError('tokenNotFound', { tokenName: label, prefix: prefix ?? 'core', available: '' }))
    }
    checkRegisteredLater(entryKey)
    return as === 'key' ? key : varForm()
  }

  // Registered: validate pins against the stored values, then return the requested form
  const layers = layersOf(entry, pristine)
  // A value read follows an alias into the token it references, so an alias passes when its
  // target has the theme; var/key forms need the token's own primitive and are checked as-is
  if (theme !== undefined && !(as === 'value' && aliasHasTheme(layers, theme, pristine))) {
    assertTheme(layers, theme, path, variantName, prefix)
  }
  if (as === 'value') {
    // An alias value (`var(--np--gap--small)`) reads through to the referenced token's value
    const resolved = followReferences(resolveValue(layers, label, theme, breakpoint), entryKey, label, theme, breakpoint, pristine)
    // The computed counterpart of the expression: same channel vocabulary, clamped
    return transform ? applyChannels(resolved, transform, key) : resolved
  }
  // A value read can resolve any breakpoint; a var/key pin needs a real primitive
  if (breakpoint !== undefined) assertBreakpointPrimitive(entry, breakpoint, label)
  return as === 'key' ? key : varForm()
}
