import type { ModeType } from '../modeTypes.js'

/**
 * Returns the opposite theme mode for components that need contrasting
 * foreground colors (e.g. light text on a dark primary button).
 *
 * Only inverts for "primary" status. Other statuses pass the mode
 * through unchanged, since their backgrounds don't require inversion.
 *
 * Defaults to "night" for primary when no mode is provided,
 * since "day" is the assumed default mode.
 *
 * @param mode - The current mode ("day" or "night"), or undefined
 * @param status - The visual status/variant (e.g. "primary", "secondary")
 * @returns The inverted mode for primary, the original mode otherwise
 */
export function getInvertedMode(mode?: ModeType, status?: string): ModeType | undefined {
  if (status !== "primary") return mode
  if (!mode) return "night"
  return mode === "day" ? "night" : "day"
}