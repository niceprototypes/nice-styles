/**
 * CSS Generator — entry point.
 *
 * Orchestrates the full CSS generation pipeline:
 * 1. Read all token JSON sources and validate (readSources)
 * 2. Run the emit → assemble → write pipeline (writeCss)
 *
 * Supports one-shot build and watch mode.
 *
 * ## CLI
 *
 * ```bash
 * # One-shot build (used by npm run build:css)
 * node --loader ts-node/esm scripts/generateCss/index.ts
 *
 * # Watch mode (used by npm run dev)
 * node --loader ts-node/esm scripts/generateCss/index.ts --watch
 * ```
 *
 * @module generate-css
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readTokenSources } from './readSources.js'
import { writeCssFiles } from './writeCss.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tokensDir = path.join(__dirname, '..', '..', 'src', 'tokens')
const distDir = path.join(__dirname, '..', '..', 'dist')
const cssDir = path.join(distDir, 'css')
const errorsPath = path.join(__dirname, '..', '..', 'src', 'errors.json')

function main() {
  const sources = readTokenSources(tokensDir, errorsPath)
  writeCssFiles(sources, distDir, cssDir)
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
        console.error('Error regenerating CSS:', error)
      }
    }, 200)
  })

  console.log(`Watching ${tokensDir} for changes...`)
}
