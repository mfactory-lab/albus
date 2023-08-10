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

import axios from 'axios'
import { groth16 } from 'snarkjs'
import { utils as ffUtils, getCurveFromName } from 'ffjavascript'
import type { ProofData, PublicSignals, VK } from 'snarkjs'
import * as Albus from './index'

const { leInt2Buff, leBuff2int, unstringifyBigInts, stringifyBigInts } = ffUtils

interface GenerateProofProps {
  wasmFile: string | Uint8Array
  zkeyFile: string | Uint8Array
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
async function fetchBytes(url: string | Uint8Array) {
  if (typeof url === 'string') {
    const { data } = await axios<ArrayBuffer>({ method: 'get', url, responseType: 'arraybuffer' })
    return new Uint8Array(data)
  }
  return Uint8Array.from(url)
}

/**
 * Encode snarkjs {@link ProofData} to bytes format
 */
export async function encodeProof(payload: ProofData) {
  return {
    a: await Albus.zkp.altBn128G1Neg(encodeG1(payload.pi_a)),
    b: encodeG2(payload.pi_b),
    c: encodeG1(payload.pi_c),
  }
}

/**
 * Decode proof bytes to snarkjs format
 */
export async function decodeProof(proof: {
  a: number[] /* size: 64 */
  b: number[] /* size: 128 */
  c: number[] /* size: 64 */
}) {
  return {
    curve: 'bn128',
    protocol: 'groth16',
    pi_a: decodeG1(await Albus.zkp.altBn128G1Neg(proof.a)),
    pi_b: decodeG2(proof.b),
    pi_c: decodeG1(proof.c),
  }
}

/**
 * Encode snarkjs signals to bytes format
 */
export function encodePublicSignals(publicSignals: Array<string | number | bigint>) {
  const publicInputsBytes = new Array<number[]>()
  for (const s of publicSignals) {
    publicInputsBytes.push(finiteToBytes(s).reverse())
  }
  return publicInputsBytes
}

/**
 * Decode public signals to snarkjs format
 */
export function decodePublicSignals(publicSignals: Array<number[]>) {
  const publicInputsBytes = new Array<string>()
  for (const s of publicSignals) {
    publicInputsBytes.push(bytesToFinite(s.reverse()))
  }
  return publicInputsBytes
}

/**
 * Encode snarkjs VK to bytes format
 */
export function encodeVerifyingKey(data: VK) {
  return {
    curve: String(data.curve),
    nPublic: String(data.nPublic),
    alpha: encodeG1(data.vk_alpha_1),
    beta: encodeG2(data.vk_beta_2),
    gamma: encodeG2(data.vk_gamma_2),
    delta: encodeG2(data.vk_delta_2),
    ic: data.IC.map(encodeG1) as number[][],
  }
}

/**
 * Decode bytes VK to snarkjs format
 */
export function decodeVerifyingKey(data: {
  alpha: number[]
  beta: number[]
  gamma: number[]
  delta: number[]
  ic: number[][]
  curve?: string
  protocol?: string
}): VK {
  return {
    curve: data.curve ?? 'bn128',
    protocol: data.protocol ?? 'groth16',
    nPublic: data.ic.length - 1,
    vk_alpha_1: decodeG1(data.alpha),
    vk_beta_2: decodeG2(data.beta),
    vk_gamma_2: decodeG2(data.gamma),
    vk_delta_2: decodeG2(data.delta),
    IC: data.ic.map(decodeG1),
  }
}

/**
 * Convert G1 point to negative representation
 * used for on-chain verify optimization
 */
export async function altBn128G1Neg(input: number[]) {
  const bn128 = await getCurveFromName('bn128', true)
  const changeEndianness = (b: number[]) => [...b.slice(0, 32).reverse(), ...b.slice(32).reverse()]
  return changeEndianness(bn128.G1.neg(Uint8Array.from(changeEndianness(input))))
}

export function finiteToBytes(n: string | number | bigint) {
  return Array.from<number>(leInt2Buff(unstringifyBigInts(BigInt(n)), 32))
}

export function bytesToFinite(bytes: number[] | Uint8Array): string {
  return stringifyBigInts(leBuff2int(Uint8Array.from(bytes)))
}

/**
 * Convert G1 (snarkjs) to bytes
 */
function encodeG1(p): number[] {
  return p
    .reduce((a, b) => a.concat(finiteToBytes(b).reverse()), [] as number[]).slice(0, 64)
}

/**
 * Convert G2 (snarkjs) to bytes
 */
function encodeG2(p): number[] {
  return p
    .reduce((a, b) =>
      a.concat(finiteToBytes(b[0]).concat(finiteToBytes(b[1])).reverse()), [] as number[],
    ).slice(0, 128)
}

function decodeG1(bytes: number[]) {
  if (bytes.length < 64) {
    throw new Error('G1 point must be 64 long')
  }
  return [bytesToFinite(bytes.slice(0, 32).reverse()), bytesToFinite(bytes.slice(32, 64).reverse()), '1']
}

function decodeG2(bytes: number[]) {
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
