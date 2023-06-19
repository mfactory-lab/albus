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
import * as albus from '@albus/core'
import type { Wallet } from '@coral-xyz/anchor'
import { AnchorProvider, BorshCoder, EventManager } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, Connection, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import type { VK } from 'snarkjs'
import idl from '../idl/albus.json'
import type { Proof } from './generated'
import {
  PROGRAM_ID,
  ProofRequest,
  ProofRequestStatus,
  ServiceProvider,
  createAddServiceProviderInstruction,
  createCreateProofRequestInstruction,
  createDeleteProofRequestInstruction,
  createDeleteServiceProviderInstruction,
  createProveInstruction,
  createVerifyInstruction,
  errorFromCode,
  proofRequestDiscriminator,
  serviceProviderDiscriminator,
} from './generated'
import { AlbusNftCode } from './types'
import type { ValidateNftProps } from './utils'
import { prepareProofInput, validateNft } from './utils'

const { generateProof, verifyProof } = albus.zkp
const { verifyCredential } = albus.vc
const { getMetadataByMint, getMetadataPDA } = albus.utils

export class AlbusClient {
  programId = PROGRAM_ID

  constructor(
    readonly provider: AnchorProvider,
  ) {}

  static factory(connection: Connection, wallet?: Wallet, opts: ConfirmOptions = {}) {
    wallet = wallet ?? { publicKey: PublicKey.default } as unknown as Wallet
    return new this(new AnchorProvider(connection, wallet, opts))
  }

  get connection() {
    return this.provider.connection
  }

  get eventManager() {
    return new _EventManager(this)
  }

  get manager() {
    return new ManagerClient(this)
  }

  /**
   * Verify that the selected user, specified by {@link props.user},
   * is compliant with respect to the {@link props.circuit}
   * and the service provider.
   * If the {@link props.full} property is set to true,
   * the full verification process will be performed.
   *
   * @param {CheckCompliance} props
   */
  async verifyCompliance(props: CheckCompliance) {
    const user = props.user ?? this.provider.publicKey
    const [service] = this.getServiceProviderPDA(props.serviceCode)
    const [proofRequestAddr] = this.getProofRequestPDA(service, props.circuit, user)

    const proofRequest = await this.loadProofRequest(proofRequestAddr)
    this.validateProofRequest(proofRequest)

    // full ZK proof verification
    if (props.full) {
      return this.verifyProofRequest(proofRequest)
    }

    return true
  }

  /**
   * Verify proof request for the specified service code and circuit.
   * If {@link user} is undefined, provider.pubkey will be used.
   *
   * @param {string} serviceCode
   * @param {PublicKeyInitData} circuit
   * @param {PublicKeyInitData|undefined} user
   * @returns {Promise<boolean>}
   */
  async verifySpecific(serviceCode: string, circuit: PublicKeyInitData, user?: PublicKeyInitData) {
    const [service] = this.getServiceProviderPDA(serviceCode)
    const [proofRequest] = this.getProofRequestPDA(service, circuit, user ?? this.provider.publicKey)
    return this.verifyProofRequest(proofRequest)
  }

  /**
   * Verify proof request by specified address
   *
   * @param {PublicKeyInitData} addr
   * @returns {Promise<boolean>}
   */
  async verifyProofRequest(addr: PublicKeyInitData) {
    const proofRequest = await this.loadProofRequest(addr)
    return this.verifyProofRequestInternal(proofRequest)
  }

  /**
   * Verify proof request
   *
   * @param {ProofRequest} proofRequest
   * @returns {Promise<boolean>}
   */
  private async verifyProofRequestInternal(proofRequest: ProofRequest) {
    if (!proofRequest.proof) {
      throw new Error('Proof request is not proved yet')
    }

    const circuit = await this.loadCircuit(proofRequest.circuit)
    const { protocol, curve, piA: pi_a, piB: pi_b, piC: pi_c } = proofRequest.proof

    return verifyProof({
      vk: circuit.vk,
      publicInput: proofRequest.proof.publicInputs,
      proof: { pi_a, pi_b, pi_c, protocol, curve },
    })
  }

  /**
   * Validates a Zero Knowledge Proof (ZKP) request.
   *
   * @param {ProofRequest} req The proof request object to validate.
   * @throws An error with a message indicating why the request is invalid.
   */
  validateProofRequest(req: ProofRequest) {
    if (Number(req.expiredAt) > 0 && Number(req.expiredAt) < Date.now()) {
      throw new Error('Proof request is expired')
    }
    if (!req.proof) {
      throw new Error('Proof request is not proved yet')
    }
    if (Number(req.verifiedAt) <= 0) {
      throw new Error('Proof request is not verified')
    }
  }

