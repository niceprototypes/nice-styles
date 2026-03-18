import type { ModeType } from '../modeTypes.js'

/**
 * Returns the opposite theme mode.
 *
 * When called with just a mode, performs a direct inversion:
 *   "day" → "night", "night" → "day", undefined → "night"
 *
 * When called with a status, only inverts for statuses that require
 * contrasting foreground colors (e.g. "primary" buttons with dark
 * backgrounds need light text). Other statuses pass through unchanged.
 *
 * @param mode - The current mode ("day" or "night"), or undefined
 * @returns The inverted mode, or the original mode if status doesn't require inversion
 */

function invert(mode?: ModeType): ModeType {
  if (!mode) return "night"
  return mode === "day" ? "night" : "day"
}

export function getInvertedMode(mode?: ModeType, status?: string): ModeType | undefined {
  if (status === undefined) return invert(mode)
  return mode
}