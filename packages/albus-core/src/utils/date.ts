/**
 * Generate a W3C-compliant date string from a given date.
 *
 * @param {Date | number | string} date - Optional parameter representing the date to convert.
 * @return {string} Returns a W3C-formatted date string.
 */
export function w3cDate(date?: Date | number | string): string {
  let d: Date
  if (typeof date === 'number' || typeof date === 'string') {
    d = new Date(date)
  } else {
    d = date ?? new Date()
  }
  return `${d.toISOString().slice(0, -5)}Z`
}

/**
 * Converts a W3C date format to a Unix timestamp.
 *
 * @param {Date | number | string} date - The W3C date to convert.
 * @return {number} The Unix timestamp.
 */
export function w3cDateToUnixTs(date?: Date | number | string): number {
  return Math.floor(new Date(date).getTime() / 1000)
}
