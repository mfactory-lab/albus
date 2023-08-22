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

import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import type { PolicyRule } from './generated'
import {
  Policy,
  createCreatePolicyInstruction,
  createDeletePolicyInstruction,
  errorFromCode,
  policyDiscriminator,
} from './generated'
import type { PdaManager } from './pda'

const ID_SEPARATOR = '_'

export class PolicyManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load policy by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Policy.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load policy by id
   * Example: `acme_123`
   */
  async loadById(id: string, commitment?: Commitment) {
    const [serviceId, policyId] = id.split(ID_SEPARATOR)
    if (!serviceId || !policyId) {
      throw new Error('invalid policy id')
    }
    const service = this.pda.serviceProvider(serviceId)[0]
    return this.load(this.pda.policy(service, policyId)[0], commitment)
  }

  /**
   * Find policies
   */
  async find(props: FindPolicyProps = {}) {
    const builder = Policy.gpaBuilder()
      .addFilter('accountDiscriminator', policyDiscriminator)

    if (props.withoutData) {
      builder.config.dataSlice = { offset: 0, length: 0 }
    }

    if (props.circuitCode) {
      builder.addFilter('circuit', this.pda.circuit(props.circuitCode)[0])
    }

    if (props.serviceCode) {
      builder.addFilter('serviceProvider', this.pda.serviceProvider(props.serviceCode)[0])
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: !props.withoutData ? Policy.fromAccountInfo(acc.account)[0] : null,
      }
    })
  }

  /**
   * Add new policy
   */
  async create(props: CreatePolicyProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.circuitCode)
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.code)

    const instruction = createCreatePolicyInstruction({
      policy,
      circuit,
      serviceProvider,
      authority,
    }, {
      data: {
        name: props.name,
        code: props.code,
        description: props.description ?? '',
        expirationPeriod: props.expirationPeriod ?? 0,
        retentionPeriod: props.retentionPeriod ?? 0,
        rules: props.rules ?? [],
      },
    })

    try {
      const tx = new Transaction().add(instruction)
      const signature = await this.provider.sendAndConfirm(tx, [], opts)
      return { signature, address: policy }
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  /**
   * Delete policy
   */
  async delete(props: DeletePolicyProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.code)

    const instruction = createDeletePolicyInstruction({
      policy,
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

export interface CreatePolicyProps {
  circuitCode: string
  serviceCode: string
  code: string
  name: string
  description?: string
  expirationPeriod?: number
  retentionPeriod?: number
  rules?: PolicyRule[]
}

export interface DeletePolicyProps {
  serviceCode: string
  code: string
}

export interface FindPolicyProps {
  circuitCode?: string
  serviceCode?: string
  withoutData?: boolean
}
