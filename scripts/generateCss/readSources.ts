/**
 * Token source reader.
 *
 * Reads all JSON token source files and validates cross-module consistency.
 * Returns a fully resolved, typed data structure ready for the CSS pipeline.
 *
 * ## Source files
 *
 * | File | Shape | Role |
 * |------|-------|------|
 * | `module.json` | `{ group: { item: value } }` | Core tokens — no dimension variants |
 * | `module.themes.json` | `{ day: { group: { item: value } }, night: {...} }` | Color tokens keyed by theme |
 * | `module.breakpoints.json` | `{ phone: {...}, tablet: {...}, laptop: {...}, desktop: {...} }` | Size tokens keyed by breakpoint |
 * | `component.json` | `{ day: { prefix: { ...nested } }, night: {...} }` | Component tokens keyed by theme |
 *
 * ## Merge strategy
 *
 * The `tokens` field in the returned object is a unified map of all semantic defaults:
 * - Core tokens (no variants) from `module.json`
 * - Color day values from `module.themes.json` → day dimension
 * - Size small values from `module.breakpoints.json` → phone dimension
 *
 * This merged map drives both the `:root` semantic variable emission and the
 * per-group individual CSS files in `dist/css/`.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { Tokens, NightTokens, ComponentTokens, BreakpointTokens, Errors } from '../css/types.js'
import { validateNightTokens, validateComponentNightTokens } from '../css/validate.js'
import { BREAKPOINT_PHONE } from '../../src/constants/breakpoints.js'

export interface TokenSources {
  /** Merged semantic defaults: core + color day + size phone */
  tokens: Tokens
  /** Night-theme overrides from module.themes.json */
  nightTokens: NightTokens
  /** Full breakpoints module data for breakpoint primitive/media query emission */
  sizeTokens: BreakpointTokens
  /** Component day tokens from component.json */
  componentTokens: ComponentTokens
  /** Component night overrides from component.json */
  componentNightTokens: ComponentTokens
}

/**
 * Reads all token JSON sources, validates cross-module consistency,
 * and returns a merged, typed structure for the CSS pipeline.
 *
 * @param tokensDir - Absolute path to src/tokens/
 * @param errorsPath - Absolute path to src/errors.json (validation message templates)
 */
export function readTokenSources(tokensDir: string, errorsPath: string): TokenSources {
  // Core tokens — no dimension variants (animation, border, font-weight, gap, etc.)
  const coreTokens: Tokens = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.json'), 'utf-8')
  )

  // Themes module — day provides semantic defaults, night provides overrides
  const themesJson = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.themes.json'), 'utf-8')
  )
  const themesDay: Tokens = themesJson.day || {}
  const nightTokens: NightTokens = themesJson.night || {}

  // Validate: every night entry must have a corresponding day entry
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))
  if (Object.keys(nightTokens).length > 0) {
    validateNightTokens(themesDay, nightTokens, errors)
    console.log('✓ Themes module night tokens validated')
  }

  // Breakpoints module — phone provides semantic defaults, tablet/laptop/desktop provide overrides
  const sizeTokens: BreakpointTokens = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.breakpoints.json'), 'utf-8')
  )
  const breakpointsPhone: Tokens = sizeTokens[BREAKPOINT_PHONE] || {}

  // Component tokens — day/night wrapper, unchanged from previous architecture
  const componentJson = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'component.json'), 'utf-8')
  )
  const componentTokens: ComponentTokens = componentJson.day
  const componentNightTokens: ComponentTokens = componentJson.night || {}

  const componentCount = Object.keys(componentTokens).length
  if (componentCount > 0) {
    console.log(`✓ Loaded ${componentCount} component token sets: ${Object.keys(componentTokens).join(', ')}`)
  }

  // Validate: every component night entry must have a corresponding day entry
  if (Object.keys(componentNightTokens).length > 0) {
    validateComponentNightTokens(componentTokens, componentNightTokens)
    console.log('✓ Component night tokens validated')
  }

  // Merge all sources into a unified semantic defaults map
  // Order: core → color day → size phone (later keys win on collision)
  const tokens: Tokens = { ...coreTokens, ...themesDay, ...breakpointsPhone }

  return { tokens, nightTokens, sizeTokens, componentTokens, componentNightTokens }
}
