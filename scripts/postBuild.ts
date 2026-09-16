/**
 * Post-build step — the last stage of `npm run build` (`build:post`).
 *
 * `src/index.ts` re-exports a hand-picked list of the unions in
 * `src/generated/types.ts`. Unions added by the generator later (a new token
 * group, the `{group}Inverse` types) would be missing from that list, so this
 * script appends `export type * from './generated/types.js'` to the compiled
 * `dist/index.d.ts`, exporting every generated union from the package root.
 *
 * Runs after `tsc` (it edits tsc's output) and is idempotent: a second run
 * finds the line and leaves the file unchanged.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Append the generated-types re-export to `dist/index.d.ts` unless present.
 * Exits with code 1 when `dist/index.d.ts` does not exist (tsc has not run).
 */
function main() {
  const indexDtsPath = path.join(__dirname, '..', 'dist', 'index.d.ts')

  // Fail the build instead of silently shipping a package without types
  if (!fs.existsSync(indexDtsPath)) {
    console.error('❌ dist/index.d.ts not found. Run tsc first.')
    process.exit(1)
  }

  const content = fs.readFileSync(indexDtsPath, 'utf-8')

  // Add type re-export if not already present
  if (!content.includes('export type * from \'./generated/types.js\'')) {
    const updatedContent = content + '\n// Re-export generated types\nexport type * from \'./generated/types.js\'\n'
    fs.writeFileSync(indexDtsPath, updatedContent, 'utf-8')
    console.log('✓ Added type re-exports to dist/index.d.ts')
  } else {
    console.log('✓ Type re-exports already present in dist/index.d.ts')
  }
}

main()