/**
 * Extracts numeric value and unit from a CSS value string.
 *
 * `"16px"` → `[16, "px"]`, `"1.5"` → `[1.5, ""]`, `"-4em"` → `[-4, "em"]`.
 *
 * Throws when the input is not parseable — derived expressions can only
 * compose values that have a numeric prefix.
 */
export function parseValue(value: string): [number, string] {
  const match = value.match(/^(-?[\d.]+)\s*(.*)$/)
  if (!match) {
    throw new Error(`Cannot parse numeric value from "${value}"`)
  }
  return [parseFloat(match[1]), match[2]]
}
