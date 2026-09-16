import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Universal namespace prefix for all Nice Prototypes CSS custom properties
 */
export const NAMESPACE = "np"

/**
 * Options for getConstant / getConstantKey
 */
export interface CssConstantOptions {
  /** Theme suffix (e.g., "day", "night"). Appends --{theme} to the key. */
  theme?: string
  /** Responsive breakpoint suffix (e.g., "small", "large"). Appends --{breakpoint} to the key. Mutually exclusive with theme — breakpoint takes precedence when both are provided. */
  breakpoint?: string
  /** Inverse-color flag. Appends a separate `--inverse` segment last (after any theme/breakpoint), e.g. `--np--color--night--inverse`. */
  inverse?: boolean
  /** Color-system effect appended as the last segment (`inverse`). Set by the address's second colon; `inverse: true` is shorthand for `"inverse"`. */
  effect?: string
}

/** A token address split into its parts. */
export interface ParsedTokenName {
  /** Namespace named by the first dotted segment (`"button.size:small"`), or undefined for module tokens */
  prefix?: string
  /** Group path segments */
  path: string[]
  /** Variant named after the first colon, or undefined */
  variant?: string
  /** Color-system effect named after the second colon (`inverse`), or undefined */
  effect?: string
}

/**
 * Parse a token address.
 *
 * ```
 * address := [prefix "."] group ("." subgroup)* [":" variant [":" effect]]
 * ```
 *
 * Dots carry identity, colons carry the variant and then the effect:
 * - `"gap"` — module token, variant defaults to `base`.
 * - `"fontSize:large"` — module token, named variant.
 * - `"button.size:small"` — a dot before the colon means the first segment is the namespace.
 * - `"button.icon.size:small"` — namespace, then the nested group path.
 * - `"color:base:inverse"` — color-system effect as the last segment.
 *
 * An array is a path with no prefix, variant, or effect — the parsed form
 * computed callers pass directly. Group, variant, and effect names contain
 * neither a dot nor a colon, so every split is unambiguous.
 *
 * @param token - Token address, or a path array
 * @returns The address parts; absent parts are undefined
 */
export function parseTokenName(token: string | string[]): ParsedTokenName {
  if (Array.isArray(token)) return { path: token }
  const [identity, variant, effect] = token.split(':')
  const segments = identity.split('.')
  // A dotted identity names its namespace first; a bare one is a module token
  const prefixed = segments.length > 1
  return {
    prefix: prefixed ? segments[0] : undefined,
    path: prefixed ? segments.slice(1) : segments,
    variant: variant || undefined,
    effect: effect || undefined,
  }
}

/**
 * Builds the bare CSS variable name for a Nice token, following the pattern
 * `--np--{token}--{param}` for non-base tokens (`--np--{token}` when `param` is
 * the implicit `base` default) and `--np--{pkg}--{token}--{param}` for component
 * tokens, with optional `--{theme}` or `--{breakpoint}` suffix.
 *
 * Internal helper — both `getConstant` and `getConstantKey` build the same
 * key, they just differ in whether they wrap it in `var(...)`.
 */
function buildKey(
  token: string | string[],
  param: string,
  options?: CssConstantOptions
): string {
  const { theme, breakpoint, inverse, effect } = options ?? {}
  // The namespace comes from the address only; options carry no identity
  const { prefix: pkgName, path, variant: nameVariant, effect: nameEffect } = parseTokenName(token)
  const variantName = nameVariant ?? param
  const effectName = nameEffect ?? effect ?? (inverse ? 'inverse' : undefined)
  // Breakpoint takes precedence over theme — they are mutually exclusive suffixes
  const suffix = breakpoint ? `--${breakpoint}` : theme ? `--${theme}` : ''
  // The effect is a separate trailing segment, kept distinct from the theme.
  const effectSuffix = effectName ? `--${effectName}` : ''
  // A token is a group name or a nested group path (component trees, e.g.
  // ["icon", "size"]). `base` is the implicit default and carries no segment
  // anywhere in the name: `--np--color` for base, `--np--color--night` for
  // base+theme, `--np--button--icon--size` for ["icon", "size"] + base.
  const segments = [...path, variantName]
    .map(camelToKebab)
    .filter((segment) => segment !== '' && segment !== 'base')
  const namespace = pkgName ? `--${NAMESPACE}--${pkgName}` : `--${NAMESPACE}`
  return `${namespace}--${segments.join('--')}${suffix}${effectSuffix}`
}

/**
 * Returns the `var(--np--…)` reference string for a Nice token.
 *
 * Builds the name only — no registry lookup. To read a registered token, use
 * `getToken`; the bare key is the sibling `getConstantKey`.
 *
 * @example
 * // Base tokens (the `base` default is segment-less)
 * getConstant("color", "base")
 * // "var(--np--color)"
 *
 * @example
 * // Force day theme
 * getConstant("backgroundColor", "base", { theme: "day" })
 * // "var(--np--background-color--day)"
 *
 * @example
 * // Breakpoint primitive
 * getConstant("fontSize", "large", { breakpoint: "phone" })
 * // "var(--np--font-size--large--phone)"
 *
 * @example
 * // Component tokens
 * getConstant("button.height:small")
 * // "var(--np--button--height--small)"
 */
export function getConstant(token: string | string[], options?: CssConstantOptions): string
export function getConstant(token: string | string[], param?: string, options?: CssConstantOptions): string
export function getConstant(
  token: string | string[],
  paramOrOptions: string | CssConstantOptions = 'base',
  maybeOptions: CssConstantOptions = {}
): string {
  // Second argument is the variant (older form) or the options object (address form)
  const param = typeof paramOrOptions === 'string' ? paramOrOptions : 'base'
  const options = typeof paramOrOptions === 'string' ? maybeOptions : paramOrOptions
  return `var(${buildKey(token, param, options)})`
}

/**
 * Returns the bare CSS variable name (no `var(...)` wrapper) for a Nice token.
 *
 * Use this when declaring a custom property (left-hand side of a `:` in CSS)
 * or when composing a `var(...)` reference manually. For reading a token (the
 * common case), use `getConstant` instead.
 *
 * @example
 * getConstantKey("color", "base")
 * // "--np--color"
 *
 * @example
 * getConstantKey("fontSize", "large", { breakpoint: "phone" })
 * // "--np--font-size--large--phone"
 */
export function getConstantKey(token: string | string[], options?: CssConstantOptions): string
export function getConstantKey(token: string | string[], param?: string, options?: CssConstantOptions): string
export function getConstantKey(
  token: string | string[],
  paramOrOptions: string | CssConstantOptions = 'base',
  maybeOptions: CssConstantOptions = {}
): string {
  // Second argument is the variant (older form) or the options object (address form)
  const param = typeof paramOrOptions === 'string' ? paramOrOptions : 'base'
  const options = typeof paramOrOptions === 'string' ? maybeOptions : paramOrOptions
  return buildKey(token, param, options)
}