/**
 * Shared CSS block builders for token emission.
 *
 * Used by both the build-time generator (`scripts/css/*` → `dist/tokens.css`)
 * and the runtime emitters (`generateTokenCSS`, `applyBreakpoints`), so generated
 * and runtime token CSS have the same shape: semantic vars in `:root`, stable
 * primitives, `@media` reassignments, and `[data-theme]` pins.
 *
 * Every builder returns an array of lines starting with a blank separator line,
 * or an empty array when there is nothing to emit.
 */

/** `{query} { :root { …body } }` — body lines carry their own indentation. */
export function mediaBlock(query: string, body: string[]): string[] {
  if (body.length === 0) return []
  return ['', `${query} {`, '\t:root {', ...body, '\t}', '}']
}

/** `@media (min-width: {px}px) { :root { …body } }`. */
export function minWidthBlock(minWidth: number, body: string[]): string[] {
  return mediaBlock(`@media (min-width: ${minWidth}px)`, body)
}

/** `[data-theme="{theme}"] { …body }` — pin for a named theme. */
export function pinBlock(theme: string, body: string[]): string[] {
  if (body.length === 0) return []
  return ['', `[data-theme="${theme}"] {`, ...body, '}']
}

/**
 * Day/night theme switching: the OS-preference `@media (prefers-color-scheme: dark)`
 * block plus the `[data-theme="day"]` / `[data-theme="night"]` pins.
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
