/**
 * TypeScript Type Generator — entry point.
 *
 * Generates union type definitions from token JSON source files so that
 * token groups and component prefixes are type-safe at compile time.
 *
 * ## CLI
 *
 * ```bash
 * # One-shot build (used by npm run build:types)
 * tsx scripts/generateTypes/index.ts
 *
 * # Watch mode (used by npm run dev)
 * tsx scripts/generateTypes/index.ts --watch
 * ```
 *
 * ## Input
 *
 * - `src/tokens/module.json` — Core tokens (no dimension variants)
 * - `src/tokens/module.modes.json` — Color tokens keyed by mode
 * - `src/tokens/module.breakpoints.json` — Size tokens keyed by breakpoint
 * - `src/tokens/component.json` — Component tokens (day/night)
 *
 * ## Output
 *
 * - `src/generated/types.ts` — Union types for each core group + ComponentPrefix
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readTypeSources } from './readSources.js'
import { writeTypesFile } from './writeTypes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tokensDir = path.join(__dirname, '..', '..', 'src', 'tokens')
const outputPath = path.join(__dirname, '..', '..', 'src', 'generated', 'types.ts')

function main() {
  const sources = readTypeSources(tokensDir)
  writeTypesFile(sources, outputPath)
}

main()

// Watch mode — rebuild on any token JSON change
if (process.argv.includes('--watch')) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  fs.watch(tokensDir, { recursive: true }, (_eventType, filename) => {
    if (!filename?.endsWith('.json')) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      console.log(`\nToken change detected: ${filename}`)
      try {
        main()
      } catch (error) {
        console.error('Error regenerating types:', error)
      }
    }, 200)
  })

  console.log(`Watching ${tokensDir} for changes...`)
}
