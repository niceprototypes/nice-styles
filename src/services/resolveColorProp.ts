/**
 * Component colour-prop resolution.
 *
 * A component's colour prop is either a variant name (`"highlight"`) or an
 * object naming the same variant plus the effects `getToken` already supports.
 * This turns either form into the CSS string the component sets, so every
 * package shares one prop shape and one vocabulary instead of defining its own.
 *
 * ## Why an object
 * The string form cannot carry a transform's channel deltas, and a second prop
 * per effect (`colorTransform`, `colorTheme`, …) multiplies the surface. The
 * object mirrors `getToken`'s options exactly — nothing new to learn.
 *
 * @example
 * resolveColorProp("ink", "color", "highlight")
 * // "var(--np--ink--color--highlight)"
 *
 * @example
 * resolveColorProp("ink", "color", { name: "highlight", transform: [null, null, 40, null] })
 * // "hsl(from var(--np--ink--color--highlight) h s 40)"
 */

import { getToken } from './getToken.js'
import type { ChannelValue } from '../utilities/css/relativeColor.js'

export type { ChannelValue }

/** The object form of a colour prop: a variant plus the effects `getToken` accepts. */
export interface ColorPropObject<V extends string> {
  /** Variant within the component's colour group */
  name: V
  /** Pin this colour to a theme, regardless of the active one */
  theme?: string
  /** Pin this colour to a breakpoint primitive */
  breakpoint?: string
  /** Per-channel HSLA adjustments — returns relative color syntax, so the colour still follows the theme */
  transform?: readonly ChannelValue[]
}

/**
 * A colour prop: the variant name, or that name with effects.
 * The generic keeps each component's own variant union intact.
 */
export type ColorTokenProp<V extends string> = V | ColorPropObject<V>

/**
 * Resolve a colour prop to the CSS value the component should set.
 *
 * @param prefix - Component prefix (`"ink"`)
 * @param group - Colour group within that component (`"color"`, `"backgroundColor"`)
 * @param prop - Variant name, or `{ name, … }` with effects
 * @returns `var(--np--…)`, or a relative-color expression when a transform is given
 */
export function resolveColorProp<V extends string>(
  prefix: string,
  group: string,
  prop: ColorTokenProp<V>
): string {
  // The bare form is the common case: no effects, just the variant
  if (typeof prop === 'string') return getToken(`${prefix}.${group}:${prop}`)

  const { name, theme, breakpoint, transform } = prop
  return getToken(`${prefix}.${group}:${name}`, { theme, breakpoint, transform })
}
