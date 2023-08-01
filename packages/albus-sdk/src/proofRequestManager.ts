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
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js'
import type { ProofData } from './generated'
import {
  Circuit,
  Policy,
  ProofRequest,
  ProofRequestStatus,
  createCreateProofRequestInstruction,
  createDeleteProofRequestInstruction,
  createProveInstruction, createVerifyInstruction, errorFromCode, proofRequestDiscriminator,
} from './generated'
import type { PdaManager } from './pda'

export class ProofRequestManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load proof request by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return ProofRequest.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load proof request with additional `policy` and `circuit`
   * reduce rpc requests by using `getMultipleAccountsInfo`
   */
  async loadFull(addr: PublicKeyInitData, commitment?: Commitment) {
    const proofRequest = await this.load(addr, commitment)
    const accounts = await this.provider.connection.getMultipleAccountsInfo([
      proofRequest.policy,
      proofRequest.circuit,
      // proofRequest.serviceProvider,
    ])
    return {
      proofRequest,
      policy: accounts[0] ? Policy.fromAccountInfo(accounts[0])[0] : undefined,
      circuit: accounts[1] ? Circuit.fromAccountInfo(accounts[1])[0] : undefined,
    }
  }

  /**
   * Find proof requests
   */
  async find(filter: FindProofRequestProps = {}) {
    const builder = ProofRequest.gpaBuilder()
      .addFilter('accountDiscriminator', proofRequestDiscriminator)

    if (!filter.skipUser) {
      builder.addFilter('owner', new PublicKey(filter.user ?? this.provider.publicKey))
    }

    if (filter.serviceProvider) {
      builder.addFilter('serviceProvider', new PublicKey(filter.serviceProvider))
    } else if (filter.serviceProviderCode) {
      builder.addFilter('serviceProvider', this.pda.serviceProvider(filter.serviceProviderCode)[0])
    }

    if (filter.circuit) {
      builder.addFilter('circuit', new PublicKey(filter.circuit))
    } else if (filter.circuitId) {
      builder.addFilter('circuit', this.pda.circuit(filter.circuitId)[0])
    }

    if (filter.policy) {
      builder.addFilter('policy', new PublicKey(filter.policy))
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
   * Create new proof request
   */
  async create(props: CreateProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceId)
    const [circuit] = this.pda.circuit(props.circuitId)
    const [policy] = this.pda.policy(circuit, serviceProvider)
    const [proofRequest] = this.pda.proofRequest(policy, authority)

    const instruction = createCreateProofRequestInstruction(
      {
        serviceProvider,
        proofRequest,
        policy,
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
      return { address: proofRequest, signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete proof request
   */
  async delete(props: DeleteProofRequestProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const instruction = createDeleteProofRequestInstruction({
      proofRequest: new PublicKey(props.addr),
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

  // /**
  //  * Verify the {@link ProofRequest}
  //  * Required admin authority
  //  */
  // async verify(props: VerifyProps, opts?: ConfirmOptions) {
  //   const instruction = createVerifyInstruction(
  //     {
  //       proofRequest: new PublicKey(props.proofRequest),
  //       authority: this.provider.publicKey,
  //     },
  //     {
  //       data: {
  //         status: ProofRequestStatus.Verified,
  //       },
  //     },
  //   )
  //
  //   try {
  //     const tx = new Transaction().add(instruction)
  //     const signature = await this.provider.sendAndConfirm(tx, [], opts)
  //     return { signature }
  //   } catch (e: any) {
  //     throw errorFromCode(e.code) ?? e
  //   }
  // }

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
   * Prove the proof request
   */
  async prove(props: ProveProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const proofRequest = await this.load(props.proofRequest)

    const proof = Albus.zkp.encodeProof(props.proof)
    proof.a = await Albus.zkp.altBn128G1Neg(proof.a)

    const publicInputs = Albus.zkp.encodePublicSignals(props.publicSignals)

    const instruction = createProveInstruction(
      {
        proofRequest: new PublicKey(props.proofRequest),
        circuit: proofRequest.circuit,
        policy: proofRequest.policy,
        authority,
      },
      {
        data: {
          uri: props.presentationUri,
          publicInputs,
          proof,
        },
      },
    )

    try {
      const tx = new Transaction()
        .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 }))
        .add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature }
    } catch (e: any) {
      // console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Validates proof request.
   *
   * @param {ProofRequest} req The proof request object to validate.
   * @throws An error with a message indicating why the request is invalid.
   */
  async validate(req: ProofRequest) {
    const slot = await this.provider.connection.getSlot()
    const timestamp = await this.provider.connection.getBlockTime(slot)
    if (!timestamp) {
      throw new Error('Failed to get solana block time')
    }
    if (Number(req.expiredAt) > 0 && Number(req.expiredAt) < timestamp) {
      throw new Error('Proof request is expired')
    }
    // if (!req.proof) {
    //   throw new Error('Proof request is not proved yet')
    // }
    if (Number(req.verifiedAt) <= 0) {
      throw new Error('Proof request is not verified')
    }
  }
}

export interface CreateProofRequestProps {
  serviceId: string
  circuitId: string
  expiresIn?: number
}

export interface DeleteProofRequestProps {
  addr: PublicKeyInitData
}

export interface FindProofRequestProps {
  user?: PublicKeyInitData
  serviceProvider?: PublicKeyInitData
  serviceProviderCode?: string
  circuit?: PublicKeyInitData
  circuitId?: string
  policy?: PublicKeyInitData
  status?: ProofRequestStatus
  skipUser?: boolean
}

export interface ProveProps {
  proofRequest: PublicKeyInitData
  proof: ProofData
  publicSignals: (string | number | bigint)[]
  presentationUri: string
}

export interface VerifyProps {
  proofRequest: PublicKeyInitData
}
