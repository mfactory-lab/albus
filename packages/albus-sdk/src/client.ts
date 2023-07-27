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
      return Albus.zkp.parseFiniteNumber(n).reverse()
    },
    currentDate: async (rpc = true) => {
      let date
      if (rpc) {
        const slot = await this.connection.getSlot()
        const timestamp = (await this.connection.getBlockTime(slot)) ?? 0
        date = new Date(timestamp * 1000)
      }
      return formatCircuitDate(date)
    },
  }

  /**
   * Prove the request
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
    })

    try {
      const { proof, publicSignals } = await Albus.zkp.generateProof({
        wasmFile: circuit.wasmUri!,
        zkeyFile: circuit.zkeyUri!,
        input,
      })

      const presentationUri = await this.storage.uploadData(JSON.stringify(encryptedPresentation))

      const res = await this.proofRequest.prove({
        proofRequest: props.proofRequest,
        proof,
        publicSignals,
        presentationUri,
      })

      return { signature: res.signature, proof, publicSignals, presentationUri }
    } catch (e: any) {
      // console.log(e)
      throw new Error(`Circuit constraint violation (${e.message})`)
    }
  }

  async prepareInputs(circuit: Circuit, policy: Policy, vp: VerifiablePresentation) {
    if (vp.verifiableCredential === undefined || vp.verifiableCredential[0] === undefined) {
      throw new Error('invalid presentation, at least one credential required')
    }

    const input: any = {}
    const filterSignal = s => s.replace(/\[(\d+)\]/, '')
    const vc = vp.verifiableCredential[0]

    for (const signal of circuit.privateSignals) {
      if (!vc.credentialSubject[signal] || !vc.credentialSubject['@proof'][signal]) {
        throw new Error(`invalid presentation claim ${signal}`)
      }
      const [key, ...proof] = vc.credentialSubject['@proof'][signal]
      input[signal] = vc.credentialSubject[signal] ?? 0
      input[`${signal}Proof`] = proof
      input[`${signal}Key`] = key
    }

    for (const signal of circuit.publicSignals) {
      switch (signal) {
        case KnownSignals.CurrentDate: {
          input[signal] = await this.utils.currentDate()
          break
        }
        case KnownSignals.CredentialRoot:
          input[signal] = vc.proof.rootHash
          break
        case KnownSignals.IssuerPk:
          input[filterSignal(signal)] = [
            vc.proof.proofValue.ax,
            vc.proof.proofValue.ay,
          ]
          break
        case KnownSignals.IssuerSignature:
          input[filterSignal(signal)] = [
            vc.proof.proofValue.r8x,
            vc.proof.proofValue.r8y,
            vc.proof.proofValue.s,
          ]
          break
        default: {
          // apply policy rules
          const idx = circuit.publicSignals.indexOf(signal)
          if (idx >= 0) {
            const value = policy.rules?.find(r => r.index === idx)?.value
            if (value !== undefined) {
              input[signal] = Albus.crypto.utils.arrayToBigInt(Uint8Array.from(value))
            }
          }
        }
      }
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
