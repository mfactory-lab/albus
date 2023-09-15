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

import type { VerifiableCredential } from '@mfactory-lab/albus-core'
import * as Albus from '@mfactory-lab/albus-core'
import type { Circuit, Policy } from '../generated'
import { KnownSignals } from '../types'

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

type ClaimsTree = Awaited<ReturnType<typeof Albus.credential.createClaimsTree>>

/**
 * A class for generating proof input data based on
 * provided credentials, policies, and signals.
 */
export class ProofInputBuilder {
  private claimsTree?: ClaimsTree
  private userPrivateKey?: bigint | string
  private trusteePublicKey?: (bigint | string)[][]
  private circuit?: Circuit
  private policy?: Policy
  private now?: Date

  /**
   * Generated proof input data.
   * @readonly
   */
  readonly data = {}

  constructor(private readonly credential: VerifiableCredential) {
  }

  withNow(value: Date) {
    this.now = value
    return this
  }

  withPolicy(value: Policy) {
    this.policy = value
    return this
  }

  withCircuit(value: Circuit) {
    this.circuit = value
    return this
  }

  withUserPrivateKey(value?: bigint | string) {
    this.userPrivateKey = value
    return this
  }

  withTrusteePublicKey(value?: [bigint, bigint][]) {
    this.trusteePublicKey = value
    return this
  }

  async build() {
    await this.initClaimsTree()
    await Promise.all([this.applyPrivate(), this.applyPublic()])
    return this
  }

  /**
   * Initialize the claims tree for the provided credential's credential subject.
   *
   * @throws {Error} Throws an error if the claims tree initialization fails.
   */
  async initClaimsTree() {
    this.claimsTree = await Albus.credential.createClaimsTree(this.credential.credentialSubject)
  }

  /**
   * Normalize a claim key by trimming whitespace.
   *
   * @param {string} s - The claim key to normalize.
   * @returns {string} The normalized claim key.
   */
  normalizeClaimKey(s: string): string {
    return s.trim()
  }

  /**
   * Generate proof input data based on private signals defined in the circuit.
   *
   * @throws {Error} Throws an error if the claims tree is not initialized.
   */
  private async applyPrivate() {
    if (!this.claimsTree) {
      throw new Error('claims tree is not initialized')
    }
    for (const signal of this.circuit?.privateSignals ?? []) {
      if (this.applySignal(signal)) {
        continue
      }
      const claim = this.normalizeClaimKey(signal)
      if (this.credential.credentialSubject[claim] !== undefined) {
        const [key, ...proof] = await this.claimsTree.proof(claim)
        this.data[signal] = this.credential.credentialSubject[claim] ?? 0
        this.data[`${signal}Proof`] = proof
        this.data[`${signal}Key`] = key
      }
    }
  }

  /**
   * Generate proof input data based on public signals defined in the circuit and policy rules.
   */
  private async applyPublic() {
    for (const signal of this.circuit?.publicSignals ?? []) {
      if (!this.applySignal(signal)) {
        const sig = parseSignal(signal)
        if (sig === null) {
          continue
        }
        // try to apply policy rules if is not known signal
        const rules = this.policy?.rules
          ?.filter(r => r.key === sig.name || r.key.startsWith(`${sig.name}.`)) ?? []
        if (rules.length > 1 && sig.size > 1) {
          this.data[sig.name] = rules.map(r => r.value)
        } else if (rules[0] !== undefined) {
          this.data[sig.name] = rules[0].value
        }
      }
    }
  }

  /**
   * Apply a known signal, such as TrusteePublicKey, UserPrivateKey, CurrentDate, etc.
   *
   * @param {string} signal - The name of the known signal to apply.
   * @returns {boolean} True if the signal was successfully applied, false otherwise.
   */
  private applySignal(signal: string): boolean {
    const sig = parseSignal(signal)
    if (!sig) {
      return false
    }
    const { name, size } = sig
    switch (name) {
      case KnownSignals.TrusteePublicKey:
        if (this.trusteePublicKey === undefined) {
          throw new Error('The trustee public keys are not defined.')
        }
        if (this.trusteePublicKey.length < size) {
          throw new Error(`The size of the trustee public keys is incorrect. It must be ${size}.`)
        }
        this.data[name] = this.trusteePublicKey
        return true
      case KnownSignals.UserPrivateKey:
        if (this.userPrivateKey === undefined) {
          throw new Error('The user private key is not defined.')
        }
        this.data[name] = this.userPrivateKey
        return true
      case KnownSignals.CurrentDate: {
        this.data[name] = formatCircuitDate(this.now)
        return true
      }
      case KnownSignals.CredentialRoot:
        this.data[name] = this.credential.proof.rootHash
        return true
      case KnownSignals.IssuerPublicKey:
        this.data[name] = [
          this.credential.proof.proofValue.ax,
          this.credential.proof.proofValue.ay,
        ]
        return true
      case KnownSignals.IssuerSignature:
        this.data[name] = [
          this.credential.proof.proofValue.r8x,
          this.credential.proof.proofValue.r8y,
          this.credential.proof.proofValue.s,
        ]
        return true
    }
    return false
  }
}

/**
 * Generate signals map
 *
 * @param symbols
 * @param inputs
 */
export function getSignals(symbols: string[], inputs: bigint[]): Record<string, bigint | bigint[] | bigint[][]> {
  let idx = 0
  const map = {}

  function assignValue(sig: ParseSignalResult): any {
    if (sig.next) {
      const result = Array(sig.size).fill(null).map(() => assignValue(sig.next!))
      return sig.size === 1 ? result[0] : result
    }
    if (sig.size === 1) {
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

// /**
//  * Parse a symbol with a name like 'symbol[5][3]' into its components.
//  *
//  * @param {string} s - The symbol name to parse.
//  * @returns {[string, number, number]} An array containing the parsed signal name, size, and subsize.
//  */
// function parseSymbol(s: string): [string, number, number] {
//   const r = s.match(/^(\w+)(?:\[(\d+)](?:\[(\d+)])?)?$/)
//   return r ? [r[1]!, r[2] ? Number(r[2]) : 1, r[3] ? Number(r[3]) : 1] : ['', 0, 0]
// }

function parseSignal(signal: string): ParseSignalResult | null {
  if (signal.length === 0) {
    return null
  }
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
    return { name, size: 1, next: null }
  }
  return { name: signal, size: 1, next: null }
}

interface ParseSignalResult {
  name: string
  size: number
  next: ParseSignalResult | null
}