  /**
   * Load and validate Circuit NFT
   */
  async loadCircuit(addr: PublicKeyInitData) {
    const nft = await this.loadNft(addr, { code: AlbusNftCode.Circuit })

    if (!nft.json?.code) {
      throw new Error('Invalid circuit! Metadata does not contain `code`.')
    }

    if (!nft.json?.zkey_url) {
      throw new Error('Invalid circuit! Metadata does not contain `zkey_url`.')
    }

    if (!nft.json?.wasm_url) {
      throw new Error('Invalid circuit! Metadata does not contain `wasm_url`.')
    }

    if (!nft.json?.vk) {
      throw new Error('Invalid circuit! Metadata does not contain verification key.')
    }

    return {
      address: new PublicKey(addr),
      code: String(nft.json.code),
      input: (nft.json.input ?? []) as string[],
      wasmUrl: String(nft.json.wasm_url),
      zkeyUrl: String(nft.json.zkey_url),
      vk: nft.json.vk as VK,
    }
  }

  /**
   * Load and validate Verifiable Credential
   */
  async loadCredential(addr: PublicKeyInitData, opts: { decryptionKey?: PrivateKey } = {}) {
    const nft = await this.loadNft(addr, { code: AlbusNftCode.VerifiableCredential })

    if (!nft.json?.vc) {
      throw new Error('Invalid credential! Metadata does not contain `vc` attribute.')
    }

    const vc = await verifyCredential(nft.json.vc, {
      audience: 'did:web:albus.finance',
      decryptionKey: opts.decryptionKey,
    })

    return {
      address: new PublicKey(addr),
      credentialSubject: vc.verifiableCredential.credentialSubject,
      credentialRoot: nft.json.credentialRoot,
      verified: vc.verified,
    }
  }

  /**
   * Load and validate Verifiable Presentation
   */
  async loadPresentation(addr: PublicKeyInitData, _opts: { decryptionKey?: PrivateKey } = {}) {
    const nft = await this.loadNft(addr, { code: AlbusNftCode.VerifiablePresentation })

    if (!nft.json?.vp) {
      throw new Error('Invalid presentation! Metadata does not contain `vp` attribute.')
    }

    // TODO:

    return {
      address: new PublicKey(addr),
    }
  }

  /**
   * Prove the request
   */
  async prove(props: ProveProps) {
    const proofRequest = await this.loadProofRequest(props.proofRequest)

    if (proofRequest.proof && !props.force) {
      throw new Error('Proof request already proved')
    }

    const circuit = await this.loadCircuit(proofRequest.circuit)

    // TODO: use presentation
    const vc = await this.loadCredential(props.vc, { decryptionKey: props.decryptionKey })

    const input = prepareProofInput({
      requiredFields: circuit.input,
      claims: vc.credentialSubject,
      // TODO: get from service provider rules
      definitions: { minAge: 18, maxAge: 100 },
    })

    try {
      const { proof, publicSignals } = await generateProof({
        wasmFile: circuit.wasmUrl,
        zkeyFile: circuit.zkeyUrl,
        input,
      })

      const { signature } = await this.proveOnChain({
        proofRequest: props.proofRequest,
        proof: {
          protocol: proof.protocol,
          curve: proof.curve,
          piA: proof.pi_a.map(String),
          piB: proof.pi_b.map(p => p.map(String)),
          piC: proof.pi_c.map(String),
          publicInputs: publicSignals.map(String),
        },
      })

      return { signature, proof, publicSignals }
    } catch (e: any) {
      throw new Error(`Circuit constraint violation (${e.message})`)
    }
  }

