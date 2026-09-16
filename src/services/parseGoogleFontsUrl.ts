import type { GoogleFontMetadata, FontAxis } from '../types/googleFonts.js'

/**
 * Parses a Google Fonts URL to extract font family and axis information.
 *
 * Called by `buildGoogleFontsConfig`, which pairs the metadata with the
 * `<link>` set that loads the font.
 *
 * Reads the first `family` parameter only. Axis syntax is
 * `family=Name:tag1,tag2@range1,range2`, where a range is `min..max` or a
 * single fixed value.
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
 *
 * @param url - A Google Fonts CSS URL
 * @returns The font metadata, or null when the URL has no `family` parameter or cannot be parsed
 */
export function parseGoogleFontsUrl(url: string): GoogleFontMetadata | null {
  try {
    // Throws on a malformed URL — handled by the catch below
    const urlObj = new URL(url)

    const familyParam = urlObj.searchParams.get("family")
    if (!familyParam) return null

    // `Name:axes` — `+` encodes spaces in the family name
    const [familyPart, axesPart] = familyParam.split(":")
    const family = familyPart.replace(/\+/g, " ")

    const display = urlObj.searchParams.get("display") as
      | "swap"
      | "block"
      | "fallback"
      | "optional"
      | null

    // No axis list — a static family
    if (!axesPart) {
      return {
        family,
        axes: [],
        display: display || undefined,
        cssUrl: url,
      }
    }

    // `tags@ranges` — tags and ranges are parallel comma-separated lists
    const [axisNames, axisValues] = axesPart.split("@")
    const axisTags = axisNames.split(",")
    const axisRanges = axisValues.split(",")

    const axes: FontAxis[] = axisTags.map((tag, index) => {
      const range = axisRanges[index]

      if (range.includes("..")) {
        // Variable axis: `min..max`
        const [min, max] = range.split("..").map(Number)
        return { tag, min, max }
      } else {
        // Fixed axis: one value is min, max, and default
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
    // Any parse failure reports and returns null rather than throwing into the caller
    console.error("Failed to parse Google Fonts URL:", error)
    return null
  }
}
