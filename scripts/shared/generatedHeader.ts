/**
 * Generated-file header — the comment block at the top of every file the build writes.
 *
 * One format for generated CSS (`dist/breakpoints.css`, `dist/breakpoints.custom-media.css`)
 * and generated TypeScript (`src/generated/*.ts`). No timestamp, so regenerating
 * unchanged sources produces byte-identical files.
 *
 * @example
 * generatedHeader("src/tokens/breakpoints.json", ["Native breakpoint utility classes."])
 * // /**
 * //  * Auto-generated from src/tokens/breakpoints.json — do not edit by hand.
 * //  * Native breakpoint utility classes.
 * //  *\/
 */

/**
 * @param source - Source file or glob the output is generated from, relative to the package root
 * @param description - Lines after the first; `''` renders a bare ` *` spacer
 * @returns The comment block, ending in a newline
 */
export function generatedHeader(source: string, description: string[] = []): string {
  const lines = [`Auto-generated from ${source} — do not edit by hand.`, ...description]
  return ['/**', ...lines.map((line) => (line === '' ? ' *' : ` * ${line}`)), ' */', ''].join('\n')
}
