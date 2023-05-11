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

import fs from 'node:fs'

/**
 * Read circom `sym` file
 * @param {string} path
 * @returns {{signals: any, symbols: any}}
 */
export function readSymbols(path: string) {
  const symbols: any = {}
  const signals: any = {}

  const symsStr = fs.readFileSync(path).toString()
  const lines = symsStr.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const arr = lines[i].split(',')
    if (arr.length !== 4) {
      continue
    }
    const symbol = arr[3]
    const labelIdx = Number(arr[0])
    const varIdx = Number(arr[1])
    const componentIdx = Number(arr[2])
    symbols[symbol] = {
      labelIdx,
      varIdx,
      componentIdx,
    }
    if (signals[varIdx] == null) {
      signals[varIdx] = [symbol]
    } else {
      signals[varIdx].push(symbol)
    }
  }
  return { symbols, signals }
}
