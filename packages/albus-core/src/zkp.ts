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

import { Buffer } from 'node:buffer'
import { utils as ffUtils, getCurveFromName } from 'ffjavascript'
import axios from 'axios'
import type { ProofData, PublicSignals, VK } from 'snarkjs'
import { groth16 } from 'snarkjs'

const { leInt2Buff, unstringifyBigInts } = ffUtils

interface GenerateProofProps {
  wasmFile: string | Buffer
  zkeyFile: string | Buffer
  input?: Parameters<typeof groth16.fullProve>[0]
  logger?: unknown
}

/**
 * Generates a proof using the `groth16` proof system.
 * @returns {Promise<SNARK>}
 */
export async function generateProof(props: GenerateProofProps) {
  const wasmFile = await fetchBytes(props.wasmFile)
  const zkeyFile = await fetchBytes(props.zkeyFile)

  return groth16.fullProve(
    props.input ?? {},
    { type: 'mem', data: wasmFile },
    { type: 'mem', data: zkeyFile },
    props.logger,
  )
}

interface VerifyProofProps {
  vk: VK
  publicInput?: PublicSignals
  proof: ProofData
  logger?: unknown
}

/**
 * Verify ZKP Proof
 */
export async function verifyProof(props: VerifyProofProps) {
  return groth16.verify(props.vk, props.publicInput ?? [], props.proof, props.logger)
}

/**
 * Fetches bytes from the specified URL
 */
async function fetchBytes(url: string | Buffer | Uint8Array) {
  if (typeof url === 'string') {
    const { data } = await axios<ArrayBuffer>({ method: 'get', url, responseType: 'arraybuffer' })
    return new Uint8Array(data)
  }
  return Uint8Array.from(url)
}

export function parseFiniteNumber(n: string | number | bigint) {
  return Array.from<number>(leInt2Buff(unstringifyBigInts(BigInt(n)), 32))
}

export function parseProofToBytesArray(payload: any) {
  for (const i in payload) {
    if (i === 'pi_a' || i === 'pi_c') {
      for (const j in payload[i]) {
        payload[i][j] = parseFiniteNumber(payload[i][j]).reverse()
      }
    } else if (i === 'pi_b') {
      for (const j in payload[i]) {
        for (const z in payload[i][j]) {
          payload[i][j][z] = parseFiniteNumber(payload[i][j][z])
        }
      }
    }
  }

  return {
    a: [payload.pi_a[0], payload.pi_a[1]].flat(),
    b: [
      payload.pi_b[0].flat().reverse(),
      payload.pi_b[1].flat().reverse(),
    ].flat(),
    c: [payload.pi_c[0], payload.pi_c[1]].flat(),
  }
}

export function parseToBytesArray(publicSignals: Array<string | number | bigint>) {
  const publicInputsBytes = new Array<Array<number>>()
  for (const i in publicSignals) {
    publicInputsBytes.push(parseFiniteNumber(publicSignals[i]!).reverse())
  }
  return publicInputsBytes
}

export function parseVerifyingKey(data: VK) {
  const g1 = (p: number[]) => p
    .reduce((a, b) =>
      a.concat(parseFiniteNumber(b).reverse()), [] as number[],
    ).slice(0, 64)

  const g2 = (p: number[][]) => p
    .reduce((a, b) =>
      a.concat(parseFiniteNumber(b[0]!).concat(parseFiniteNumber(b[1]!)).reverse()), [] as number[],
    ).slice(0, 128)

  return {
    curve: data.curve,
    nPublic: data.nPublic,
    alpha: g1(data.vk_alpha_1),
    beta: g2(data.vk_beta_2),
    gamma: g2(data.vk_gamma_2),
    delta: g2(data.vk_delta_2),
    ic: data.IC.map(g1),
  }
}

export async function altBn128G1Neg(input: number[]) {
  const bn128 = await getCurveFromName('bn128', true)
  const changeEndianness = (b: number[]) => [...b.slice(0, 32).reverse(), ...b.slice(32).reverse()]
  return changeEndianness(bn128.G1.neg(Buffer.from(changeEndianness(input))))
}
