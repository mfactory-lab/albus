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

import assert from 'node:assert'
import { randomBytes } from '@stablelib/random'
import { F1Field, Scalar, utils } from '../ff'
import { arrayToBigInt } from '../utils'
import op from './poseidon_constants.json'

type EcdhSharedKey = bigint[]

export const OPT = utils.unstringifyBigInts(op) as {
  C: bigint[][]
  S: bigint[][]
  M: bigint[][][]
  P: bigint[][][]
}

const N_ROUNDS_F = 8
const N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68]
const SPONGE_INPUTS = 16
const SPONGE_CHUNK_SIZE = 31

const F = new F1Field(
  Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617'),
)
const pow5 = (a: bigint): bigint => F.mul(a, F.square(F.square(a)))

const two128 = F.e('340282366920938463463374607431768211456')

// circomlibjs Poseidon bn128
export class Poseidon {
  static F = F

  static hash(inputs: bigint[]): bigint {
    if (!(inputs.length > 0 && inputs.length <= N_ROUNDS_P.length)) {
      throw new Error('Invalid inputs')
    }

    const t = inputs.length + 1
    const nRoundsF = N_ROUNDS_F
    const nRoundsP = N_ROUNDS_P[t - 2]!
    const C = OPT.C[t - 2]!
    const S = OPT.S[t - 2]!
    const M = OPT.M[t - 2]!
    const P = OPT.P[t - 2]!

    let state: bigint[] = [F.zero, ...inputs.map(a => F.e(a) as bigint)]

    state = state.map((a, i) => F.add(a, C[i]!))

    for (let r = 0; r < nRoundsF / 2 - 1; r++) {
      state = state.map(a => pow5(a))
      state = state.map((a, i) => F.add(a, C[(r + 1) * t + i]!))
      state = state.map((_, i) =>
        state.reduce((acc, a, j) => F.add(acc, F.mul(M[j]![i]!, a)), F.zero),
      )
    }
    state = state.map(a => pow5(a))
    state = state.map((a, i) => F.add(a, C[(nRoundsF / 2 - 1 + 1) * t + i]!))
    state = state.map((_, i) => state.reduce((acc, a, j) => F.add(acc, F.mul(P[j]![i]!, a)), F.zero))
    for (let r = 0; r < nRoundsP; r++) {
      state[0] = pow5(state[0]!)
      state[0] = F.add(state[0], C[(nRoundsF / 2 + 1) * t + r]!)

      const s0 = state.reduce((acc, a, j) => {
        return F.add(acc, F.mul(S[(t * 2 - 1) * r + j]!, a))
      }, F.zero)
      for (let k = 1; k < t; k++) {
        state[k] = F.add(state[k]!, F.mul(state[0], S[(t * 2 - 1) * r + t + k - 1]!))
      }
      state[0] = s0
    }
    for (let r = 0; r < nRoundsF / 2 - 1; r++) {
      state = state.map(a => pow5(a))
      state = state.map((a, i) => F.add(a, C[(nRoundsF / 2 + 1) * t + nRoundsP + r * t + i]!))
      state = state.map((_, i) =>
        state.reduce((acc, a, j) => F.add(acc, F.mul(M[j]![i]!, a)), F.zero),
      )
    }
    state = state.map(a => pow5(a))
    state = state.map((_, i) => state.reduce((acc, a, j) => F.add(acc, F.mul(M[j]![i]!, a)), F.zero))

    return F.normalize(state[0]!)
  }

  // HashBytes returns a sponge hash of a msg byte slice split into blocks of 31 bytes
  static hashBytes(msg: Uint8Array): bigint {
    return Poseidon.hashBytesX(msg, SPONGE_INPUTS)
  }

  // hashBytesX returns a sponge hash of a msg byte slice split into blocks of 31 bytes
  static hashBytesX(msg: Uint8Array, frameSize: number): bigint {
    const inputs = Array.from({ length: frameSize }).fill(0n) as bigint[]
    let dirty = false
    let hash!: bigint

    let k = 0
    for (let i = 0; i < Number.parseInt(`${msg.length / SPONGE_CHUNK_SIZE}`); i += 1) {
      dirty = true
      inputs[k] = utils.beBuff2int(msg.slice(SPONGE_CHUNK_SIZE * i, SPONGE_CHUNK_SIZE * (i + 1)))
      if (k === frameSize - 1) {
        hash = Poseidon.hash(inputs)
        dirty = false
        inputs[0] = hash
        inputs.fill(BigInt(0), 1, SPONGE_CHUNK_SIZE)
        for (let j = 1; j < frameSize; j += 1) {
          inputs[j] = BigInt(0)
        }
        k = 1
      } else {
        k += 1
      }
    }

    if (msg.length % SPONGE_CHUNK_SIZE !== 0) {
      const buff = new Uint8Array(SPONGE_CHUNK_SIZE)
      const slice = msg.slice(Number.parseInt(`${msg.length / SPONGE_CHUNK_SIZE}`) * SPONGE_CHUNK_SIZE)
      slice.forEach((v, idx) => {
        buff[idx] = v
      })
      inputs[k] = utils.beBuff2int(buff)
      dirty = true
    }

    if (dirty) {
      // we haven't hashed something in the main sponge loop and need to do hash here
      hash = Poseidon.hash(inputs)
    }

    return hash
  }

