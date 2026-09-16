/**
 * Relative-color expression builder.
 *
 * Turns a token reference plus per-channel adjustments into CSS relative color
 * syntax: `hsl(from var(--np--color) h s calc(l * 0.55))`. The token stays a
 * `var()`, so the result still follows the `[data-theme]` and breakpoint
 * cascades — unlike `transformColor`, which computes a static `hsla()`.
 *
 * Used by `getToken`'s `transform` option.
 *
 * ## Channel values
 * Adjustments are given in HSLA order `[hue, saturation, lightness, alpha]`,
 * the same vocabulary `transformColor` accepts, plus ratios:
 *
 * | Entry | Meaning | Emits |
 * |---|---|---|
 * | `null` / omitted / `"+0"` / `"*1"` | unchanged | `h` |
 * | `200` | absolute replacement | `200` |
 * | `"+30"` / `"-30"` | add / subtract | `calc(h + 30)` |
 * | `"*0.55"` | scale | `calc(l * 0.55)` |
 *
 * Prefer ratios over offsets for anything that must survive both themes: an
 * offset sized for a light value leaves the gamut on its dark counterpart
 * (a `l: 22%` night color minus 25 is below black). The browser clamps at
 * paint, so the result saturates rather than failing — there is no clamp
 * warning here, unlike the numeric path in `transformColor`.
 *
 * Percent units are not valid inside `from`: channels are numbers, so
 * `calc(l - 25%)` is invalid and drops the whole declaration.
 *
 * @example
 * relativeColor("var(--np--color--highlight)", ["*1", "*1", "*0.55", "*1"])
 * // "hsl(from var(--np--color--highlight) h s calc(l * 0.55))"
 */

/** Channel keywords in HSLA order, as relative color syntax names them. */
const CHANNEL_KEYWORDS = ['h', 's', 'l', 'alpha'] as const

/** A signed magnitude (`"+30"`, `"-0.2"`) or a ratio (`"*0.55"`). */
const ADJUSTMENT = /^([+\-*])(\d*\.?\d+)$/

/** One channel's adjustment, as accepted by `transformColor` and `getToken`'s `transform`. */
export type ChannelValue = number | string | null | undefined

/**
 * The expression for one channel.
 *
 * @param keyword - Channel keyword (`h`, `s`, `l`, `alpha`)
 * @param value - Adjustment for that channel
 * @returns The bare keyword when unchanged, a literal for an absolute value, else a `calc()`
 * @throws when a string entry is neither a signed magnitude nor a ratio
 */
export function channelExpression(keyword: string, value: ChannelValue): string {
  if (value === null || value === undefined) return keyword
  // A bare number replaces the channel outright
  if (typeof value === 'number') return String(value)

  const match = ADJUSTMENT.exec(value.trim())
  if (!match) {
    throw new Error(`relativeColor: ${keyword} adjustment "${value}" must be a signed magnitude ("+30", "-30") or a ratio ("*0.55")`)
  }

  const [, operator, magnitude] = match
  const amount = Number(magnitude)
  // Identity adjustments add nothing to the expression
  if (operator === '*' ? amount === 1 : amount === 0) return keyword
  return `calc(${keyword} ${operator} ${magnitude})`
}

/**
 * Build the relative-color expression for a token reference.
 *
 * @param reference - The token's `var(--np--…)` reference
 * @param values - Per-channel adjustments in HSLA order; missing entries are unchanged
 * @returns `hsl(from {reference} …)`, with the alpha clause omitted when alpha is unchanged
 */
export function relativeColor(reference: string, values: readonly ChannelValue[] = []): string {
  const [hue, saturation, lightness, alpha] = CHANNEL_KEYWORDS.map((keyword, index) =>
    channelExpression(keyword, values[index])
  )
  // `/ alpha` would be a no-op, so an unchanged alpha is left off entirely
  const alphaClause = alpha === 'alpha' ? '' : ` / ${alpha}`
  return `hsl(from ${reference} ${hue} ${saturation} ${lightness}${alphaClause})`
}

/** Channel metadata in HSLA order — drives the numeric path's clamping and warnings. */
const CHANNELS = [
  { name: 'hue', min: 0, max: 360 },
  { name: 'saturation', min: 0, max: 100 },
  { name: 'lightness', min: 0, max: 100 },
  { name: 'alpha', min: 0, max: 1 },
] as const

/** Captures the four channels of an `hsl()` / `hsla()` string, tolerating spacing and `%`. */
const HSLA_PATTERN = /^hsla?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)%?\s*,\s*(-?[\d.]+)%?\s*,\s*(-?[\d.]+)\s*\)$/i

/** Trim binary-float artifacts (e.g. 0.8500000001) without forcing integers. */
function round(value: number): number {
  return Math.round(value * 1e4) / 1e4
}

/**
 * One channel's computed value — the numeric counterpart of `channelExpression`.
 *
 * @param keyword - Channel name, for the error message
 * @param current - The channel's value in the source color
 * @param value - Adjustment for that channel
 * @returns The adjusted number, before clamping
 * @throws when a string entry is neither a signed magnitude nor a ratio
 */
function channelNumber(keyword: string, current: number, value: ChannelValue): number {
  if (value === null || value === undefined) return current
  if (typeof value === 'number') return value

  const match = ADJUSTMENT.exec(value.trim())
  if (!match) {
    throw new Error(`relativeColor: ${keyword} adjustment "${value}" must be a signed magnitude ("+30", "-30") or a ratio ("*0.55")`)
  }

  const [, operator, magnitude] = match
  const amount = Number(magnitude)
  if (operator === '+') return current + amount
  if (operator === '-') return current - amount
  return current * amount
}

/**
 * Apply channel adjustments to a literal color, returning a static `hsla()`.
 *
 * The computed counterpart of `relativeColor`: same vocabulary, but resolved in
 * JS, so the result no longer follows the theme cascade. Out-of-range channels
 * are clamped with a warning — the CSS expression cannot do this, since the
 * browser saturates at paint instead.
 *
 * @param color - Source color as `hsl()` / `hsla()`
 * @param values - Per-channel adjustments in HSLA order
 * @param label - Token name or variable, for clamp warnings
 * @returns `hsla(H, S%, L%, A)`
 * @throws when `color` is not an hsl/hsla string, or an adjustment is malformed
 */
export function applyChannels(color: string, values: readonly ChannelValue[] = [], label = 'color'): string {
  const match = HSLA_PATTERN.exec(color.trim())
  if (!match) {
    throw new Error(`relativeColor: "${label}" is not an hsl/hsla color: "${color}"`)
  }
  const parsed = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]

  const adjusted = CHANNELS.map((channel, index) => {
    const next = round(channelNumber(channel.name, parsed[index], values[index]))

    // Below floor — clamp up to the minimum.
    if (next < channel.min) {
      console.warn(`transformColor: ${channel.name} ${next} is below ${channel.min} for ${label}; clamped to ${channel.min}`)
      return channel.min
    }
    // Above ceiling — clamp down to the maximum.
    if (next > channel.max) {
      console.warn(`transformColor: ${channel.name} ${next} exceeds ${channel.max} for ${label}; clamped to ${channel.max}`)
      return channel.max
    }
    return next
  })

  return `hsla(${adjusted[0]}, ${adjusted[1]}%, ${adjusted[2]}%, ${adjusted[3]})`
}
