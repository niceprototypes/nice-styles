import { getCoreToken } from './getCoreToken.js'
import type { FontSizeType } from '../generated/types.js'
import type { LineHeightType } from '../generated/types.js'

/**
 * Get a CSS calc expression for the height of a line of text
 *
 * Multiplies a font size token by a line height token to produce
 * the computed height of a single text line.
 *
 * @param fontSize - Font size token name (defaults to "base")
 * @param lineHeight - Line height token name (defaults to "base")
 * @returns Object with `var` containing the calc expression
 *
 * @example
 * getTextHeight("small", "base").var
 * // → "calc(var(--np--font-size--small) * var(--np--line-height--base))"
 */
const getTextHeight = (
  fontSize: FontSizeType = "base",
  lineHeight: LineHeightType = "base"
) => ({
  var: `calc(${getCoreToken("fontSize", fontSize).var} * ${getCoreToken("lineHeight", lineHeight).var})`,
})

export default getTextHeight