/**
 * CSS block builders — the wrappers every token CSS section is emitted in.
 *
 * Shared by the build (`scripts/css/assembleCombined.ts` → `dist/tokens.css`)
 * and the runtime emitters (`generateTokenCSS`, `applyBreakpoints`), so generated
 * and runtime token CSS have the same shape: semantic vars in `:root`, stable
 * primitives, `@media` reassignments, and `[data-theme]` pins.
 *
 * ## Output
 * Every builder returns lines starting with a blank separator line, or an empty
 * array when the body is empty. Body lines carry their own indentation
 * (`declarations.ts`).
 *
 * @example
 * minWidthBlock(1280, ["\t\t--np--gap: var(--np--gap--laptop);"])
 * // ["", "@media (min-width: 1280px) {", "\t:root {", "\t\t--np--gap: var(--np--gap--laptop);", "\t}", "}"]
 */

/**
 * `{query} { :root { …body } }`.
 *
 * @param query - Full at-rule prelude, including `@media`
 * @param body - Depth-2 declaration lines
 */
export function mediaBlock(query: string, body: string[]): string[] {
  if (body.length === 0) return []
  return ['', `${query} {`, '\t:root {', ...body, '\t}', '}']
}

/**
 * `@media (min-width: {px}px) { :root { …body } }`.
 *
 * @param minWidth - Breakpoint floor in pixels
 * @param body - Depth-2 declaration lines
 */
export function minWidthBlock(minWidth: number, body: string[]): string[] {
  return mediaBlock(`@media (min-width: ${minWidth}px)`, body)
}

/**
 * `[data-theme="{theme}"] { …body }` — pin for a named theme.
 *
 * @param theme - Theme name the pin matches
 * @param body - Declaration lines (depth 1 for extra-theme pins)
 */
export function pinBlock(theme: string, body: string[]): string[] {
  if (body.length === 0) return []
  return ['', `[data-theme="${theme}"] {`, ...body, '}']
}

/**
 * Day/night theme switching: the OS-preference `@media (prefers-color-scheme: dark)`
 * block, then the `[data-theme="day"]` and `[data-theme="night"]` pins.
 *
 * The pins come after the media block and have the same specificity as its
 * `:root` rule, so a pin wins by source order regardless of the OS preference.
 * The pin bodies reuse the depth-2 media lines (the generated CSS has always
 * indented them that way).
 *
 * @param nightBody - Reassignments of semantic vars to their `--night` primitives
 * @param dayBody - The matching reassignments to their `--day` primitives
 */
export function themeBlocks(nightBody: string[], dayBody: string[]): string[] {
  if (nightBody.length === 0) return []
  return [
    ...mediaBlock('@media (prefers-color-scheme: dark)', nightBody),
    '',
    '[data-theme="day"] {',
    '\tcolor-scheme: light;',
    ...dayBody,
    '}',
    '',
    '[data-theme="night"] {',
    '\tcolor-scheme: dark;',
    ...nightBody,
    '}',
  ]
}
