/**
 * Declaration-merging hook for custom tokens.
 *
 * `setTokens` / `generateTokenCSS` can register token groups that the token
 * sources do not declare (a storybook's `contentMaxWidth`, a brand's `jumbo`
 * font size). `getToken`'s address and variant types are generated from the
 * sources, so those groups are rejected at compile time until the consumer
 * declares them here. The generated `TokenVariants` extends this interface,
 * so every declared group flows into `TokenGroup` and `TokenAddress`.
 *
 * Empty by design: the package declares nothing, consumers augment it.
 *
 * @example
 * // In the consumer, next to the setTokens call (any .ts file in the program)
 * declare module "nice-styles" {
 *   interface CustomTokenVariants {
 *     contentMaxWidth: "base" | "wide"
 *   }
 * }
 *
 * getToken("contentMaxWidth")        // "var(--np--content-max-width)"
 * getToken("contentMaxWidth:wide")   // "var(--np--content-max-width--wide)"
 */
export interface CustomTokenVariants {}
