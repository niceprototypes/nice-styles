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
 * `src/tokens/`, read and validated by `scripts/shared/readTokenSources.ts`.
 *
 * ## Output
 *
 * `src/generated/*Data.ts` — see `writeData.ts`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readTokenSources } from '../shared/readTokenSources.js'
import { writeTokenDataFiles } from './writeData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tokensDir = path.join(__dirname, '..', '..', 'src', 'tokens')
const generatedDir = path.join(__dirname, '..', '..', 'src', 'generated')

function main() {
  writeTokenDataFiles(readTokenSources(tokensDir), generatedDir)
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
