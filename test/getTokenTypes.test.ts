/**
 * `getToken` type tests.
 *
 * Type-checks `test/types/getToken.typecheck.ts` with the package's compiler.
 * The fixture holds valid calls that must compile and `@ts-expect-error` calls
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
const fixture = path.join(root, 'test', 'types', 'getToken.typecheck.ts')

test('getToken overloads accept valid addresses and reject invalid ones at compile time', () => {
  // Same compiler options as tsconfig.json, applied to the fixture alone
  const result = spawnSync(
    process.execPath,
    [
      tsc, '--ignoreConfig', '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2020', '--module', 'ESNext',
      '--moduleResolution', 'bundler', '--resolveJsonModule', '--esModuleInterop', fixture,
    ],
    { encoding: 'utf-8' }
  )
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
