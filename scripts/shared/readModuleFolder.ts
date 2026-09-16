/**
 * Module token-folder reader.
 *
 * `src/tokens/modules/` holds one JSON file per token group — the same
 * one-file-per-prefix philosophy used by `tokens/components/`. Each file's stem
 * is the group name (`color.json` → `color`); its top-level keys are that
 * group's base variants, with reserved `$breakpoints` (breakpoint → variants),
 * `$themes` (theme → variants), and `$inverse` keys holding overrides scoped to
 * the group.
 *
 * This reader globs those files and reassembles one combined object: base
 * groups at the top level, plus cross-group `$breakpoints` and `$themes`
 * sections (re-keyed axis first) and `$inverse` (keyed by group).
 * `readModules` in `readTokenSources.ts` splits that object into the source
 * model. Adding a token group = drop a file, no script edits.
 *
 * @example
 * // modules/fontSize.json: { "$breakpoints": { "laptop": { "large": "24px" } } }
 * // → { $breakpoints: { laptop: { fontSize: { large: "24px" } } } }
 */

import * as fs from 'fs'
import * as path from 'path'

/** One group's variants: `{ variant: value }`. Values stay unchecked here. */
type Variants = Record<string, unknown>

/** A single `module/{group}.json` file: base variants + optional overrides. */
interface GroupFile {
  /** Variant overrides keyed by breakpoint name */
  $breakpoints?: Record<string, Variants>
  /** Variant overrides keyed by theme name */
  $themes?: Record<string, Variants>
  /** Inverse-color dimension — a self-contained sub-module (base variants + its own `$themes`). */
  $inverse?: Record<string, unknown>
  /** Every other key is a base variant */
  [variant: string]: unknown
}

/**
 * Reassemble the combined module object from `tokensDir/modules/*.json`.
 *
 * @param tokensDir - Absolute path to `src/tokens/`
 * @returns The base groups at the top level, plus `$breakpoints` (breakpoint →
 *   group → variants), `$themes` (theme → group → variants), and `$inverse`
 *   (group → sub-module) reserved keys. Each reserved key is present only when
 *   at least one file defines it.
 */
export function readModuleFolder<T = Record<string, unknown>>(tokensDir: string): T {
  const moduleDir = path.join(tokensDir, 'modules')
  // Deterministic glob — stem is the group name. Mirrors the components/ reader.
  const files = fs.readdirSync(moduleDir).filter((f) => f.endsWith('.json')).sort()

  // One accumulator per section of the combined object
  const base: Record<string, Variants> = {}
  const breakpoints: Record<string, Record<string, Variants>> = {}
  const themes: Record<string, Record<string, Variants>> = {}
  const inverse: Record<string, Record<string, unknown>> = {}

  for (const filename of files) {
    const group = filename.replace(/\.json$/, '')
    const { $breakpoints, $themes, $inverse, ...groupBase }: GroupFile = JSON.parse(
      fs.readFileSync(path.join(moduleDir, filename), 'utf-8')
    )

    // Base variants — omitted for purely breakpoint-driven groups (e.g. fontSize).
    if (Object.keys(groupBase).length > 0) base[group] = groupBase as Variants

    // Re-nest this group's breakpoint overrides under breakpoint → group → variants.
    if ($breakpoints) {
      for (const [bp, variants] of Object.entries($breakpoints)) {
        ;(breakpoints[bp] ??= {})[group] = variants
      }
    }

    // Re-nest this group's theme overrides under theme → group → variants.
    if ($themes) {
      for (const [theme, variants] of Object.entries($themes)) {
        ;(themes[theme] ??= {})[group] = variants
      }
    }

    // The inverse sub-module is kept whole, keyed by group → { base + its $themes }.
    if ($inverse) inverse[group] = $inverse
  }

  // Reserved keys only when non-empty, so readers can default a missing section to `{}`
  const out: Record<string, unknown> = { ...base }
  if (Object.keys(breakpoints).length > 0) out.$breakpoints = breakpoints
  if (Object.keys(themes).length > 0) out.$themes = themes
  if (Object.keys(inverse).length > 0) out.$inverse = inverse
  return out as T
}
