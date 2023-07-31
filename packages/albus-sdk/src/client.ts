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

import type { Buffer } from 'node:buffer'
import type { VerifiablePresentation } from '@albus/core'
import * as Albus from '@albus/core'
import type { Wallet } from '@coral-xyz/anchor'
import { AnchorProvider } from '@coral-xyz/anchor'
import type { ConfirmOptions, Connection, PublicKeyInitData } from '@solana/web3.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { CircuitManager } from './circuitManager'
import { CredentialManager } from './credentialManager'
import { EventManager } from './eventManager'
import type { Circuit, Policy } from './generated'
import { PROGRAM_ID } from './generated'
import { PdaManager } from './pda'
import { PolicyManager } from './policyManager'
import { ProofRequestManager } from './proofRequestManager'
import { ServiceManager } from './serviceManager'
import { BundlrStorageDriver } from './StorageDriver'
import { KnownSignals } from './types'
import { formatCircuitDate } from './utils'

export class AlbusClient {
  programId = PROGRAM_ID

  pda: PdaManager
  circuit: CircuitManager
  policy: PolicyManager
  service: ServiceManager
  credential: CredentialManager
  proofRequest: ProofRequestManager
  storage: BundlrStorageDriver
  eventManager: EventManager

  constructor(
    readonly provider: AnchorProvider,
  ) {
    this.pda = new PdaManager()
    this.eventManager = new EventManager(this)
    this.circuit = new CircuitManager(this.provider, this.pda)
    this.policy = new PolicyManager(this.provider, this.pda)
    this.service = new ServiceManager(this.provider, this.pda)
    this.credential = new CredentialManager(this.provider, this.pda)
    this.proofRequest = new ProofRequestManager(this.provider, this.pda)
    this.storage = new BundlrStorageDriver(this.provider)
  }

  static factory(connection: Connection, wallet?: Wallet, opts: ConfirmOptions = {}) {
    wallet = wallet ?? { publicKey: PublicKey.default } as unknown as Wallet
    return new this(new AnchorProvider(connection, wallet, opts))
  }

  get connection() {
    return this.provider.connection
  }

  utils = {
    normalizePublicInput: (n) => {
      return Albus.zkp.finiteToBytes(n).reverse()
    },
    currentDate: async (useRpc = true) => {
      let date
      if (useRpc) {
        const slot = await this.connection.getSlot()
        const timestamp = (await this.connection.getBlockTime(slot)) ?? 0
        date = new Date(timestamp * 1000)
      } else {
        date = new Date()
      }
      return formatCircuitDate(date)
    },
  }

  /**
   * Verify ZK-Proof
   */
  async verify(props: VerifyProps) {
    const circuit = await this.circuit.load(props.circuit)
    return Albus.zkp.verifyProof({
      vk: Albus.zkp.encodeVerifyingKey(circuit.vk),
      publicInput: props.publicInput,
      proof: props.proof,
    })
  }

  /**
   * Prove the {@link ProofRequest}
   * - Create Verifiable Presentation
   * - Encrypt Verifiable Presentation
   * - Generate ZK-Proof
   * - Upload Verifiable Presentation to arweave
   * - Verify ZK-Proof on-chain
   */
  async prove(props: ProveProps) {
    const { proofRequest, circuit, policy } = await this.proofRequest.loadFull(props.proofRequest)
    if (!circuit) {
      throw new Error(`Unable to find Circuit account at ${proofRequest.circuit}`)
    }
    if (!policy) {
      throw new Error(`Unable to find Policy account at ${proofRequest.policy}`)
    }

    const vc = await this.credential.load(props.vc, { decryptionKey: props.decryptionKey })

    const vp = await Albus.credential.createVerifiablePresentation({
      credentials: [vc],
      exposedFields: props.exposedFields,
      holderSecretKey: props.holderSecretKey,
    })

    const input = await this.prepareInputs(circuit, policy, vp)
    const holder = Keypair.fromSecretKey(Uint8Array.from(props.holderSecretKey))

    const encryptedPresentation = await Albus.credential.encryptVerifiablePresentation(vp, {
      pubkey: holder.publicKey,
      // encryptionKey: [],
    })

    let proofResult: Awaited<ReturnType<typeof Albus.zkp.generateProof>>

    try {
      proofResult = await Albus.zkp.generateProof({
        wasmFile: circuit.wasmUri!,
        zkeyFile: circuit.zkeyUri!,
        input,
      })
    } catch (e: any) {
      console.log(e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }

    // const res = await this.verify({
    //   circuit: proofRequest.circuit,
    //   proof: proofResult.proof,
    //   publicInput: proofResult.publicSignals,
    // })
    // console.log('verify', res)

    const { proof, publicSignals } = proofResult
    const presentationUri = await this.storage.uploadData(JSON.stringify(encryptedPresentation))

    const { signature } = await this.proofRequest.prove({
      proofRequest: props.proofRequest,
      proof,
      publicSignals,
      presentationUri,
    })

    return { signature, proof, publicSignals, presentationUri }
  }

  /**
   * Generate circuit inputs
   */
  async prepareInputs(circuit: Circuit, policy: Policy, vp: VerifiablePresentation) {
    if (vp.verifiableCredential === undefined || vp.verifiableCredential[0] === undefined) {
      throw new Error('invalid presentation, at least one credential required')
    }

    const input: any = {}
    const normalizeClaimKey = s => s.trim()

    // convert signal name `xxx[5]` > ['xxx', 5]
    const parseSignal = (s) => {
      const r = s.match(/^(\w+)(?:\[(\d+)\])?$/)
      return [r[1], r[2] ? Number(r[2]) : 1]
    }

    const vc = vp.verifiableCredential[0]

    for (const signal of circuit.privateSignals) {
      const claim = normalizeClaimKey(signal)
      if (vc.credentialSubject[claim] === undefined || vc.credentialSubject['@proof']?.[claim] === undefined) {
        throw new Error(`invalid presentation claim ${claim}`)
      }
      const [key, ...proof] = vc.credentialSubject['@proof'][claim]
      input[signal] = vc.credentialSubject[claim] ?? 0
      input[`${signal}Proof`] = proof
      input[`${signal}Key`] = key
    }

    let idx = 0
    for (const signal of circuit.publicSignals) {
      const [signalName, signalSize] = parseSignal(signal)
      switch (signal) {
        case KnownSignals.CurrentDate: {
          input[signalName] = await this.utils.currentDate()
          break
        }
        case KnownSignals.CredentialRoot:
          input[signalName] = vc.proof.rootHash
          break
        case KnownSignals.IssuerPk:
          input[signalName] = [
            vc.proof.proofValue.ax,
            vc.proof.proofValue.ay,
          ]
          break
        case KnownSignals.IssuerSignature:
          input[signalName] = [
            vc.proof.proofValue.r8x,
            vc.proof.proofValue.r8y,
            vc.proof.proofValue.s,
          ]
          break
        default: {
          // apply policy rules
          const value = policy.rules?.find(r => r.index === idx)?.value
          if (value !== undefined) {
            input[signal] = value
          }
        }
      }
      idx += signalSize
    }

    return input
  }
}

export type PrivateKey = number[] | string | Buffer | Uint8Array

export interface ProveProps {
  proofRequest: PublicKeyInitData
  vc: PublicKeyInitData
  holderSecretKey: Uint8Array | number[]
  exposedFields?: string[]
  decryptionKey?: PrivateKey
}

export interface VerifyProps {
  circuit: PublicKeyInitData
  publicInput: (string | bigint)[]
  proof: any // TODO: add type
}
