/**
 * Post-Build Script
 *
 * Adds type re-exports to dist/index.d.ts after TypeScript compilation
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function main() {
  const indexDtsPath = path.join(__dirname, '..', 'dist', 'index.d.ts')

  if (!fs.existsSync(indexDtsPath)) {
    console.error('❌ dist/index.d.ts not found. Run tsc first.')
    process.exit(1)
  }

  const content = fs.readFileSync(indexDtsPath, 'utf-8')

  // Add type re-export if not already present
  if (!content.includes('export type * from \'./types.js\'')) {
    const updatedContent = content + '\n// Re-export generated types\nexport type * from \'./types.js\'\n'
    fs.writeFileSync(indexDtsPath, updatedContent, 'utf-8')
    console.log('✓ Added type re-exports to dist/index.d.ts')
  } else {
    console.log('✓ Type re-exports already present in dist/index.d.ts')
  }
}

main()