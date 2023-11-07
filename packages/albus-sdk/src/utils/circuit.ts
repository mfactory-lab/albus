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

import type { VerifiableCredential } from '@albus-finance/core'
import * as Albus from '@albus-finance/core'
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
export class ProofInputBuilder<T = Record<string, any>> {
  private claimsTree?: ClaimsTree
  private claimsTreeDepth?: number
  private userPrivateKey?: bigint | string
  private trusteePublicKey?: (bigint | string)[][]
  private circuit?: Circuit
  private policy?: Policy
  // Unix timestamp
  private timestamp?: number

  /**
   * Generated proof input data.
   * @readonly
   */
  readonly data: T = {} as T

  constructor(private readonly credential: VerifiableCredential) {
  }

  withTimestamp(value: number) {
    this.timestamp = value
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

  withClaimsTreeDepth(value?: number) {
    this.claimsTreeDepth = value
    return this
  }

  async build() {
    await this.initClaimsTree()
    await Promise.all([this.applyPrivateSignals(), this.applyPublicSignals()])
    return this
  }

  private get publicSignals() {
    return (this.circuit?.publicSignals ?? []).map(parseSignal)
  }

  private get privateSignals() {
    return (this.circuit?.privateSignals ?? []).map(parseSignal)
  }

  /**
   * Initialize the claims tree for the provided credential's credential subject.
   *
   * @throws {Error} Throws an error if the claims tree initialization fails.
   */
  async initClaimsTree() {
    const treeDepth = this.claimsTreeDepth
        // try to find merkle proof in the circuit public signals and get the merkle tree depth
        ?? this.publicSignals.find(s => s?.name.endsWith('Proof') && s?.size > 1)?.size

    this.claimsTree = await Albus.credential.createCredentialTree(this.credential, treeDepth)
  }

  /**
   * Normalize a claim key by trimming space.
   *
   * @param {string} s - The claim key to normalize.
   * @returns {string} The normalized claim key.
   */
  normalizeClaimKey(s: string): string {
    return s.trim().replace(/_/g, '.')
  }

  /**
   * Generate proof input data based on private signals defined in the circuit.
   *
   * @throws {Error} Throws an error if the claims tree is not initialized.
   */
  private async applyPrivateSignals() {
    if (!this.claimsTree) {
      throw new Error('claims tree is not initialized')
    }
    for (const signal of this.privateSignals) {
      // try to apply known signals
      if (this.applySignal(signal)) {
        continue
      }
      // try to apply private credential signal
      await this.applyCredentialSignal(signal, true)
    }
  }

  /**
   * Generate proof input data based on public signals defined in the circuit and policy rules.
   */
  private async applyPublicSignals() {
    for (const signal of this.publicSignals) {
      // try to apply known signal
      if (this.applySignal(signal)) {
        continue
      }
      // try to apply public credential signal
      // if (await this.applyCredentialSignal(signal)) {
      //   continue
      // }
      // try to apply policy signal
      this.applyPolicySignal(signal)
    }
  }

  /**
   * Applies a policy signal to the credential data.
   *
   * @param signal - The signal to apply.
   * @returns {boolean} A boolean indicating whether the signal was successfully applied.
   */
  private applyPolicySignal(signal: ParseSignalResult): boolean {
    const rules = this.policy?.rules
      ?.filter(r => r.key === signal.name || r.key.startsWith(`${signal.name}.`)) ?? []
    if (rules.length > 1 && signal.size > 1) {
      this.data[signal.name] = rules.map(r => Albus.crypto.ffUtils.beBuff2int(Uint8Array.from(r.value)))
      return true
    } else if (rules[0] !== undefined) {
      this.data[signal.name] = Albus.crypto.ffUtils.beBuff2int(Uint8Array.from(rules[0].value))
      return true
    }
    return false
  }

  /**
   * Applies a credential signal to the credential data.
   *
   * @param signal - The signal to apply.
   * @param throwIfUnknown - Whether to throw an error if the signal is not found in the credential.
   * @returns {Promise<boolean>} A boolean indicating whether the signal was successfully applied.
   * @throws An error if the claims tree is not initialized or if the signal is not found in the credential and `throwIfUnknown` is true.
   */
  private async applyCredentialSignal(signal: ParseSignalResult, throwIfUnknown = false) {
    if (!this.claimsTree) {
      throw new Error('claims tree is not initialized')
    }
    const claim = this.normalizeClaimKey(signal.name)
    const proof = await this.claimsTree.get(claim)
    if (!proof.found && throwIfUnknown) {
      throw new Error(`claim "${claim}" is not found in the credential`)
    }
    this.data[signal.name] = proof.value
    this.data[`${signal.name}Key`] = proof.key
    this.data[`${signal.name}Proof`] = proof.siblings
  }

  /**
   * Apply a known signal, such as TrusteePublicKey, UserPrivateKey, CurrentDate, etc.
   *
   * @param {ParseSignalResult} signal - The name of the known signal to apply.
   * @returns {boolean} True if the signal was successfully applied, false otherwise.
   */
  private applySignal(signal: ParseSignalResult): boolean {
    const { name, size } = signal
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
      case KnownSignals.Timestamp: {
        this.data[name] = this.timestamp
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

type ParseSignalResult = {
  name: string
  size: number
  next: ParseSignalResult | null
}
