import type { GoogleFontMetadata, FontAxis } from '../types/googleFonts.js'

/**
 * Parses a Google Fonts URL to extract font family and axis information.
 *
 * @example
 * ```ts
 * const url = 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,37&display=swap'
 * const metadata = parseGoogleFontsUrl(url)
 * // Returns: {
 * //   family: 'Google Sans Flex',
 * //   axes: [
 * //     { tag: 'opsz', min: 6, max: 144 },
 * //     { tag: 'wght', min: 1, max: 1000 },
 * //     { tag: 'ROND', min: 37, max: 37 }
 * //   ],
 * //   display: 'swap',
 * //   cssUrl: '...'
 * // }
 * ```
 */
export function parseGoogleFontsUrl(url: string): GoogleFontMetadata | null {
  try {
    const urlObj = new URL(url)

    const familyParam = urlObj.searchParams.get("family")
    if (!familyParam) return null

    const [familyPart, axesPart] = familyParam.split(":")
    const family = familyPart.replace(/\+/g, " ")

    const display = urlObj.searchParams.get("display") as
      | "swap"
      | "block"
      | "fallback"
      | "optional"
      | null

    if (!axesPart) {
      return {
        family,
        axes: [],
        display: display || undefined,
        cssUrl: url,
      }
    }

    const [axisNames, axisValues] = axesPart.split("@")
    const axisTags = axisNames.split(",")
    const axisRanges = axisValues.split(",")

    const axes: FontAxis[] = axisTags.map((tag, index) => {
      const range = axisRanges[index]

      if (range.includes("..")) {
        const [min, max] = range.split("..").map(Number)
        return { tag, min, max }
      } else {
        const value = Number(range)
        return { tag, min: value, max: value, default: value }
      }
    })

    return {
      family,
      axes,
      display: display || undefined,
      cssUrl: url,
    }
  } catch (error) {
    console.error("Failed to parse Google Fonts URL:", error)
    return null
  }
}
