import { Buffer } from 'node:buffer'
import { Metaplex } from '@metaplex-foundation/js'
import type { Address, AnchorProvider } from '@project-serum/anchor'
import { BorshCoder, EventManager } from '@project-serum/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import snarkjs from 'snarkjs'
import idl from '../idl/albus.json'
import {
  PROGRAM_ID,
  ServiceProvider,
  ZKPRequest,
  ZKPRequestStatus,
  createAddServiceProviderInstruction,
  createCreateZkpRequestInstruction,
  createDeleteServiceProviderInstruction,
  createDeleteZkpRequestInstruction,
  createProveInstruction,
  createVerifyInstruction,
  errorFromCode,
  serviceProviderDiscriminator,
  zKPRequestDiscriminator,
} from './generated'
import { getMetadataPDA } from './utils'

const SERVICE_PROVIDER_SEED_PREFIX = 'service-provider'
const ZKP_REQUEST_SEED_PREFIX = 'zkp-request'

export class AlbusClient {
  programId = PROGRAM_ID

  _coder: BorshCoder
  _events: EventManager

  constructor(
    private readonly provider: AnchorProvider,
  ) {
    this._coder = new BorshCoder(idl as any)
    this._events = new EventManager(this.programId, provider, this._coder)
  }

  get connection() {
    return this.provider.connection
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

  /**
   * Verify that the selected user, specified by {@link props.user},
   * is compliant with respect to the {@link props.circuit}
   * and the service provider.
   * If the {@link props.full} property is set to true,
   * the full verification process will be performed.
   *
   * @param {CheckCompliance} props
   */
  async checkCompliance(props: CheckCompliance) {
    const user = props.user ?? this.provider.publicKey
    const [addr] = this.getZKPRequestPDA(
      this.getServiceProviderPDA(props.serviceProviderCode),
      props.circuit,
      user,
    )

    // verify on-chain request
    const req = await this.loadZKPRequest(addr)
    this.validateZKPRequest(req)

    // full proof verification
    if (props.full) {
      return await this.verifyZKPRequestInternal(req)
    }

    return true
  }

  /**
   * Validates a Zero Knowledge Proof (ZKP) request.
   *
   * A ZKP request must satisfy the following criteria:
   *
   * - The `expiredAt` property must be greater than the current time, or zero to indicate no expiration.
   * - The `proof` property must be truthy, i.e., not `null`, `undefined`, `false`, `0`, or an empty string.
   * - The `verifiedAt` property must be greater than zero to indicate that the request has been verified.
   *
   * If any of these conditions are not met, an error is thrown with a descriptive message.
   *
   * @param {ZKPRequest} req The ZKP request object to validate.
   * @throws An error with a message indicating why the request is invalid.
   */
  validateZKPRequest(req: ZKPRequest) {
    if (req.expiredAt > 0 && req.expiredAt < Date.now()) {
      throw new Error('ZKP Request is expired')
    }
    if (!req.proof) {
      throw new Error('ZKP Request is not proved')
    }
    if (req.verifiedAt <= 0) {
      throw new Error('ZKP Request is not verified')
    }
  }

  /**
   * Full {@link ZKPRequest} verification
   *
   * @param {PublicKeyInitData} serviceProvider
   * @param {PublicKeyInitData} circuit
   * @param {PublicKeyInitData} user
   * @returns {Promise<boolean>}
   */
  async verifyZKPRequest(
    serviceProvider: PublicKeyInitData,
    circuit: PublicKeyInitData,
    user?: PublicKeyInitData,
  ) {
    return this.verifyZKPRequestByAddress(
      this.getZKPRequestPDA(serviceProvider, circuit, user ?? this.provider.publicKey),
    )
  }

  /**
   * Full {@link ZKPRequest} verification for selected {@link addr}
   *
   * @param {PublicKeyInitData} addr
   * @returns {Promise<boolean>}
   */
  async verifyZKPRequestByAddress(addr: PublicKeyInitData) {
    return this.verifyZKPRequestInternal(await this.loadZKPRequest(addr))
  }

  /**
   * Verifies a Zero Knowledge Proof (ZKP) request internally using Metaplex and snarkjs libraries.
   *
   * The verification process involves the following steps:
   *
   * 1. Checking that the `proof` property of the request object is truthy.
   * 2. Loading the circuit NFT metadata using the Metaplex API, based on the `circuit` property of the request.
   * 3. Checking that the circuit metadata contains a verification key (`vk` property).
   * 4. Loading the proof NFT metadata using the Metaplex API, based on the `proof` property of the request.
   * 5. Checking that the proof metadata contains a proof data (`proof` property).
   * 6. Extracting the verification key, proof, and public signals from the proof metadata.
   * 7. Using the snarkjs library to perform a Groth16 verification of the proof using the verification key and public signals.
   *
   * If any of these steps fails, an error is thrown with a descriptive message.
   *
   * @param {ZKPRequest} req The ZKP request object to verify.
   * @returns A promise that resolves to a boolean indicating whether the proof is valid.
   * @throws An error with a message indicating why the proof is invalid.
   */
  async verifyZKPRequestInternal(req: ZKPRequest) {
    if (!req.proof) {
      throw new Error('ZKP request is not proved')
    }

    const metaplex = Metaplex.make(this.connection)

    const circuitNft = await metaplex.nfts().findByMint({
      mintAddress: new PublicKey(req.circuit),
      loadJsonMetadata: true,
    })

    if (!circuitNft.json?.vk) {
      throw new Error('Invalid circuit. Metadata does not contain verification key')
    }

    const proofNft = await metaplex.nfts().findByMint({
      mintAddress: new PublicKey(req.proof),
      loadJsonMetadata: true,
    })

    if (!proofNft.json?.proof) {
      throw new Error('Invalid proof. Metadata does not contain proof data')
    }

    const vk = proofNft.json?.vk as snarkjs.VK
    const proof = proofNft.json?.proof as snarkjs.SnarkjsProof
    const publicSignals = (proofNft.json?.public_input ?? []) as any

    return await snarkjs.groth16.verify(vk, publicSignals, proof)
  }

  /**
   * Prove existing {@link ZKPRequest}
   */
  async prove(props: ProveProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createProveInstruction(
      {
        zkpRequest: props.zkpRequest,
        proofMetadata: props.proofMetadata,
        authority,
      },
    )

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Verify existing {@link ZKPRequest}
   */
  async verify(props: VerifyProps, opts?: ConfirmOptions) {
    const instruction = createVerifyInstruction(
      {
        zkpRequest: props.zkpRequest,
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: ZKPRequestStatus.Verified,
        },
      },
    )

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Verify existing {@link ZKPRequest}
   */
  async deny(props: VerifyProps, opts?: ConfirmOptions) {
    const instruction = createVerifyInstruction(
      {
        zkpRequest: props.zkpRequest,
        authority: this.provider.publicKey,
      },
      {
        data: {
          status: ZKPRequestStatus.Denied,
        },
      },
    )

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Create new {@link ZKPRequest}
   */
  async createZKPRequest(props: CreateZKPRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.getServiceProviderPDA(props.serviceProviderCode)
    const [zkpRequest] = this.getZKPRequestPDA(serviceProvider, props.circuitMint, authority)
    const circuitMetadata = getMetadataPDA(props.circuitMint)

    const instruction = createCreateZkpRequestInstruction(
      {
        serviceProvider,
        zkpRequest,
        circuitMint: props.circuitMint,
        circuitMetadata,
        authority,
      },
      {
        data: {
          expiresIn: props.expiresIn ?? 0,
        },
      },
    )

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete {@link ZKPRequest}
   */
  async deleteZKPRequest(props: DeleteZKPRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createDeleteZkpRequestInstruction({
      zkpRequest: props.zkpRequest,
      authority,
    })

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Add new {@link ServiceProvider}
   */
  async addServiceProvider(props: AddServiceProviderProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.getServiceProviderPDA(props.code)
    const instruction = createAddServiceProviderInstruction({
      serviceProvider,
      authority,
    }, {
      data: {
        code: props.code,
        name: props.name,
      },
    })

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Delete a {@link ServiceProvider}
   */
  async deleteServiceProvider(props: DeleteServiceProviderProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.getServiceProviderPDA(props.code)
    const instruction = createDeleteServiceProviderInstruction({
      serviceProvider,
      authority,
    })

    let signature: string

    const tx = new Transaction().add(instruction)

    try {
      signature = await this.provider.sendAndConfirm(tx, [], opts)
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }

    return { signature }
  }

  /**
   * Load all {@link ServiceProvider}'s
   */
  async loadAllServiceProviders(filter: { authority?: Address } = {}) {
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
  async loadServiceProvider(addr: PublicKey, commitment?: Commitment) {
    return ServiceProvider.fromAccountAddress(this.provider.connection, addr, commitment)
  }

  /**
   * Load all zkp requests
   */
  async loadAllZKPRequests(filter: { serviceProvider?: Address; circuit?: Address; proof?: Address } = {}) {
    const builder = ZKPRequest.gpaBuilder()
      .addFilter('accountDiscriminator', zKPRequestDiscriminator)
      .addFilter('owner', this.provider.publicKey)

    if (filter.serviceProvider) {
      builder.addFilter('serviceProvider', new PublicKey(filter.serviceProvider))
    }

    if (filter.circuit) {
      builder.addFilter('circuit', new PublicKey(filter.circuit))
    }

    if (filter.proof) {
      builder.addFilter('proof', new PublicKey(filter.proof))
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ZKPRequest.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Load zkp request by {@link addr}
   */
  async loadZKPRequest(addr: PublicKeyInitData, commitment?: Commitment) {
    return ZKPRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Get channel device PDA
   */
  getZKPRequestPDA(serviceProvider: PublicKeyInitData, circuitMint: PublicKeyInitData, requester: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      Buffer.from(ZKP_REQUEST_SEED_PREFIX),
      new PublicKey(serviceProvider).toBuffer(),
      new PublicKey(circuitMint).toBuffer(),
      new PublicKey(requester).toBuffer(),
    ], this.programId)
  }

  /**
   * Get service provider PDA
   */
  getServiceProviderPDA(code: string) {
    return PublicKey.findProgramAddressSync([
      Buffer.from(SERVICE_PROVIDER_SEED_PREFIX),
      Buffer.from(code),
    ], this.programId)
  }
}

export interface CreateZKPRequestProps {
  serviceProviderCode: string
  circuitMint: PublicKey
  expiresIn?: number
}

export interface DeleteZKPRequestProps {
  zkpRequest: PublicKey
}

export interface AddServiceProviderProps {
  code: string
  name: string
}

export interface DeleteServiceProviderProps {
  code: string
}

export interface ProveProps {
  zkpRequest: PublicKey
  proofMetadata: PublicKey
}

export interface VerifyProps {
  zkpRequest: PublicKey
}

export interface CheckCompliance {
  serviceProviderCode: string
  circuit: PublicKey
  user?: PublicKey
  full?: boolean
}
