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
 * | `module.color.json` | `{ day: { group: { item: value } }, night: {...} }` | Color tokens keyed by mode |
 * | `module.size.json` | `{ mobile: {...}, tablet: {...}, desktop: {...} }` | Size tokens keyed by breakpoint |
 * | `component.json` | `{ day: { prefix: { ...nested } }, night: {...} }` | Component tokens keyed by mode |
 *
 * ## Merge strategy
 *
 * The `tokens` field in the returned object is a unified map of all semantic defaults:
 * - Core tokens (no variants) from `module.json`
 * - Color day values from `module.color.json` → day dimension
 * - Size mobile values from `module.size.json` → mobile dimension
 *
 * This merged map drives both the `:root` semantic variable emission and the
 * per-group individual CSS files in `dist/css/`.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { Tokens, NightTokens, ComponentTokens, SizeTokens, Errors } from '../css/types.js'
import { validateNightTokens, validateComponentNightTokens } from '../css/validate.js'

export interface TokenSources {
  /** Merged semantic defaults: core + color day + size mobile */
  tokens: Tokens
  /** Night-mode overrides from module.color.json */
  nightTokens: NightTokens
  /** Full size module data for breakpoint primitive/media query emission */
  sizeTokens: SizeTokens
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

  // Color module — day provides semantic defaults, night provides overrides
  const colorJson = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.color.json'), 'utf-8')
  )
  const colorDay: Tokens = colorJson.day || {}
  const nightTokens: NightTokens = colorJson.night || {}

  // Validate: every night entry must have a corresponding day entry
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))
  if (Object.keys(nightTokens).length > 0) {
    validateNightTokens(colorDay, nightTokens, errors)
    console.log('✓ Color module night tokens validated')
  }

  // Size module — mobile provides semantic defaults, desktop/tablet provide overrides
  const sizeTokens: SizeTokens = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.size.json'), 'utf-8')
  )
  const sizeMobile: Tokens = sizeTokens.mobile || {}

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
  // Order: core → color day → size mobile (later keys win on collision)
  const tokens: Tokens = { ...coreTokens, ...colorDay, ...sizeMobile }

  return { tokens, nightTokens, sizeTokens, componentTokens, componentNightTokens }
}
