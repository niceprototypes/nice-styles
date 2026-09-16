/**
 * CSS declaration line builders — one builder per line shape in token CSS.
 *
 * Every emitter in `src/utilities/css/` and the runtime `generateTokenCSS` build
 * their lines here, so generated and runtime CSS stay character-identical.
 *
 * ## Indentation
 * Lines carry their own tab indentation; the block wrappers in `blocks.ts` add
 * none. Depth 1 sits directly inside `:root { }` or a `[data-theme]` pin; depth 2
 * sits inside `@media { :root { } }`.
 *
 * @example
 * declarationLine("--np--gap", "16px")                        // "\t--np--gap: 16px;"
 * reassignmentLine("--np--color", "--np--color--night")       // "\t\t--np--color: var(--np--color--night);"
 * reassignmentLine("--np--color", "--np--color--sepia", 1)    // "\t--np--color: var(--np--color--sepia);"
 */

/**
 * A custom property declaration: `{tabs}{key}: {value};`.
 *
 * @param key - Custom property name (e.g. `--np--gap`)
 * @param value - Declared value
 * @param depth - Tab depth; 1 for `:root` and pins (default), 2 inside `@media`
 */
export function declarationLine(key: string, value: string | number, depth = 1): string {
  return `${'\t'.repeat(depth)}${key}: ${value};`
}

/**
 * A reassignment of one custom property to another: `{tabs}{key}: var({target});`.
 * Used to point a semantic variable at a theme or breakpoint primitive.
 *
 * @param key - The semantic variable being reassigned
 * @param target - The primitive it now reads from
 * @param depth - Tab depth; 2 inside `@media` and day/night pins (default), 1 in extra-theme pins
 */
export function reassignmentLine(key: string, target: string, depth = 2): string {
  return declarationLine(key, `var(${target})`, depth)
}
