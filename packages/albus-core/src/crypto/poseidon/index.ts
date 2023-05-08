import assert from 'node:assert'
import * as crypto from 'node:crypto'
import * as ff from 'ffjavascript'
import constants from './poseidon_constants.json'

const Scalar = ff.Scalar
const ZqField = ff.ZqField
const { unstringifyBigInts } = ff.utils

type EcdhSharedKey = BigInt[]

const SNARK_FIELD_SIZE = BigInt(
  '0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001',
)

const F = new ZqField(Scalar.fromString(SNARK_FIELD_SIZE.toString()))

// Parameters are generated by a reference script https://extgit.iaik.tugraz.at/krypto/hadeshash/-/blob/master/code/generate_parameters_grain.sage
// Used like so: sage generate_parameters_grain.sage 1 0 254 2 8 56 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
const { C, M } = unstringifyBigInts(constants)

// Using recommended parameters from whitepaper https://eprint.iacr.org/2019/458.pdf (table 2, table 8)
// Generated by https://extgit.iaik.tugraz.at/krypto/hadeshash/-/blob/master/code/calc_round_numbers.py
// And rounded up to the nearest integer that divides by t
const N_ROUNDS_F = 8
const N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63]

function pow5(a) {
  return F.mul(a, F.square(F.square(a, a)))
}

function poseidonStrategy(state) {
  assert(state.length > 0)
  assert(state.length < N_ROUNDS_P.length)

  const t = state.length
  const nRoundsF = N_ROUNDS_F
  const nRoundsP = N_ROUNDS_P[t - 2]

  state = state.map(x => F.e(x))
  for (let r = 0; r < nRoundsF + nRoundsP; r++) {
    state = state.map((a, i) => F.add(a, C[t - 2][r * t + i]))

    if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
      state = state.map(a => pow5(a))
    } else {
      state[0] = pow5(state[0])
    }

    state = state.map((_, i) =>
      state.reduce((acc, a, j) => F.add(acc, F.mul(M[t - 2][i][j], a)), F.zero),
    )
  }
  return state.map(x => F.normalize(x))
}

const two128 = F.e('340282366920938463463374607431768211456')

function genRandomNonce(): BigInt {
  const max = two128
  // Prevent modulo bias
  const lim = F.e('0x10000000000000000000000000000000000000000000000000000000000000000')
  const min = F.mod(F.sub(lim, max), max)

  let rand
  while (true) {
    rand = BigInt(`0x${crypto.randomBytes(32).toString('hex')}`)

    if (rand >= min) {
      break
    }
  }

  const nonce: BigInt = F.mod(F.e(rand), max)
  assert(nonce < max)

  return nonce
}

function poseidonEncrypt(
  msg: any[],
  sharedKey: EcdhSharedKey,
  nonce = BigInt(0),
) {
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

  const ciphertext: BigInt[] = []

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

function poseidonDecrypt(
  ciphertext: BigInt[],
  sharedKey: EcdhSharedKey,
  length: number,
  nonce: BigInt = BigInt(0),
) {
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

export {
  poseidonStrategy,
  poseidonEncrypt,
  poseidonDecrypt,
  genRandomNonce,
}