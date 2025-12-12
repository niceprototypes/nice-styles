/**
 * Convert camelCase to SCREAMING_SNAKE_CASE
 * @example camelToScreaming("fontSize") // "FONT_SIZE"
 * @example camelToScreaming("downBase") // "DOWN_BASE"
 */
export function camelToScreaming(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')
}