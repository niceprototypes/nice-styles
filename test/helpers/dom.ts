/**
 * Minimal DOM stub for runtime CSS injection tests.
 *
 * `injectTokenCSS` and `injectBreakpointCss` look up `<style data-…>` elements
 * with `document.querySelector`, create them with `document.createElement`, and
 * append them to `document.head`. This stub records each element by its data
 * attribute so tests can read the injected stylesheet text.
 */

/**
 * Stand-in for a `<style>` element: only the members the injectors touch.
 * Installed as the global `HTMLStyleElement` so the breakpoint injector's
 * `instanceof HTMLStyleElement` check accepts it.
 */
class StubStyleElement {
  /** Name of the data attribute set on it (`data-nice-tokens`); the value is ignored */
  attribute: string | null = null
  /** The injected CSS, read back by `stylesheetText` */
  textContent = ''
  /**
   * Record the attribute name — the only part the lookup uses.
   *
   * @param name - Attribute name
   */
  setAttribute(name: string): void {
    this.attribute = name
  }
}

/** Injected `<style>` elements keyed by data attribute (e.g. `data-nice-tokens`). */
const elements = new Map<string, StubStyleElement>()

/**
 * Install the stub on `globalThis`. Call before any injection runs: the
 * injectors check `typeof document` and cache their element on first use.
 */
export function installDomStub(): void {
  const globals = globalThis as Record<string, unknown>
  globals.HTMLStyleElement = StubStyleElement
  globals.document = {
    // Appending registers the element under its data attribute
    head: { appendChild: (element: StubStyleElement) => elements.set(element.attribute ?? '', element) },
    // `style[data-nice-tokens]` → look up by the name inside the brackets
    querySelector: (selector: string) => elements.get(selector.match(/\[([^\]]+)\]/)?.[1] ?? '') ?? null,
    createElement: () => new StubStyleElement(),
  }
}

/**
 * Text of an injected stylesheet.
 *
 * @param attribute - Data attribute of the `<style>` element (e.g. `data-nice-breakpoints`)
 * @returns Its CSS text, or `''` when nothing was injected
 */
export function stylesheetText(attribute: string): string {
  return elements.get(attribute)?.textContent ?? ''
}
