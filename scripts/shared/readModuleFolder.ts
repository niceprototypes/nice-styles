/**
 * Module token-folder reader.
 *
 * `src/tokens/modules/` holds one JSON file per token group — the same
 * one-file-per-prefix philosophy used by `tokens/components/`. Each file's stem
 * is the group name (`color.json` → `color`); its top-level keys are that
 * group's base variants, with reserved `$breakpoints` (breakpoint → variants)
 * and `$themes` (theme → variants) keys holding overrides scoped to the group.
 *
 * This reader globs those files and reassembles the single combined object the
 * legacy `module.json` used to be — base groups at the top level plus the
 * cross-group reserved `$breakpoints` and `$themes` sections. The returned shape
 * is identical to `JSON.parse(module.json)`, so every downstream `readModule`
 * split keeps working unchanged. Adding a token group = drop a file, no script
 * edits.
 */

import * as fs from 'fs'
import * as path from 'path'

type Variants = Record<string, unknown>

/** A single `module/{group}.json` file: base variants + optional overrides. */
interface GroupFile {
  $breakpoints?: Record<string, Variants>
  $themes?: Record<string, Variants>
  [variant: string]: unknown
}

/**
 * Reassemble the combined module object from `tokensDir/modules/*.json`.
 *
 * @param tokensDir - Absolute path to `src/tokens/`
 * @returns The base groups at the top level, plus `$breakpoints` (breakpoint →
 *   group → variants) and `$themes` (theme → group → variants) reserved keys —
 *   exactly the shape the old single `module.json` parsed to.
 */
export function readModuleFolder<T = Record<string, unknown>>(tokensDir: string): T {
  const moduleDir = path.join(tokensDir, 'modules')
  // Deterministic glob — stem is the group name. Mirrors the components/ reader.
  const files = fs.readdirSync(moduleDir).filter((f) => f.endsWith('.json')).sort()

  const base: Record<string, Variants> = {}
  const breakpoints: Record<string, Record<string, Variants>> = {}
  const themes: Record<string, Record<string, Variants>> = {}

  for (const filename of files) {
    const group = filename.replace(/\.json$/, '')
    const { $breakpoints, $themes, ...groupBase }: GroupFile = JSON.parse(
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
  }

  const out: Record<string, unknown> = { ...base }
  if (Object.keys(breakpoints).length > 0) out.$breakpoints = breakpoints
  if (Object.keys(themes).length > 0) out.$themes = themes
  return out as T
}
