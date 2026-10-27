/**
 * The build-time var() guard: emitted CSS may reference only `--np--` custom
 * properties it declares.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateVarReferences } from '../scripts/css/validate.js'

test('passes when every referenced --np-- property is declared', () => {
  const css = ':root {\n\t--np--gap: 16px;\n\t--np--tabs--gap: var(--np--gap);\n}\n'
  assert.doesNotThrow(() => validateVarReferences('tokens.css', css))
})

test('throws naming each missing property and its referencing declaration', () => {
  const css = ':root {\n\t--np--gap: 16px;\n\t--np--tabs--padding: var(--np--gap) var(--np--gap--base);\n}\n'
  assert.throws(
    () => validateVarReferences('tokens.css', css),
    (error: Error) =>
      error.message.includes('tokens.css') &&
      error.message.includes('--np--gap--base') &&
      error.message.includes('in: --np--tabs--padding: var(--np--gap) var(--np--gap--base);')
  )
})
