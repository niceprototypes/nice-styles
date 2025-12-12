/**
 * Convert camelCase to kebab-case
 * @example camelToKebab("fontSize") // "font-size"
 * @example camelToKebab("downBase") // "down-base"
 */
export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}