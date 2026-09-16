/**
 * Token tree traversal — the one walker over nested component token trees.
 *
 * Component token files (`src/tokens/components/{prefix}.json`) nest groups to
 * any depth; every string leaf is a token value whose path is its variable name.
 * Emitters, the alias propagator, and registry seeding all visit leaves through
 * `walkTokenTree`, and read parallel override trees (night, breakpoint, extra
 * theme) through `leafAt`.
 *
 * @example
 * walkTokenTree({ size: { base: "var(--np--size)" }, icon: { color: { base: "currentColor" } } }, visit)
 * // visit(["size", "base"], "var(--np--size)")
 * // visit(["icon", "color", "base"], "currentColor")
 */

import type { TokenTree } from './types.js'

/**
 * Visit every string leaf, depth-first in key order.
 *
 * @param tree - Tree to walk
 * @param visit - Called with the leaf's full path (groups + variant) and its value
 * @param path - Path of `tree` within the root; callers omit it
 */
export function walkTokenTree(tree: TokenTree, visit: (path: string[], value: string) => void, path: string[] = []): void {
  for (const [key, child] of Object.entries(tree)) {
    // Reserved override axes ($themes, $breakpoints) are not token groups
    if (key.startsWith('$')) continue
    const childPath = [...path, key]
    // Leaf: a token value; branch: descend one group deeper
    if (typeof child === 'string') visit(childPath, child)
    else walkTokenTree(child, visit, childPath)
  }
}

/**
 * The string leaf at `path` in a (possibly partial) override tree.
 *
 * @param tree - Override tree, or undefined when the component has none
 * @param path - Full leaf path, as passed to a `walkTokenTree` visitor
 * @returns The leaf value, or undefined when the path is absent or ends on a branch
 */
export function leafAt(tree: TokenTree | undefined, path: string[]): string | undefined {
  let node: TokenTree[string] | undefined = tree
  for (const segment of path) {
    if (!node || typeof node !== 'object') return undefined
    node = node[segment]
  }
  return typeof node === 'string' ? node : undefined
}
