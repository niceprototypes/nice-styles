/**
 * Token Data Generator — entry point.
 *
 * Converts token JSON source files into typed TypeScript objects so they can
 * be imported by any bundler without JSON import assertions (assert/with).
 *
 * ## CLI
 *
 * ```bash
 * # One-shot build (used by npm run build:tokens)
 * tsx scripts/generateTokens/index.ts
 *
 * # Watch mode (used by npm run dev)
 * tsx scripts/generateTokens/index.ts --watch
 * ```
 *
 * ## Input
 *
 * - `src/tokens/module.json` — Flat core tokens
 * - `src/tokens/module.color.json` — Color tokens keyed by mode
 * - `src/tokens/module.size.json` — Size tokens keyed by breakpoint
 * - `src/tokens/component.json` — Component tokens (day/night)
 *
 * ## Output
 *
 * - `src/generated/tokensData.ts`
 * - `src/generated/colorTokensData.ts`
 * - `src/generated/sizeTokensData.ts`
 * - `src/generated/componentTokensData.ts`
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readTokenJsonSources } from './readSources.js'
import { writeTokenDataFiles } from './writeData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tokensDir = path.join(__dirname, '..', '..', 'src', 'tokens')
const generatedDir = path.join(__dirname, '..', '..', 'src', 'generated')

function main() {
  const sources = readTokenJsonSources(tokensDir)
  writeTokenDataFiles(sources, generatedDir)
}

main()

// Watch mode — rebuild on any token JSON change
if (process.argv.includes('--watch')) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  fs.watch(tokensDir, { recursive: true }, (_eventType, filename) => {
    // Only react to JSON token file changes
    if (!filename?.endsWith('.json')) return
    // Debounce to batch rapid successive saves
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      console.log(`\nToken change detected: ${filename}`)
      try {
        main()
      } catch (error) {
        // Log but don't exit — keeps the watcher alive for the next save
        console.error('Error regenerating token data:', error)
      }
    }, 200)
  })

  console.log(`Watching ${tokensDir} for changes...`)
}