  /**
   * Save proof for provided proof request
   */
  private async proveOnChain(props: ProveOnChainProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createProveInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        authority,
      },
      {
        data: {
          proof: props.proof,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Create new {@link ProofRequest}
   */
  async createProofRequest(props: CreateProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProviderAddr] = this.getServiceProviderPDA(props.serviceCode)
    const [proofRequestAddr] = this.getProofRequestPDA(serviceProviderAddr, props.circuit, authority)

    const circuitMint = new PublicKey(props.circuit)
    const circuitMetadata = getMetadataPDA(circuitMint)

    const prAccountInfo = await this.connection.getAccountInfo(proofRequestAddr)
    if (prAccountInfo != null) {
      throw new Error(`Proof request for service:${props.serviceCode} and circuit:${circuitMint} already exists...`)
    }

    const instruction = createCreateProofRequestInstruction(
      {
        serviceProvider: serviceProviderAddr,
        proofRequest: proofRequestAddr,
        circuitMint,
        circuitMetadata,
        authority,
      },
      {
        data: {
          expiresIn: props.expiresIn ?? 0,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: proofRequestAddr, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete {@link ProofRequest}
   */
  async deleteProofRequest(props: DeleteProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createDeleteProofRequestInstruction({
      proofRequest: new PublicKey(props.proofRequest),
      authority,
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Find available service providers
   */
  async findServiceProviders(filter: { authority?: PublicKeyInitData } = {}) {
    const builder = ServiceProvider.gpaBuilder()
      .addFilter('accountDiscriminator', serviceProviderDiscriminator)

    if (filter.authority) {
      builder.addFilter('authority', new PublicKey(filter.authority))
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ServiceProvider.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load service provider by {@link addr}
   */
  async loadServiceProvider(addr: PublicKeyInitData, commitment?: Commitment) {
    return ServiceProvider.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Find available proof requests
   */
  async findProofRequests(filter: FindProofRequestProps = {}) {
    const builder = ProofRequest.gpaBuilder()
      .addFilter('accountDiscriminator', proofRequestDiscriminator)
      .addFilter('owner', new PublicKey(filter.user ?? this.provider.publicKey))

    if (filter.serviceProvider) {
      builder.addFilter('serviceProvider', new PublicKey(filter.serviceProvider))
    }

    if (filter.circuit) {
      builder.addFilter('circuit', new PublicKey(filter.circuit))
    }

    if (filter.status) {
      builder.addFilter('status', filter.status)
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ProofRequest.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load proof request by {@link addr}
   */
  async loadProofRequest(addr: PublicKeyInitData, commitment?: Commitment) {
    return ProofRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Get channel device PDA
   */
  getProofRequestPDA(service: PublicKeyInitData, circuit: PublicKeyInitData, user: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      Buffer.from('proof-request'),
      new PublicKey(service).toBuffer(),
      new PublicKey(circuit).toBuffer(),
      new PublicKey(user).toBuffer(),
    ], this.programId)
  }

  /**
   * Get service provider PDA
   */
  getServiceProviderPDA(code: string) {
    return PublicKey.findProgramAddressSync([
      Buffer.from('service-provider'),
      Buffer.from(code),
    ], this.programId)
  }

  /**
   * Load and validate NFT Metadata
   * @private
   */
  private async loadNft(addr: PublicKeyInitData, validate?: ValidateNftProps) {
    const metadata = await getMetadataByMint(this.connection, addr, true)

    if (!metadata) {
      throw new Error(`Unable to find Metadata account at ${addr}`)
    }

    validateNft(metadata, validate)

    return metadata
  }
}

class _EventManager {
  _coder: BorshCoder
  _events: EventManager

  constructor(readonly client: AlbusClient) {
    this._coder = new BorshCoder(idl as any)
    this._events = new EventManager(client.programId, client.provider, this._coder)
  }

  /**
   * Invokes the given callback every time the given event is emitted.
   *
   * @param eventName The PascalCase name of the event, provided by the IDL.
   * @param callback  The function to invoke whenever the event is emitted from
   *                  program logs.
   */
  public addEventListener(
    eventName: string,
    callback: (event: any, slot: number, signature: string) => void,
  ): number {
    return this._events.addEventListener(eventName, (event: any, slot: number, signature: string) => {
      // skip simulation signature
      if (signature !== '1111111111111111111111111111111111111111111111111111111111111111') {
        callback(event, slot, signature)
      }
    })
  }

  /**
   * Unsubscribes from the given listener.
   */
  public async removeEventListener(listener: number): Promise<void> {
    return await this._events.removeEventListener(listener)
  }
}

class ManagerClient {
  constructor(readonly client: AlbusClient) {
  }

  get provider() {
    return this.client.provider
  }

  /**
   * Verify the {@link ProofRequest}
   * Required admin authority
   */
  async verify(props: VerifyProps, opts?: ConfirmOptions) {
    const instruction = createVerifyInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: ProofRequestStatus.Verified,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Reject existing {@link ProofRequest}
   * Required admin authority
   */
  async reject(props: VerifyProps, opts?: ConfirmOptions) {
    const instruction = createVerifyInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: ProofRequestStatus.Rejected,
        },
      },
    )

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Add new {@link ServiceProvider}
   * Required admin authority
   */
  async addServiceProvider(props: AddServiceProviderProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.client.getServiceProviderPDA(props.code)
    const instruction = createAddServiceProviderInstruction({
      serviceProvider,
      authority,
    }, {
      data: {
        code: props.code,
        name: props.name,
      },
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { address: serviceProvider, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete a {@link ServiceProvider}
   * Required admin authority
   */
  async deleteServiceProvider(props: DeleteServiceProviderProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.client.getServiceProviderPDA(props.code)
    const instruction = createDeleteServiceProviderInstruction({
      serviceProvider,
      authority,
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }
}

export type PrivateKey = number[] | string | Buffer | Uint8Array

export interface FindProofRequestProps {
  user?: PublicKeyInitData
  serviceProvider?: PublicKeyInitData
  circuit?: PublicKeyInitData
  status?: ProofRequestStatus
}

export interface CreateProofRequestProps {
  serviceCode: string
  circuit: PublicKeyInitData
  expiresIn?: number
}

export interface DeleteProofRequestProps {
  proofRequest: PublicKeyInitData
}

export interface AddServiceProviderProps {
  code: string
  name: string
}

export interface DeleteServiceProviderProps {
  code: string
}

export interface ProveProps {
  proofRequest: PublicKeyInitData
  vc: PublicKeyInitData
  decryptionKey?: PrivateKey
  force?: boolean
}

export interface ProveOnChainProps {
  proofRequest: PublicKeyInitData
  proof: Proof
}

export interface VerifyProps {
  proofRequest: PublicKeyInitData
}

export interface CheckCompliance {
  serviceCode: string
  circuit: PublicKeyInitData
  user?: PublicKeyInitData
  full?: boolean
}
