/**
 * Pre-build cleanup
 *
 * Wipes generated TypeScript outputs and the dist directory so the
 * generators (generateTypes, generateTokens, generateCss) write into a
 * clean tree. Without this, a renamed or removed token group leaves a
 * stale file behind and the next build picks it up.
 *
 * Wired into `npm run build` only — watch mode skips the clean so
 * incremental rebuilds do not repeatedly wipe their own outputs.
 *
 * @module clean
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

for (const target of ['src/generated', 'dist']) {
  const targetPath = path.join(root, target)
  fs.rmSync(targetPath, { recursive: true, force: true })
  // Recreate the empty directory — generators assume the output dir exists
  // and use fs.writeFileSync without an mkdir-recursive guard.
  fs.mkdirSync(targetPath, { recursive: true })
}