  // SpongeHashX returns a sponge hash of inputs using Poseidon with configurable frame size
  static spongeHashX(inputs: bigint[], frameSize: number): bigint {
    if (frameSize < 2 || frameSize > 16) {
      throw new Error('incorrect frame size')
    }

    // not used frame default to zero
    let frame = Array.from({ length: frameSize }).fill(0n) as bigint[]

    let dirty = false
    let hash!: bigint

    let k = 0
    for (let i = 0; i < inputs.length; i++) {
      dirty = true
      frame[k] = inputs[i]!
      if (k === frameSize - 1) {
        hash = this.hash(frame)
        dirty = false
        frame = Array.from({ length: frameSize }).fill(0n) as bigint[]
        frame[0] = hash
        k = 1
      } else {
        k++
      }
    }

    if (dirty) {
      // we haven't hashed something in the main sponge loop and need to do hash here
      hash = this.hash(frame)
    }

    if (!hash) {
      throw new Error('hash is undefined')
    }

    return hash
  }

  static genRandomNonce(): bigint {
    const max = two128
    // Prevent modulo bias
    const lim = F.e('0x10000000000000000000000000000000000000000000000000000000000000000')
    const min = F.mod(F.sub(lim, max), max)

    let rand: bigint
    while (true) {
      rand = arrayToBigInt(randomBytes(32))
      if (rand >= min) {
        break
      }
    }

    const nonce: bigint = F.mod(F.e(rand), max)
    assert(nonce < max)

    return nonce
  }

  static encrypt(msg: any[], sharedKey: EcdhSharedKey, nonce = BigInt(0)) {
    msg = msg.map(x => F.e(x))

    // The nonce must be less than 2 ^ 128
    assert(nonce < two128)

    const message: any[] = [...msg]

    // Pad the message if needed
    while (message.length % 3 > 0) {
      message.push(F.zero)
    }

    const cipherLength = message.length

    // Create the initial state
    let state = [
      F.zero,
      F.e(sharedKey[0]),
      F.e(sharedKey[1]),
      F.add(
        F.e(nonce),
        F.mul(F.e(msg.length), two128),
      ),
    ]

    const ciphertext: bigint[] = []

    for (let i = 0; i < cipherLength / 3; i++) {
      // Iterate Poseidon on the state
      state = poseidonStrategy(state)

      // Absorb three elements of message
      state[1] = F.add(state[1], BigInt(message[i * 3]))
      state[2] = F.add(state[2], BigInt(message[i * 3 + 1]))
      state[3] = F.add(state[3], BigInt(message[i * 3 + 2]))

      // Release three elements of the ciphertext
      ciphertext.push(state[1])
      ciphertext.push(state[2])
      ciphertext.push(state[3])
    }

    // Iterate Poseidon on the state one last time
    state = poseidonStrategy(state)

    // Release the last ciphertext element
    ciphertext.push(state[1])

    return ciphertext
  }

  static decrypt(ciphertext: bigint[], sharedKey: EcdhSharedKey, length: number, nonce: bigint = BigInt(0)) {
    assert(nonce < two128)

    // Create the initial state
    let state = [
      F.zero,
      F.e(sharedKey[0]),
      F.e(sharedKey[1]),
      F.add(
        F.e(nonce),
        F.mul(F.e(length), two128),
      ),
    ]

    const message: any[] = []

    const n = Math.floor(ciphertext.length / 3)

    for (let i = 0; i < n; i++) {
      // Iterate Poseidon on the state
      state = poseidonStrategy(state)

      // Release three elements of the message
      message.push(F.sub(ciphertext[i * 3], state[1]))
      message.push(F.sub(ciphertext[i * 3 + 1], state[2]))
      message.push(F.sub(ciphertext[i * 3 + 2], state[3]))

      // Modify the state
      state[1] = ciphertext[i * 3]
      state[2] = ciphertext[i * 3 + 1]
      state[3] = ciphertext[i * 3 + 2]
    }

    // If length > 3, check if the last (3 - (l mod 3)) elements of the message
    // are 0
    if (length > 3) {
      if (length % 3 === 2) {
        assert(F.eq(message[message.length - 1], F.zero))
      } else if (length % 3 === 1) {
        assert(F.eq(message[message.length - 1], F.zero))
        assert(F.eq(message[message.length - 2], F.zero))
      }
    }

    // Iterate Poseidon on the state one last time
    state = poseidonStrategy(state)

    // Check the last ciphertext element
    assert(F.eq(ciphertext[ciphertext.length - 1], state[1]))

    return message.slice(0, length)
  }
}

function poseidonStrategy(state) {
  assert(state.length > 0)
  assert(state.length < N_ROUNDS_P.length)

  const t = state.length
  const nRoundsF = N_ROUNDS_F
  const nRoundsP = N_ROUNDS_P[t - 2]

  state = state.map(x => F.e(x))
  for (let r = 0; r < nRoundsF + nRoundsP; r++) {
    state = state.map((a, i) => F.add(a, OPT.C[t - 2][r * t + i]))

    if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
      state = state.map(a => pow5(a))
    } else {
      state[0] = pow5(state[0])
    }

    state = state.map((_, i) =>
      state.reduce((acc, a, j) => F.add(acc, F.mul(OPT.M[t - 2][i][j], a)), F.zero),
    )
  }
  return state.map(x => F.normalize(x))
}

export const poseidon = Poseidon
