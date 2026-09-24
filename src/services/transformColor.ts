/**
 * Adjust the HSLA channels of a design token and return the resulting color as
 * CSS relative color syntax over the token's variable:
 * `hsl(from var(--np--color--error) h calc(s - 20) calc(l + 20) / calc(alpha - 0.2))`.
 *
 * The token stays a `var()`, so the result keeps following the `[data-theme]`
 * and breakpoint cascades. Pass `theme` to pin the read to that mode's variable
 * (e.g. `var(--np--color--error--night)`) instead.
 *
 * `values` adjusts channels in HSLA order `[hue, saturation, lightness, alpha]`.
 * Each entry is an absolute replacement (a `number`, e.g. `200`), a relative
 * signed adjustment (`"+30"` / `"-30"`), or a ratio (`"*0.55"`, scaling the
 * channel). Omit an entry (or pass `null`) to leave that channel untouched.
 * Missing trailing entries are left untouched. This is `getToken`'s `transform`
 * option, with the module/token/theme addressing kept for existing callers.
 *
 * | Channel | Index | Range |
 * |---------|-------|-------|
 * | hue | 0 | 0–360 |
 * | saturation | 1 | 0–100 |
 * | lightness | 2 | 0–100 |
 * | alpha | 3 | 0–1 |
 *
 * A channel pushed outside its range is clamped by the browser at paint; there
 * is no JS-side clamp or warning, since the value is not known until the cascade
 * resolves. Prefer ratios over offsets for anything that must survive both
 * themes. For the computed literal (a non-CSS consumer), use
 * `getToken(group, variant, { transform, as: "value" })`.
 *
 * `module` is positional; `token`, `theme`, and `values` go in the options object.
 *
 * @example
 * transformColor("color", { token: "error", values: ["+0", "-20", "+20", "-0.2"] })
 * // → "hsl(from var(--np--color--error) h calc(s - 20) calc(l + 20) / calc(alpha - 0.2))"
 * transformColor("color", { token: "error", theme: "night", values: [200] })
 * // → "hsl(from var(--np--color--error--night) 200 s l)"
 *
 * @throws if the module or token is unknown, if the requested theme has no
 * override, or if an adjustment is neither a number, a signed magnitude, nor a
 * ratio.
 */

import { getToken } from './getToken.js'
import type { TokenGroup, TokenVariants } from '../generated/types.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'

export interface TransformColorOptions {
  /** Variant within the module, e.g. `"dark"`. Defaults to `"base"`. */
  token?: string
  /** Theme to pin the read to, e.g. `"night"`. Defaults to the unpinned variable, which follows the theme cascade. */
  theme?: string
  /** Read the inverse-colour dimension (`--np--color--inverse`) instead of the base one. */
  inverse?: boolean
  /**
   * Per-channel adjustments in HSLA order `[hue, saturation, lightness, alpha]`.
   * A `number` replaces the channel (absolute); `"+30"` / `"-30"` adds or
   * subtracts; `"*0.55"` scales. Omit an entry (or pass `null`) to leave that
   * channel untouched.
   */
  values?: readonly (number | string | null | undefined)[]
}

export function transformColor(module: string, { token = 'base', theme, inverse = false, values = [] }: TransformColorOptions = {}): string {
  // The default theme is the unpinned read (valid for themed and non-themed
  // tokens alike); any other theme must exist on the token or getToken throws.
  const pinned = theme === DEFAULT_THEME ? undefined : theme
  // `module` / `token` are runtime strings, so the group and variant are asserted rather than checked
  const group = module as TokenGroup
  const variant = token as TokenVariants[TokenGroup]

  // Resolve the value once so an unknown module, token or theme throws here —
  // the var form alone only warns.
  getToken(group, variant, { theme: pinned, inverse, as: 'value' })

  return getToken(group, variant, { theme: pinned, inverse, transform: values })
}
