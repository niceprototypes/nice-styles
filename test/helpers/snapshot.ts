/**
 * File-based snapshot assertion for `node:test`.
 *
 * Each snapshot is a plain file under `test/__snapshots__/`, so a diff reads as
 * the generated CSS itself. A missing snapshot is written and the assertion
 * passes; set `UPDATE_SNAPSHOTS=1` (`npm run test:update`) to rewrite existing
 * snapshots after an intended output change.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const SNAPSHOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '__snapshots__')

/**
 * Compare `actual` to the stored snapshot `name`, writing it when absent or when
 * `UPDATE_SNAPSHOTS=1`.
 *
 * @param name - Snapshot file name (e.g. `dist-tokens.css`)
 * @param actual - Content to compare
 */
export function matchSnapshot(name: string, actual: string): void {
  const file = path.join(SNAPSHOT_DIR, name)
  if (process.env.UPDATE_SNAPSHOTS === '1' || !fs.existsSync(file)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })
    fs.writeFileSync(file, actual, 'utf-8')
    return
  }
  assert.equal(actual, fs.readFileSync(file, 'utf-8'), `snapshot mismatch: ${name} (run npm run test:update if intended)`)
}
