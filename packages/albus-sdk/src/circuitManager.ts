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

import * as Albus from '@mfactory-lab/albus-core'
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'

import {
  Circuit,
  circuitDiscriminator,
  createCreateCircuitInstruction,
  createDeleteCircuitInstruction,
  createUpdateCircuitVkInstruction,
  errorFromCode,
} from './generated'
import type { PdaManager } from './pda'

export class CircuitManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load circuit by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Circuit.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load circuit by {@link id}
   */
  async loadById(id: string, commitment?: Commitment) {
    return this.load(this.pda.circuit(id)[0], commitment)
  }

  /**
   * Find circuits
   */
  async find(filter: { code?: string } = {}) {
    const builder = Circuit.gpaBuilder()
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
   */
  async findMapped(filter: { code?: string } = {}) {
    return (await this.find(filter))
      .reduce((a, { pubkey, data }) => {
        a.set(pubkey.toString(), data)
        return a
      }, new Map<string, Circuit>())
  }

  /**
   * Create new circuit
   */
  async create(props: CreateCircuitProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.code)

    const instruction = createCreateCircuitInstruction({
      circuit,
      authority,
    }, {
      data: {
        code: props.code,
        name: props.name,
        description: props.description ?? '',
        wasmUri: props.wasmUri,
        zkeyUri: props.zkeyUri,
        privateSignals: props.privateSignals,
        publicSignals: props.publicSignals,
      },
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature, address: circuit }
    } catch (e: any) {
      console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Update circuit verification key
   */
  async updateVk(props: UpdateCircuitVkProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.code)

    const vk = Albus.zkp.encodeVerifyingKey(props.vk)

    // max tx size = 1232 bytes
    // alpha + beta + gamma + delta = 448
    // one ic item = 64

    const instructions: TransactionInstruction[] = []
    const ic_limit = 7

    instructions.push(createUpdateCircuitVkInstruction({ circuit, authority }, {
      data: {
        alpha: vk.alpha,
        beta: vk.beta,
        gamma: vk.gamma,
        delta: vk.delta,
        ic: vk.ic.slice(0, ic_limit),
        extendIc: false,
      },
    }))

    if (vk.ic.length > ic_limit) {
      instructions.push(createUpdateCircuitVkInstruction({ circuit, authority }, {
        data: {
          alpha: null,
          beta: null,
          gamma: null,
          delta: null,
          ic: vk.ic.slice(ic_limit),
          extendIc: true,
        },
      }))
    }

    try {
      const signatures: string[] = []
      for (const ix of instructions) {
        const tx = new Transaction().add(ix)
        const signature = await this.provider.sendAndConfirm(tx, [], opts)
        signatures.push(signature)
      }
      return { signatures }
    } catch (e: any) {
      console.log(e)
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete circuit by code
   */
  async delete(props: { code: string }, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.code)
    const instruction = createDeleteCircuitInstruction({
      circuit,
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

  normalizeVk() {

  }
}

export interface CreateCircuitProps {
  code: string
  name: string
  description?: string
  wasmUri: string
  zkeyUri: string
  privateSignals: string[]
  publicSignals: string[]
}

export interface UpdateCircuitVkProps {
  code: string
  vk: VK
}

interface VK {
  readonly nPublic: number
  readonly curve: string
  readonly vk_alpha_1: number[]
  readonly vk_beta_2: number[][]
  readonly vk_gamma_2: number[][]
  readonly vk_delta_2: number[][]
  readonly IC: number[][]
}
