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

import { readFileSync } from 'node:fs'
import type { WasmTester } from 'circom_tester'
import { wasm as circomTester } from 'circom_tester'

const FIXTURES_BASE_PATH = '../circuits'

export function setupCircuit(name: string) {
  return circomTester(`${FIXTURES_BASE_PATH}/${name}.circom`, {
    include: ['../../node_modules'],
  })
}

export function loadFixture(name: string) {
  return readFileSync(`${FIXTURES_BASE_PATH}/${name}`)
}

export async function calculateLabeledWitness(tester: WasmTester, input: unknown, sanityCheck: boolean) {
  const witness = await tester.calculateWitness(input, sanityCheck)

  if (!tester.symbols) {
    await tester.loadSymbols()
  }

  const labels: { [label: string]: string | undefined } = {}

  for (const n in tester.symbols) {
    let v: string
    if (typeof witness[tester.symbols[n]!.varIdx] !== 'undefined') {
      v = witness[tester.symbols[n]!.varIdx].toString()
    } else {
      v = 'undefined'
    }
    labels[n] = v
  }

  return labels
}
