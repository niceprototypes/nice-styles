/**
 * `getToken` type tests.
 *
 * Type-checks each fixture in `test/types/` with the package's compiler, one
 * program per fixture so a module augmentation in one cannot leak into another.
 * A fixture holds valid calls that must compile and `@ts-expect-error` calls
 * that must not (an unused directive is itself an error), so the check passes
 * only when the typed overloads accept exactly the valid addresses.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')

/**
 * Type-check one fixture alone, with the same compiler options as tsconfig.json.
 *
 * @param name - Fixture file name under `test/types/`
 * @returns The compiler's exit status and output
 */
function typecheck(name: string): { status: number | null; output: string } {
  const result = spawnSync(
    process.execPath,
    [
      tsc, '--ignoreConfig', '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2020', '--module', 'ESNext',
      '--moduleResolution', 'bundler', '--resolveJsonModule', '--esModuleInterop', path.join(root, 'test', 'types', name),
    ],
    { encoding: 'utf-8' }
  )
  return { status: result.status, output: result.stdout + result.stderr }
}

test('getToken overloads accept valid addresses and reject invalid ones at compile time', () => {
  const { status, output } = typecheck('getToken.typecheck.ts')
  assert.equal(status, 0, output)
})

test('a custom group declared on CustomTokenVariants type-checks through the built package', () => {
  // Resolves 'nice-styles' to dist/ by self-reference, so it runs against the build like the other tests
  const { status, output } = typecheck('customTokens.typecheck.ts')
  assert.equal(status, 0, output)
})
