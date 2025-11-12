# Deprecation Guide

This document tracks deprecated CSS variables and provides migration paths to their replacements.

## Philosophy

The nice-styles package is committed to maintaining backwards compatibility while improving the API over time. When variables are deprecated:

1. **Deprecated variables remain functional** - They point to the new variables using `var()` references
2. **No breaking changes** - Existing code continues to work without modification
3. **Clear migration path** - Documentation shows how to update to the new semantic names
4. **TypeScript warnings** - Deprecated constants include `@deprecated` JSDoc tags

## Deprecated Variables

### Background Colors (v1.2.0)

Number-based background color variables have been replaced with semantic names for better clarity and intent.

| Deprecated Variable | New Variable | Value |
|---------------------|--------------|-------|
| `--background-color-1` | `--background-color-default` | `hsla(0, 100%, 100%, 1)` |
| `--background-color-2` | `--background-color-active` | `hsla(210, 10%, 96%, 1)` |

#### Migration

**CSS:**
```css
/* Before */
.container {
  background-color: var(--background-color-1);
}

/* After */
.container {
  background-color: var(--background-color-default);
}
```

**TypeScript/JavaScript:**
```typescript
// Before
import { BACKGROUND_COLOR_1 } from 'nice-styles'

// After
import { BACKGROUND_COLOR_DEFAULT } from 'nice-styles'
```

**Rationale:** Semantic names (`primary`, `secondary`) are more meaningful than arbitrary numbers (`1`, `2`) and make code more self-documenting.

## Deprecation Timeline

- **v1.2.0**: Background color variables deprecated, semantic names introduced
- **v2.0.0** (planned): Additional number-based variables will be deprecated in favor of semantic names
- **v3.0.0** (planned): Deprecated variables may be removed (with major version bump and migration guide)

## Best Practices

1. **Update gradually**: Deprecated variables continue to work, allowing incremental migration
2. **Use semantic names in new code**: Always use the new semantic names for new code
3. **Check TypeScript warnings**: Enable strict mode to see deprecation warnings at compile time
4. **Test thoroughly**: When migrating, test in all supported browsers

## Future Deprecations

The following patterns may be deprecated in future versions:

- Number-based border radius variables (`--border-radius-1`, etc.)
- Number-based font size variables (`--font-size-1`, etc.)
- Number-based gap size variables (`--gap-size-1`, etc.)

We will provide ample notice and migration documentation before deprecating additional variables.
