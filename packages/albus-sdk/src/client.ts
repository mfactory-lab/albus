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

import * as Albus from '@albus/core'
import type { Wallet } from '@coral-xyz/anchor'
import { AnchorProvider } from '@coral-xyz/anchor'
import type { ConfirmOptions, Connection, PublicKeyInitData } from '@solana/web3.js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { CircuitManager } from './circuitManager'
import { CredentialManager } from './credentialManager'
import { EventManager } from './eventManager'
import { PROGRAM_ID } from './generated'
import { PdaManager } from './pda'
import { PolicyManager } from './policyManager'
import { ProofRequestManager } from './proofRequestManager'
import { ServiceManager } from './serviceManager'
import { BundlrStorageDriver } from './StorageDriver'
import type { PrivateKey } from './types'
import { getSolanaTimestamp, prepareInputs } from './utils'

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
  }

  /**
   * Verify ZK-Proof
   */
  async verify(props: VerifyProps) {
    const circuit = await this.circuit.load(props.circuit)
    return Albus.zkp.verifyProof({
      vk: Albus.zkp.decodeVerifyingKey(circuit.vk),
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

    const input = await prepareInputs({
      now: await getSolanaTimestamp(this.connection),
      circuit,
      policy,
      vp,
    })

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
      // console.log(e)
      throw new Error(`Proof generation failed. Circuit constraint violation (${e.message})`)
    }

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
}

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
