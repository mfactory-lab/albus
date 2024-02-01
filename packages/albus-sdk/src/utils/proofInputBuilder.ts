import * as Albus from '@albus-finance/core'
import type { VerifiableCredential } from '@albus-finance/core'
import type { Circuit, Policy } from '../generated'
import { KnownSignals } from '../types'
import type { ParseSignalResult } from './circuit'
import { parseSignal } from './circuit'

type ClaimsTree = Awaited<ReturnType<typeof Albus.credential.createClaimsTree>>
type TrusteeLoader = () => Promise<[bigint, bigint][]>

/**
 * A class for generating proof input data based on
 * provided credentials, policies, and signals.
 */
export class ProofInputBuilder<T = Record<string, any>> {
  private claimsTree?: ClaimsTree
  private claimsTreeDepth?: number
  private userPrivateKey?: bigint | string
  private trusteePublicKey?: (bigint | string)[][]
  private trusteeLoader?: TrusteeLoader
  private circuit?: Circuit
  private policy?: Policy
  // Unix timestamp
  private timestamp?: number
  private timestampLoader?: () => Promise<number>

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

  withTimestampLoader(value?: () => Promise<number>) {
    this.timestampLoader = value
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

  withUserPrivateKey(value?: Uint8Array) {
    if (value !== undefined) {
      this.userPrivateKey = Albus.zkp.formatPrivKeyForBabyJub(value)
    }
    return this
  }

  withTrusteePublicKey(value?: [bigint, bigint][]) {
    this.trusteePublicKey = value
    return this
  }

  withTrusteeLoader(value?: TrusteeLoader) {
    this.trusteeLoader = value
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
      if (await this.applySignal(signal)) {
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
      if (await this.applySignal(signal)) {
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
  private async applySignal(signal: ParseSignalResult): Promise<boolean> {
    const { name, size } = signal
    switch (name) {
      case KnownSignals.TrusteePublicKey:
        if (this.trusteePublicKey === undefined && this.trusteeLoader !== undefined) {
          this.trusteePublicKey = await this.trusteeLoader()
        }
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
        this.data[name] = this.timestampLoader !== undefined
          ? await this.timestampLoader()
          : this.timestamp
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
