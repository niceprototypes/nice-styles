# Deprecation Guide

This document tracks deprecated CSS variables and TypeScript constants, providing migration paths to their replacements.

## Philosophy

The nice-styles package is committed to maintaining backwards compatibility while improving the API over time. When variables are deprecated:

1. **Deprecated variables remain functional** - They point to the new variables using `var()` references in `deprecated.css`
2. **No breaking changes** - Existing code continues to work without modification
3. **Clear migration path** - Documentation shows how to update to the new semantic names
4. **TypeScript warnings** - Deprecated constants include `@deprecated` JSDoc tags

## Using Deprecated Variables

To maintain backward compatibility in your application, import the deprecated variables file:

```css
@import 'nice-styles/deprecated.css';
```

This file contains CSS variable aliases that map old variable names to their new equivalents.

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

### Content Colors → Foreground Colors (v4.0.0)

Content color variables have been renamed to foreground color for better semantic clarity.

| Deprecated Variable | New Variable | Migration |
|---------------------|--------------|-----------|
| `--content-color-*` | `--foreground-color-*` | Replace `content` with `foreground` |

### Gap Size → Gap (v4.1.0)

Number-based gap size variables have been replaced with semantic size names.

| Deprecated Variable | New Variable |
|---------------------|--------------|
| `--gap-size-1` | `--gap-smaller` |
| `--gap-size-2` | `--gap-smaller` |
| `--gap-size-3` | `--gap-small` |
| `--gap-size-4` | `--gap-base` |
| `--gap-size-5` | `--gap-large` |
| `--gap-size-6` | `--gap-larger` |

### Dark/Darker → Heavy/Heavier (v4.1.0)

The term "dark" has been reserved for dark theme support. Color intensity variants now use "heavy/heavier".

| Deprecated Variable | New Variable |
|---------------------|--------------|
| `--border-color-dark` | `--border-color-heavy` |
| `--border-color-darker` | `--border-color-heavier` |
| `--foreground-color-dark` | `--foreground-color-heavy` |

### Icon Stroke Width (v4.1.0)

Icon stroke width variables have been deprecated in favor of border width variables.

| Deprecated Variable | New Variable |
|---------------------|--------------|
| `--icon-stroke-width-base` | `--border-width-base` |
| `--icon-stroke-width-large` | `--border-width-large` |

## Deprecation Timeline

- **v1.2.0**: Background color variables deprecated, semantic names introduced
- **v4.0.0**: Content color renamed to foreground color
- **v4.1.0**: Gap size, dark/darker, and icon stroke width deprecated
- **v5.0.0** (planned): All deprecated variables will be removed

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
