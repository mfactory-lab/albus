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

import * as Albus from '@albus-finance/core'
import type {
  Commitment,
  ConfirmOptions,
  PublicKeyInitData,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  PublicKey, Transaction } from '@solana/web3.js'
import { chunk } from 'lodash-es'
import { BaseManager } from './base'

import {
  Circuit,
  circuitDiscriminator,
  createCreateCircuitInstruction,
  createDeleteCircuitInstruction,
  createUpdateCircuitVkInstruction,
  errorFromCode,
} from './generated'
import type { SendOpts } from './utils'

export class CircuitManager extends BaseManager {
  /**
   * Load circuit by {@link addr}
   * @param addr
   * @param commitment
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Circuit.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load circuit by {@link id}
   * @param id
   * @param commitment
   */
  async loadById(id: string, commitment?: Commitment) {
    return this.load(this.pda.circuit(id)[0], commitment)
  }

  /**
   * Find circuits
   * @param filter
   * @param filter.code
   */
  async find(filter: { code?: string } = {}) {
    const builder = Circuit.gpaBuilder(this.programId)
      .addFilter('accountDiscriminator', circuitDiscriminator)

    if (filter.code) {
      builder.addFilter('code', filter.code)
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: Circuit.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Find circuits and return a map
   * @param filter
   * @param filter.code
   */
  async findMapped(filter: { code?: string } = {}) {
    return (await this.find(filter))
      .reduce((a, { pubkey, data }) => {
        a.set(pubkey.toString(), data)
        return a
      }, new Map<string, Circuit>())
  }

  createIx(props: CreateCircuitProps) {
    const authority = this.provider.publicKey
    const [address] = this.pda.circuit(props.code)

    const ix = createCreateCircuitInstruction({
      circuit: address,
      authority,
    }, {
      data: {
        code: props.code,
        name: props.name,
        description: props.description ?? '',
        wasmUri: props.wasmUri,
        zkeyUri: props.zkeyUri,
        outputs: props.outputs,
        privateSignals: props.privateSignals,
        publicSignals: props.publicSignals,
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Create a new circuit
   * @param props
   * @param opts
   */
  async create(props: CreateCircuitProps, opts?: SendOpts) {
    const { address, instructions } = this.createIx(props)
    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)
      return { signature, address }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  updateVkIx(props: UpdateCircuitVkProps) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.code)

    // TODO: refactory
    const icFirstSize = 8
    const icChunkSize = 15
    const vk = Albus.zkp.encodeVerifyingKey(props.vk)

    const instructions: TransactionInstruction[] = []

    instructions.push(
      createUpdateCircuitVkInstruction({ circuit, authority }, {
        data: {
          alpha: vk.alpha,
          beta: vk.beta,
          gamma: vk.gamma,
          delta: vk.delta,
          ic: vk.ic.slice(0, icFirstSize),
          extendIc: false,
        },
      }, this.programId),
    )

    if (vk.ic.length > icFirstSize) {
      const icChunks = chunk(vk.ic.slice(icFirstSize), icChunkSize)
      for (const ic of icChunks) {
        instructions.push(
          createUpdateCircuitVkInstruction({ circuit, authority }, {
            data: {
              alpha: null,
              beta: null,
              gamma: null,
              delta: null,
              extendIc: true,
              ic,
            },
          }, this.programId),
        )
      }
    }

    return {
      instructions,
    }
  }

  /**
   * Update circuit verification key
   * @param props
   * @param opts
   */
  async updateVk(props: UpdateCircuitVkProps, opts?: ConfirmOptions) {
    const { instructions } = this.updateVkIx(props)
    const txBuilder = this.txBuilder
    for (const ix of instructions) {
      txBuilder.addTransaction(new Transaction().add(ix))
    }
    try {
      const signatures = await txBuilder.sendAll(opts)
      return { signatures }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  deleteByIdIx(addr: PublicKeyInitData) {
    const authority = this.provider.publicKey
    const ix = createDeleteCircuitInstruction({
      circuit: new PublicKey(addr),
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete circuit by address
   * @param addr
   * @param opts
   */
  async deleteById(addr: PublicKeyInitData, opts?: SendOpts) {
    const { instructions } = this.deleteByIdIx(addr)

    try {
      const signature = await this.txBuilder
        .addInstruction(...instructions)
        .sendAndConfirm(opts)

      return { signature }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete circuit by code
   * @param props
   * @param props.code
   * @param opts
   */
  async delete(props: { code: string }, opts?: SendOpts) {
    const [circuit] = this.pda.circuit(props.code)
    return this.deleteById(circuit, opts)
  }
}

export type CreateCircuitProps = {
  code: string
  name: string
  description?: string
  wasmUri: string
  zkeyUri: string
  outputs: string[]
  privateSignals: string[]
  publicSignals: string[]
}

export type UpdateCircuitVkProps = {
  code: string
  vk: VK
}

type VK = {
  readonly nPublic: number
  readonly curve: string
  readonly vk_alpha_1: number[]
  readonly vk_beta_2: number[][]
  readonly vk_gamma_2: number[][]
  readonly vk_delta_2: number[][]
  readonly IC: number[][]
}
