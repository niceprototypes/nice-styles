/**
 * Adjust the HSLA channels of a design token and return the resulting color.
 *
 * Reads the token's raw `hsla(…)` value from the runtime registry — resolving
 * the requested `theme` to the correct mode primitive (e.g. the `night`
 * value of `--np--border-color--dark--night`) rather than the day default —
 * then adds each entry of `values` to the matching channel.
 *
 * `values` adjusts channels in HSLA order `[hue, saturation, lightness, alpha]`.
 * Each entry is either an absolute replacement (a `number`, e.g. `200`) or a
 * relative, signed adjustment (a `string` like `"+30"` / `"-30"`, added to /
 * subtracted from the channel). Omit an entry (or pass `null`) to leave that
 * channel untouched. Missing trailing entries are left untouched.
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
 * @example
 * // --np--border-color--dark--night is hsla(240, 5%, 50%, 1)
 * getHSLA({ module: "borderColor", token: "dark", theme: "night", values: ["+0", "+10", "+0", "-0.15"] })
 * // → "hsla(240, 15%, 50%, 0.85)"   (relative: signed strings add/subtract)
 * getHSLA({ module: "borderColor", token: "dark", theme: "night", values: [200] })
 * // → "hsla(200, 5%, 50%, 1)"       (absolute: a bare number replaces the channel)
 *
 * @throws if the module or token is unknown, if the requested theme has no
 * override, or if the resolved token is not an hsl/hsla color.
 */

import { registry } from '../registry/index.js'
import { getTokenKey } from './getToken.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'
import { formatError } from '../utilities/formatError.js'

export interface GetHSLAOptions {
  /** Token group / module name, e.g. `"borderColor"`. */
  module: string
  /** Variant within the module, e.g. `"dark"`. Defaults to `"base"`. */
  token?: string
  /** Theme mode to read the value from, e.g. `"night"`. Defaults to the day base. */
  theme?: string
  /**
   * Per-channel adjustments in HSLA order `[hue, saturation, lightness, alpha]`.
   * A `number` replaces the channel (absolute); a signed `string` like `"+30"`
   * or `"-30"` adds/subtracts (relative). Omit an entry (or pass `null`) to
   * leave that channel untouched.
   */
  values?: readonly (number | string | null | undefined)[]
}

/** Channel metadata in HSLA order — drives delta application, clamping, and warnings. */
const CHANNELS = [
  { name: 'hue', min: 0, max: 360 },
  { name: 'saturation', min: 0, max: 100 },
  { name: 'lightness', min: 0, max: 100 },
  { name: 'alpha', min: 0, max: 1 },
] as const

/** Captures the four channels of an `hsl()` / `hsla()` string, tolerating spacing and `%`. */
const HSLA_PATTERN = /^hsla?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)%?\s*,\s*(-?[\d.]+)%?\s*,\s*(-?[\d.]+)\s*\)$/i

/** Trim binary-float artifacts (e.g. 0.8500000001) without forcing integers. */
function round(n: number): number {
  return Math.round(n * 1e4) / 1e4
}

/** A signed magnitude: a leading `+`/`-` then a number, e.g. `"+30"`, `"-0.2"`. */
const SIGNED_MAGNITUDE = /^([+-])(\d*\.?\d+)$/

/**
 * Resolve one channel's target value from its `values` entry:
 * - `number` → absolute replacement
 * - signed string (`"+30"` / `"-30"`) → relative add/subtract from `current`
 * - `null` / `undefined` (omitted) → `current`, unchanged
 *
 * @throws if a string entry is not a signed magnitude.
 */
function applyChannelValue(
  channel: string,
  current: number,
  value: number | string | null | undefined
): number {
  if (value === null || value === undefined) return current
  if (typeof value === 'number') return value
  const match = SIGNED_MAGNITUDE.exec(value.trim())
  if (!match) {
    throw new Error(`getHSLA: ${channel} adjustment "${value}" must be a signed magnitude like "+30" or "-30"`)
  }
  const magnitude = Number(match[2])
  return current + (match[1] === '-' ? -magnitude : magnitude)
}

export function getHSLA({ module, token = 'base', theme, values = [] }: GetHSLAOptions): string {
  // Resolve the module (token group) from the registry.
  const entry = registry.get(module)
  if (!entry) {
    throw new Error(
      formatError('tokenNotFound', {
        tokenName: module,
        prefix: 'core',
        available: [...registry.keys()].join(', '),
      })
    )
  }

  // Resolve the requested variant within the module.
  const variantValue = entry.variants[token]
  if (variantValue === undefined) {
    throw new Error(
      formatError('variantNotFound', {
        variantName: token,
        tokenName: module,
        prefix: 'core',
        available: Object.keys(entry.variants).join(', '),
      })
    )
  }

  // Fold the variant down to the raw color string for the requested theme.
  let raw: string
  if (isStyleValue('theme', variantValue)) {
    // Themed token — stores a { day, night, … } object; pick the requested mode.
    const requested = theme ?? DEFAULT_THEME
    const themed = (variantValue as Record<string, string>)[requested]
    if (themed === undefined) {
      throw new Error(formatError('modeNotFound', { mode: requested, tokenName: module, variantName: token }))
    }
    raw = themed
  } else if (typeof variantValue === 'string') {
    // Non-themed token — a non-default theme arg has no primitive to resolve against.
    if (theme !== undefined && theme !== DEFAULT_THEME) {
      throw new Error(formatError('modeNotFound', { mode: theme, tokenName: module, variantName: token }))
    }
    raw = variantValue
  } else {
    // Breakpoint-dimensioned or numeric value — not a color token.
    throw new Error(`getHSLA: token "${module}.${token}" is not a color value (got ${JSON.stringify(variantValue)})`)
  }

  // Parse the four channels out of the hsla() string.
  const match = HSLA_PATTERN.exec(raw.trim())
  if (!match) {
    throw new Error(`getHSLA: token "${module}.${token}"${theme ? ` (${theme})` : ''} is not an hsl/hsla color: "${raw}"`)
  }
  const parsed = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]

  // The CSS variable name this token resolves to — used to make clamp warnings actionable.
  const tokenKey = getTokenKey(module, { variant: token, theme })

  // Resolve each channel's target (number replaces, signed string adjusts,
  // omitted leaves untouched), then clamp to the channel's range, warning on clamp.
  const adjusted = CHANNELS.map((channel, i) => {
    const next = round(applyChannelValue(channel.name, parsed[i], values[i]))

    // Below floor — clamp up to the minimum.
    if (next < channel.min) {
      console.warn(`getHSLA: ${channel.name} ${next} is below ${channel.min} for ${tokenKey}; clamped to ${channel.min}`)
      return channel.min
    }
    // Above ceiling — clamp down to the maximum.
    if (next > channel.max) {
      console.warn(`getHSLA: ${channel.name} ${next} exceeds ${channel.max} for ${tokenKey}; clamped to ${channel.max}`)
      return channel.max
    }
    return next
  })

  // Re-emit in the source `hsla(H, S%, L%, A)` format.
  return `hsla(${adjusted[0]}, ${adjusted[1]}%, ${adjusted[2]}%, ${adjusted[3]})`
}