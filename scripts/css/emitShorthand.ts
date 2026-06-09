/**
 * Shorthand alias CSS emitter.
 *
 * `base` is the implicit default — the default variant of a module group, or
 * the default state of a component (e.g. `status.primary.base`). This emitter
 * produces `dist/shorthand.css`, declaring a `base`-less alias for every
 * variable carrying a `base` segment, pointing back at the full one. Two
 * classes, both uniform across modules and components:
 *
 * - **Midfix** — `base` sits before another segment; drop just that segment:
 *   ```css
 *   --np--color--night:                    var(--np--color--base--night);
 *   --np--button--status--primary--color:  var(--np--button--status--primary--base--color);
 *   ```
 * - **Terminal** — `base` is the last segment; drop it for the bare name:
 *   ```css
 *   --np--color:        var(--np--color--base);
 *   --np--gap:          var(--np--gap--base);
 *   --np--button--size: var(--np--button--size--base);
 *   ```
 *
 * Non-`base` variants/states (`--np--color--light`, `…--disabled--color`) are
 * untouched.
 */

/**
 * Extract the left-hand-side custom-property name from a CSS declaration line.
 * Returns null for blank lines, comments, or anything that isn't a `--np--…`
 * declaration (the emitted line arrays carry section headers and blanks).
 */
function extractName(line: string): string | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('--np--')) return null
  // LHS is everything before the first colon (the property separator — `--np--`
  // names contain no colon, so this is always the declaration's colon).
  const name = trimmed.slice(0, trimmed.indexOf(':')).trim()
  return name || null
}

/**
 * Build the shorthand alias name by dropping the single `base` segment. Every
 * Nice variable contains `base` at most once.
 * - Terminal: `--np--color--base` → `--np--color` (drop the trailing segment).
 * - Midfix:   `--np--color--base--night` → `--np--color--night` (drop just `base`).
 */
function toShorthand(fullName: string): string {
  if (fullName.endsWith('--base')) return fullName.slice(0, -'--base'.length)
  return fullName.replace('--base--', '--')
}

/**
 * Classify a variable name as a component token by its first segment after the
 * `np` namespace. `--np--button--…` → first segment `button`; if that segment
 * is a known component prefix it's a component, otherwise a module token group.
 */
function isComponent(name: string, componentPrefixes: ReadonlySet<string>): boolean {
  // split("--") on "--np--button--…" yields ["", "np", "button", …]; index 2 is
  // the first real segment (the group for modules, the prefix for components).
  const firstSegment = name.split('--')[2]
  return componentPrefixes.has(firstSegment)
}

/** Emit one alias declaration line: `\t{shorthand}: var({fullName});`. */
function aliasLine(fullName: string): string {
  return `\t${toShorthand(fullName)}: var(${fullName});`
}

/**
 * Generates `dist/shorthand.css` from the CSS declaration lines emitted into
 * `tokens.css`. Any name containing a `--base--` infix gets an alias; names
 * where `base` is terminal (`--np--color--base`) are left alone.
 *
 * Output is split into a module section (top) and a component section (bottom),
 * separated by section comments. Scope is decided by the caller via which
 * declaration lines it passes; the rule itself is name-shape only.
 *
 * @param declarationLines - Emitted declaration lines (`\t--np--…: …;`).
 * @param componentPrefixes - Known component prefixes (`button`, `icon`, …),
 *   used to sort aliases into the module vs component section.
 * @returns The full shorthand.css file contents.
 */
export function generateShorthandCss(
  declarationLines: string[],
  componentPrefixes: readonly string[]
): string {
  // Collect the unique set of base-carrying variable names: `--base--` infix
  // (base before another segment) or a terminal `--base` (the bare default).
  const fullNames = new Set<string>()
  for (const line of declarationLines) {
    const name = extractName(line)
    if (name && (name.includes('--base--') || name.endsWith('--base'))) fullNames.add(name)
  }

  const header = [
    '/* Shorthand aliases (generated — do not edit)',
    ' *',
    ' * Tokens (module or component) addressable without their `base` segment.',
    ' *   infix:   --np--color--night  -> var(--np--color--base--night)',
    ' *   terminal: --np--color        -> var(--np--color--base)',
    ' * Opt-in: import "nice-styles/shorthand.css".',
    ' */',
  ]

  // Partition into module vs component, each sorted by full name for stable,
  // diff-friendly output.
  const prefixSet = new Set(componentPrefixes)
  const sorted = [...fullNames].sort()
  const moduleNames = sorted.filter(n => !isComponent(n, prefixSet))
  const componentNames = sorted.filter(n => isComponent(n, prefixSet))

  const body: string[] = []
  // Modules on top.
  if (moduleNames.length > 0) {
    body.push('\t/* Modules */')
    body.push(...moduleNames.map(aliasLine))
  }
  // Components on the bottom, separated by a blank line + section comment.
  if (componentNames.length > 0) {
    if (body.length > 0) body.push('')
    body.push('\t/* Components */')
    body.push(...componentNames.map(aliasLine))
  }

  return [...header, ':root {', ...body, '}', ''].join('\n')
}
