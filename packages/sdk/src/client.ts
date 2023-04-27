import { Buffer } from 'node:buffer'
import type { Address, AnchorProvider } from '@project-serum/anchor'
import { BorshCoder, EventManager } from '@project-serum/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Metaplex } from '@metaplex-foundation/js'
import * as snarkjs from 'snarkjs'
import idl from '../idl/albus.json'
import {
  PROGRAM_ID,
  ServiceProvider,
  ZKPRequest,
  createAddServiceProviderInstruction,
  createCreateZkpRequestInstruction,
  createDeleteServiceProviderInstruction,
  createDeleteZkpRequestInstruction,
  createProveInstruction,
  createVerifyInstruction, errorFromCode, serviceProviderDiscriminator, zKPRequestDiscriminator,
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
   * Check that the selected {@link props.user} is compliant
   * for {@link props.circuit} and selected service provider
   * if {@link props.full} is true, then the full verification
   * process will be performed
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
    const req = await this.loadZKPRequest(addr)
    this.validateZKPRequest(req)
    if (props.full) {
      return await this.verifyZKPRequestInternal(req)
    }
    return true
  }

  /**
   * Confirm that the {@link ZKPRequest} has not expired,
   * it is proven and verified
   *
   * @param {ZKPRequest} req
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
   * Internal {@link ZKPRequest} verification
   *
   * @param {ZKPRequest} req
   * @returns {Promise<boolean>}
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
