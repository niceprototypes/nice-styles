/**
 * Component colour groups whose prop accepts a core colour union.
 *
 * Each listed component prop is typed with the core union (`BackgroundColorType`,
 * `BorderColorType`, `ColorType`) and resolves `{prefix}.{group}:{variant}`. Every core
 * variant therefore needs a component token, or the prop emits a var that is never declared.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listTokens } from '../src/index.js'

const componentColorGroups: [prefix: string, group: string][] = [
  ['button', 'borderColor'],
  ['checkbox', 'borderColor'],
  ['icon', 'color'],
  ['image', 'borderColor'],
  ['ink', 'color'],
  ['input', 'backgroundColor'],
  ['input', 'borderColor'],
  ['line', 'borderColor'],
  ['tile', 'backgroundColor'],
  ['tile', 'color'],
]

const variantsOf = (prefix: string | undefined, group: string) =>
  listTokens({ group })
    .filter((token) => token.prefix === prefix && !token.inverse)
    .map((token) => token.variant)

for (const [prefix, group] of componentColorGroups) {
  test(`${prefix}.${group} covers every core ${group} variant`, () => {
    const componentVariants = variantsOf(prefix, group)
    const missing = variantsOf(undefined, group).filter((variant) => !componentVariants.includes(variant))
    assert.deepEqual(missing, [])
  })
}
