import * as fs from 'fs'
import * as path from 'path'
import {
  animationDuration,
  animationEasing,
  backgroundColor,
  borderColor,
  borderRadius,
  borderWidth,
  boxShadow,
  cellHeight,
  contentColor,
  fontFamily,
  fontSize,
  gapSize,
  iconStrokeWidth,
  lineHeight,
  backgroundColorInverse,
  contentColorInverse,
  borderColorInverse,
  contentColorStatus,
  iconStrokeColor,
  iconStrokeColorInverse,
} from '../src/variables'
import {
  animationDurationDeprecated,
  animationEasingDeprecated,
  backgroundColorDeprecated,
  borderColorDeprecated,
  borderRadiusDeprecated,
  borderWidthDeprecated,
  boxShadowDeprecated,
  cellHeightDeprecated,
  contentColorDeprecated,
  fontSizeDeprecated,
  gapSizeDeprecated,
  iconStrokeWidthDeprecated,
} from '../src/variables.deprecated'
import { NamedVariables, NumberedVariables } from '../src/types'

/**
 * Helper to generate CSS custom properties from a variable object
 */
function generateCSSVariables(
  prefix: string,
  variables: NumberedVariables | NamedVariables,
  indent: string = '\t'
): string {
  return Object.entries(variables)
    .map(([key, value]) => `${indent}--${prefix}-${key}: ${value};`)
    .join('\n')
}

/**
 * Helper to add inverse suffix to variable keys
 */
function withInverseSuffix(variables: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(variables).map(([k, v]) => [`${k}-inverse`, v])
  )
}

/**
 * Generate the complete CSS file content
 */
function generateCSS(): string {
  const blocks: string[] = []

  // 0.1 BASE
  const level0Base = [
    generateCSSVariables('animation-duration', animationDuration),
    generateCSSVariables('animation-easing', animationEasing),
    generateCSSVariables('background-color', backgroundColor),
    generateCSSVariables('border-color', borderColor),
    generateCSSVariables('border-radius', borderRadius),
    generateCSSVariables('border-width', borderWidth),
    generateCSSVariables('box-shadow', boxShadow),
    generateCSSVariables('cell-height', cellHeight),
    generateCSSVariables('content-color', contentColor),
    generateCSSVariables('font-family', fontFamily),
    generateCSSVariables('font-size', fontSize),
    generateCSSVariables('gap-size', gapSize),
    generateCSSVariables('icon-stroke-width', iconStrokeWidth),
    generateCSSVariables('line-height', lineHeight),
  ].join('\n\n')

  blocks.push(`:root {\n${level0Base}\n}`)

  // 1.1 BASE
  const level1Base = [
    generateCSSVariables('background-color', withInverseSuffix(backgroundColorInverse)),
    generateCSSVariables('content-color', withInverseSuffix(contentColorInverse)),
    generateCSSVariables('border-color', withInverseSuffix(borderColorInverse)),
    generateCSSVariables('content-color', contentColorStatus),
  ].join('\n\n')

  blocks.push(`:root {\n${level1Base}\n}`)

  // 1.2  COMPONENTS
  const level1Components = [
    generateCSSVariables('icon-stroke-color', iconStrokeColor),
    generateCSSVariables('icon-stroke-color', withInverseSuffix(iconStrokeColorInverse)),
  ].join('\n\n')

  blocks.push(`:root {\n${level1Components}\n}`)

  // DEPRECATED VARIABLES
  const deprecated = [
    generateCSSVariables('animation-duration', animationDurationDeprecated),
    generateCSSVariables('animation-easing', animationEasingDeprecated),
    generateCSSVariables('background-color', backgroundColorDeprecated),
    generateCSSVariables('border-color', borderColorDeprecated),
    generateCSSVariables('border-radius', borderRadiusDeprecated),
    generateCSSVariables('border-width', borderWidthDeprecated),
    generateCSSVariables('box-shadow', boxShadowDeprecated),
    generateCSSVariables('cell-height', cellHeightDeprecated),
    generateCSSVariables('content-color', contentColorDeprecated),
    generateCSSVariables('font-size', fontSizeDeprecated),
    generateCSSVariables('gap-size', gapSizeDeprecated),
    generateCSSVariables('icon-stroke-width', iconStrokeWidthDeprecated),
  ].join('\n\n')

  blocks.push(`/* Deprecated variables - these map to semantic names */\n:root {\n${deprecated}\n}`)

  return blocks.join('\n\n')
}

/**
 * Main execution
 */
function main() {
  const css = generateCSS()
  const outputPath = path.join(__dirname, '..', 'variables.css')

  fs.writeFileSync(outputPath, css, 'utf-8')
  console.log(`✓ Generated CSS file: ${outputPath}`)
}

main()