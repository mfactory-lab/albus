/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

/**
 * Format a `Date` to a circuit-like format 'YYYYMMDD'.
 *
 * @param {Date} [date] - Optional date object to format; defaults to the current date if not provided.
 * @returns {string} A string representing the formatted date.
 */
export function formatCircuitDate(date?: Date): string {
  const d = date ?? new Date()
  return [
    String(d.getUTCFullYear()),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('')
}

/**
 * Generate signals map
 */
export function getSignals(symbols: string[], inputs: bigint[]): Record<string, bigint | bigint[] | bigint[][]> {
  let idx = 0
  const map = {}

  function assignValue(sig: ParseSignalResult): any {
    if (sig.next) {
      const result = Array(sig.size).fill(null).map(() => assignValue(sig.next!))
      return sig.size <= 1 ? result[0] : result
    }
    if (sig.size <= 1) {
      return inputs[idx++]
    }
    return Array(sig.size).fill(null).map(() => inputs[idx++])
  }

  for (const symbol of symbols) {
    const sig = parseSignal(symbol)
    if (sig) {
      map[sig.name] ||= assignValue(sig)
    }
  }

  return map
}

/**
 * Parses a signal string into its name, size, and next signal.
 *
 * @param {string} signal - The signal string to parse.
 * @returns {ParseSignalResult | null} An object containing the name, size, and next signal, or null if the signal is invalid.
 */
export function parseSignal(signal: string): ParseSignalResult {
  const open = signal.indexOf('[')
  const close = signal.indexOf(']')
  if (open !== -1 && close !== -1 && open < close) {
    const name = signal.slice(0, open)
    const numberStr = signal.slice(open + 1, close)
    const size = Number.parseInt(numberStr, 10)
    if (!Number.isNaN(size)) {
      const remaining = signal.slice(close + 1)
      return { name, size, next: parseSignal(remaining) }
    }
    return { name, size: 0, next: null }
  }
  return { name: signal, size: 0, next: null }
}

export type ParseSignalResult = {
  name: string
  size: number
  next: ParseSignalResult | null
}
