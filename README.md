# nice-styles

A collection of CSS custom properties (variables) for consistent design tokens.

## Installation

```bash
npm install nice-styles
```

## Usage

### Import All Variables

Import all CSS variables into your project:

```css
@import 'nice-styles/variables.css';
```

Or import directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/nice-styles/variables.css">
```

### Import Individual Variable Groups

For better performance and smaller bundle sizes, import only the variables you need:

```css
@import 'nice-styles/static/css/border-radius.css';
@import 'nice-styles/static/css/font-size.css';
@import 'nice-styles/static/css/gap-size.css';
```

Available individual CSS files:
- `animation.css` - Duration and easing
- `background-color.css` - Background colors
- `border-color.css` - Border colors
- `border-radius.css` - Border radius values
- `border-width.css` - Border width values
- `box-shadow.css` - Shadow styles
- `cell-height.css` - Cell height values
- `content-color.css` - Text and content colors
- `font-family.css` - Font stacks
- `font-size.css` - Font size scale
- `gap-size.css` - Spacing scale
- `icon-stroke-width.css` - Icon stroke widths
- `icon-stroke-color.css` - Icon stroke colors
- `line-height.css` - Line height values
- `reverse.css` - Reverse color variants
- And more component-specific variables

## Available Variables

This package provides a comprehensive set of CSS custom properties using semantic naming for better clarity:

- **Animation**: Duration (default, slow) and easing values
- **Background Colors**: Primary and secondary colors with reverse variants
- **Border**: Colors (primary, secondary), radius (smaller → larger), width (default, large)
- **Box Shadow**: Default and large shadow options with reverse variants
- **Cell Height**: Five size options (smaller, small, default, large, larger)
- **Content Colors**: Five shade levels (darker, dark, default, light, lighter) plus status colors (active, success, error, warning)
- **Font Family**: Heading, body, and code font stacks
- **Font Size**: Five size levels (smaller → larger)
- **Gap Size**: Five spacing levels (smaller → larger: 4px, 8px, 16px, 32px, 48px)
- **Icon**: Stroke width and color values (default, large)
- **Line Height**: Condensed, default, and expanded options

See [variables.css](./variables.css) for the complete list of available variables.

## Example

```css
.my-component {
  background-color: var(--background-color-default);
  color: var(--content-color-dark);
  border-radius: var(--border-radius-default);
  padding: var(--gap-size-default);
  font-family: var(--font-family-body);
  font-size: var(--font-size-default);
  box-shadow: var(--box-shadow-default);
}

.dark-mode {
  background-color: var(--content-color-darker);
  color: var(--content-color-lighter);
  border: var(--border-width-default) solid var(--border-color-secondary);
}
```

## Token Map

A comprehensive overview of all design tokens and their available keys:

```
📦 LEVEL 0: BASE VARIABLES
│
├─ ⏱️  animationDuration
│  ├─ default
│  └─ slow
│
├─ 〰️  animationEasing
│  └─ default
│
├─ 🎨 backgroundColor
│  ├─ default
│  ├─ defaultReverse
│  ├─ active
│  ├─ activeReverse
│  ├─ dark
│  ├─ darkReverse
│  ├─ darker
│  ├─ darkerReverse
│  ├─ light
│  ├─ lightReverse
│  ├─ lighter
│  └─ lighterReverse
│
├─ 🔲 borderColor
│  ├─ primary
│  ├─ primaryReverse
│  ├─ secondary
│  └─ secondaryReverse
│
├─ ⬛ borderRadius
│  ├─ default
│  ├─ large
│  ├─ larger
│  ├─ small
│  └─ smaller
│
├─ ━  borderWidth
│  ├─ default
│  └─ large
│
├─ ▪️  boxShadow
│  ├─ default
│  └─ large
│
├─ ▬  cellHeight
│  ├─ default
│  ├─ large
│  ├─ larger
│  ├─ small
│  └─ smaller
│
├─ 🖍️  contentColor
│  ├─ default
│  ├─ defaultReverse
│  ├─ dark
│  ├─ darkReverse
│  ├─ darker
│  ├─ darkerReverse
│  ├─ light
│  ├─ lightReverse
│  ├─ lighter
│  └─ lighterReverse
│
├─ 🚦 statusColor
│  ├─ active
│  ├─ error
│  ├─ success
│  └─ warning
│
├─ 📝 fontFamily
│  ├─ body
│  ├─ code
│  └─ heading
│
├─ 🔤 fontSize
│  ├─ default
│  ├─ large
│  ├─ larger
│  ├─ small
│  └─ smaller
│
├─ ↔️  gapSize
│  ├─ default
│  ├─ large
│  ├─ larger
│  ├─ small
│  └─ smaller
│
├─ 🎯 iconStrokeWidth
│  ├─ default
│  └─ large
│
├─ 🎯 iconStrokeColor
│  ├─ default
│  ├─ defaultReverse
│  ├─ primary
│  └─ primaryReverse
│
└─ ≡  lineHeight
   ├─ condensed
   ├─ default
   └─ expanded
```

## License

MIT