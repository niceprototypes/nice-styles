/**
 * Adjust the HSLA channels of a design token and return the resulting color.
 *
 * Reads the token's raw `hsla(…)` value from the runtime registry — resolving
 * the requested `theme` to the correct mode primitive (e.g. the `night`
 * value of `--np--border-color--dark--night`) rather than the day default —
 * then adds each entry of `values` to the matching channel.
 *
 * `values` adjusts channels in HSLA order `[hue, saturation, lightness, alpha]`.
 * Each entry is an absolute replacement (a `number`, e.g. `200`), a relative
 * signed adjustment (`"+30"` / `"-30"`), or a ratio (`"*0.55"`, scaling the
 * channel). Omit an entry (or pass `null`) to leave that channel untouched.
 * Missing trailing entries are left untouched. The same vocabulary drives
 * `getToken`'s `transform` option, which shares this channel math.
 *
 * Any channel that lands outside its legal range is clamped to the nearer
 * bound and a `console.warn` is emitted naming the channel and the token.
 *
 * | Channel | Index | Range |
 * |---------|-------|-------|
 * | hue | 0 | 0–360 |
 * | saturation | 1 | 0–100 |
 * | lightness | 2 | 0–100 |
 * | alpha | 3 | 0–1 |
 *
 * `module` is positional; `token`, `theme`, and `values` go in the options object.
 *
 * Note: returns a **static** color string (a literal `hsla(…)`, not a `var()`),
 * so it does NOT flip with the `[data-theme]` cascade. For a theme-flipping color
 * with a custom alpha, keep the token `var()` and use CSS relative-color syntax,
 * e.g. `hsl(from ${getToken("backgroundColor")} h s l / 0.98)`.
 *
 * @example
 * // --np--border-color--dark--night is hsla(240, 5%, 50%, 1)
 * transformColor("borderColor", { token: "dark", theme: "night", values: ["+0", "+10", "+0", "-0.15"] })
 * // → "hsla(240, 15%, 50%, 0.85)"   (relative: signed strings add/subtract)
 * transformColor("borderColor", { token: "dark", theme: "night", values: [200] })
 * // → "hsla(200, 5%, 50%, 1)"       (absolute: a bare number replaces the channel)
 *
 * @throws if the module or token is unknown, if the requested theme has no
 * override, if the resolved token is not an hsl/hsla color, or if an adjustment
 * is neither a signed magnitude nor a ratio.
 */

import { getToken } from './getToken.js'
import { applyChannels } from '../utilities/css/relativeColor.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'

export interface TransformColorOptions {
  /** Variant within the module, e.g. `"dark"`. Defaults to `"base"`. */
  token?: string
  /** Theme to read the color from, e.g. `"night"`. Defaults to the default theme (`"day"`). */
  theme?: string
  /**
   * Per-channel adjustments in HSLA order `[hue, saturation, lightness, alpha]`.
   * A `number` replaces the channel (absolute); `"+30"` / `"-30"` adds or
   * subtracts; `"*0.55"` scales. Omit an entry (or pass `null`) to leave that
   * channel untouched.
   */
  values?: readonly (number | string | null | undefined)[]
}

export function transformColor(module: string, { token = 'base', theme, values = [] }: TransformColorOptions = {}): string {
  // Resolve the raw color through the single getter. The default theme is the
  // unpinned read (valid for themed and non-themed tokens alike); any other
  // theme must exist on the token or getToken throws.
  const pinned = theme === DEFAULT_THEME ? undefined : theme
  const raw = getToken(module, token, { theme: pinned, as: 'value' })

  // The CSS variable name this token resolves to — makes clamp warnings actionable.
  const tokenKey = getToken(module, token, { theme: pinned, as: 'key' })

  // Channel math is shared with `getToken`'s `transform`, so both accept one vocabulary.
  return applyChannels(raw, values, tokenKey)
}
