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

const { leInt2Buff, leBuff2int, unstringifyBigInts, stringifyBigInts } = ffUtils

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
 * Fetches bytes from the specified {@link url}
 */
async function fetchBytes(url: string | Buffer | Uint8Array) {
  if (typeof url === 'string') {
    const { data } = await axios<ArrayBuffer>({ method: 'get', url, responseType: 'arraybuffer' })
    return new Uint8Array(data)
  }
  return Uint8Array.from(url)
}

/**
 * Convert `snarkjs` proof representation to solana format
 */
export function decodeProof(payload: any) {
  for (const i in payload) {
    if (i === 'pi_a' || i === 'pi_c') {
      for (const j in payload[i]) {
        payload[i][j] = finiteToBytes(payload[i][j]).reverse()
      }
    } else if (i === 'pi_b') {
      for (const j in payload[i]) {
        for (const z in payload[i][j]) {
          payload[i][j][z] = finiteToBytes(payload[i][j][z])
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

/**
 * Convert `snarkjs` signals representation to solana format
 */
export function decodePublicSignals(publicSignals: Array<string | number | bigint>) {
  const publicInputsBytes = new Array<Array<number>>()
  for (const i in publicSignals) {
    publicInputsBytes.push(finiteToBytes(publicSignals[i]!).reverse())
  }
  return publicInputsBytes
}

/**
 * Convert `snarkjs` VK representation to solana format
 */
export function decodeVerifyingKey(data: VK) {
  const g1 = (p): number[] => p
    .reduce((a, b) => a.concat(finiteToBytes(b).reverse()), [] as number[]).slice(0, 64)

  const g2 = (p): number[] => p
    .reduce((a, b) =>
      a.concat(finiteToBytes(b[0]!).concat(finiteToBytes(b[1]!)).reverse()), [] as number[],
    ).slice(0, 128)

  return {
    curve: String(data.curve),
    nPublic: String(data.nPublic),
    alpha: g1(data.vk_alpha_1),
    beta: g2(data.vk_beta_2),
    gamma: g2(data.vk_gamma_2),
    delta: g2(data.vk_delta_2),
    ic: data.IC.map(g1) as number[][],
  }
}

/**
 * Convert solana VK representation to `snarkjs` format
 */
export function encodeVerifyingKey(data: {
  alpha: number[]
  beta: number[]
  gamma: number[]
  delta: number[]
  ic: number[][]
  curve?: string
  protocol?: string
}): VK {
  const g1 = (bytes: number[]) => {
    if (bytes.length < 64) {
      throw new Error('G1 point must be 64 long')
    }
    return [bytesToFinite(bytes.slice(0, 32).reverse()), bytesToFinite(bytes.slice(32, 64).reverse()), '1']
  }

  const g2 = (bytes: number[]) => {
    if (bytes.length < 128) {
      throw new Error('G2 point must be 128 long')
    }
    const result: (string)[][] = []
    for (let i = 0; i < bytes.length; i += 64) {
      const chunk = bytes.slice(i, i + 64).reverse()
      result.push([bytesToFinite(chunk.slice(0, 32)), bytesToFinite(chunk.slice(32, 64))])
    }
    result.push(['1', '0'])
    return result
  }

  return {
    curve: data.curve ?? 'bn128',
    protocol: data.protocol ?? 'groth16',
    nPublic: data.ic.length - 1,
    vk_alpha_1: g1(data.alpha),
    vk_beta_2: g2(data.beta),
    vk_gamma_2: g2(data.gamma),
    vk_delta_2: g2(data.delta),
    IC: data.ic.map(g1),
  }
}

/**
 * Convert G1 point to negative representation
 * used for on-chain verify optimization
 */
export async function altBn128G1Neg(input: number[]) {
  const bn128 = await getCurveFromName('bn128', true)
  const changeEndianness = (b: number[]) => [...b.slice(0, 32).reverse(), ...b.slice(32).reverse()]
  return changeEndianness(bn128.G1.neg(Buffer.from(changeEndianness(input))))
}

export function finiteToBytes(n: string | number | bigint) {
  return Array.from<number>(leInt2Buff(unstringifyBigInts(BigInt(n)), 32))
}

export function bytesToFinite(bytes: number[] | Uint8Array): string {
  return stringifyBigInts(leBuff2int(Buffer.from(bytes)))
}
