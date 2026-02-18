import errors from '../errors.json' with { type: 'json' }

type ErrorKey = keyof typeof errors

/**
 * Format an error message with placeholder values
 *
 * @param key - Error key from errors.json
 * @param values - Object with placeholder values to substitute
 * @returns Formatted error message
 *
 * @example
 * formatError("tokenNotFound", { tokenName: "foo", prefix: "button", available: "a, b, c" })
 * // → 'Token "foo" not found in button tokens. Available tokens: a, b, c'
 */
export function formatError(key: ErrorKey, values: Record<string, string>): string {
  let message = errors[key]

  for (const [placeholder, value] of Object.entries(values)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
  }

  return message
}
