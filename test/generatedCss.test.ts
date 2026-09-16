/**
 * Build output snapshots.
 *
 * Guards every generated CSS file in `dist/` against unintended change, and
 * checks that every seeded registry entry names a variable that `tokens.css`
 * actually declares. Requires a prior `npm run build`.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchSnapshot } from './helpers/snapshot.js'
import { registry } from '../src/index.js'

/** Absolute path of the package's `dist/`, resolved from this test file. */
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

/**
 * Read a dist file, failing with a build hint when it is missing.
 *
 * @param relativePath - Path inside `dist/`
 * @returns The file contents
 */
function readDist(relativePath: string): string {
  const file = path.join(DIST, relativePath)
  assert.ok(fs.existsSync(file), `${relativePath} not found — run npm run build first`)
  return fs.readFileSync(file, 'utf-8')
}

// Top-level CSS assets — one test per file so a failure names the file
for (const file of ['tokens.css', 'breakpoints.css', 'breakpoints.custom-media.css']) {
  test(`dist/${file} matches snapshot`, () => {
    matchSnapshot(`dist-${file}`, readDist(file))
  })
}

// Per-group files. Sorted so snapshot comparison order is stable across filesystems.
test('dist/css/*.css match snapshots', () => {
  const cssDir = path.join(DIST, 'css')
  assert.ok(fs.existsSync(cssDir), 'dist/css not found — run npm run build first')
  for (const file of fs.readdirSync(cssDir).sort()) {
    matchSnapshot(`dist-css-${file}`, readDist(path.join('css', file)))
  }
})

// Cross-artifact invariant: the registry (from src/generated data) and tokens.css
// are built by different pipelines. A seeded key missing from the CSS means
// getToken would return a var() that resolves to nothing in the browser.
test('every seeded registry key is declared in tokens.css', () => {
  const css = readDist('tokens.css')
  // Runtime-only entries are skipped — they are declared by injected CSS, not tokens.css
  const missing = [...registry.values()]
    .filter((entry) => entry.seed !== undefined)
    .map((entry) => entry.key)
    .filter((key) => !css.includes(`${key}:`))
  assert.deepEqual(missing, [])
})
