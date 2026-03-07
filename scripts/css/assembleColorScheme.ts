/**
 * Color scheme CSS assembler.
 *
 * Builds dist/color-scheme.css — the opt-in automatic dark mode file.
 * Consumers import this alongside variables.css to enable auto dark mode.
 *
 * Contains:
 * - `:root { color-scheme: light dark; }` — tells the browser both schemes are supported
 * - `@media (prefers-color-scheme: dark)` — reassigns semantic variables to night primitives
 * - `[data-theme]` selectors — allow explicit override of the browser color scheme
 */

/**
 * Builds the color-scheme.css content from the collected night media body lines.
 * nightMediaBody is produced by buildCombinedCss and contains the reassignment
 * declarations for the @media block.
 */
export function buildColorSchemeCss(nightMediaBody: string[]): string {
  const lines: string[] = []

  // Declare support for both color schemes — enables browser-native dark mode awareness
  lines.push(':root {')
  lines.push('\tcolor-scheme: light dark;')
  lines.push('}')

  if (nightMediaBody.length > 0) {
    // Auto dark mode — reassigns semantic variables to night primitives when OS prefers dark
    lines.push('')
    lines.push('@media (prefers-color-scheme: dark) {')
    lines.push('\t:root {')
    lines.push(...nightMediaBody)
    lines.push('\t}')
    lines.push('}')

    // Manual overrides — data-theme attribute takes precedence over the media query
    lines.push('')
    lines.push('[data-theme="day"] { color-scheme: light; }')
    lines.push('[data-theme="dark"] { color-scheme: dark; }')
  }

  return lines.join('\n')
}
