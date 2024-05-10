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
import type { Commitment, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { BaseManager } from './base'
import {
  Policy,
  createCreatePolicyInstruction,
  createDeletePolicyInstruction,
  createUpdatePolicyInstruction,
  policyDiscriminator,
} from './generated'
import type { SendOpts } from './utils'

const ID_SEPARATOR = '_'

export class PolicyManager extends BaseManager {
  /**
   * Load a policy based on its public key address.
   *
   * @param {PublicKeyInitData} addr - The public key address of the policy to load.
   * @param {Commitment} [commitment] - Optional commitment level for loading the policy.
   * @returns {Promise<Policy>} A Promise that resolves to the loaded policy.
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return Policy.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load a policy by its unique identifier.
   * The identifier should be in the format: `serviceCode_policyCode`.
   *
   * @param {string} id - The unique identifier of the policy to load (e.g., `acme_123`).
   * @param {Commitment} [commitment] - Optional commitment level for loading the policy.
   * @returns {Promise<Policy>} A Promise that resolves to the loaded policy.
   * @throws {Error} Throws an error if the provided policy identifier is invalid or if there's an issue loading the policy.
   */
  async loadById(id: string, commitment?: Commitment) {
    const [serviceCode, policyCode] = id.split(ID_SEPARATOR)
    if (!serviceCode || !policyCode) {
      throw new Error('invalid policy id')
    }
    const service = this.pda.serviceProvider(serviceCode)[0]
    return this.load(this.pda.policy(service, policyCode)[0], commitment)
  }

  /**
   * Find policies based on specified criteria.
   *
   * @param {FindPolicyProps} [props] - Optional properties for customizing the policy search.
   * @returns {Promise<{pubkey: PublicKey, data: Policy}[]>} A Promise that resolves to an array of policy results.
   */
  async find(props: FindPolicyProps = {}) {
    const builder = Policy.gpaBuilder(this.programId)
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

  createIx(props: CreatePolicyProps) {
    const authority = this.provider.publicKey
    const [circuit] = this.pda.circuit(props.circuitCode)
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [address] = this.pda.policy(serviceProvider, props.code)

    const ix = createCreatePolicyInstruction({
      policy: address,
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
        rules: preparePolicyRules(props),
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Add a new policy with the specified properties.
   */
  async create(props: CreatePolicyProps, opts?: SendOpts) {
    const { instructions, address } = this.createIx(props)
    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)
    return { address, signature }
  }

  updateIx(props: UpdatePolicyProps) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [address] = this.pda.policy(serviceProvider, props.code)

    const ix = createUpdatePolicyInstruction({
      policy: address,
      serviceProvider,
      authority,
    }, {
      data: {
        name: props.name ?? null,
        description: props.description ?? null,
        expirationPeriod: props.expirationPeriod ?? null,
        retentionPeriod: props.retentionPeriod ?? null,
        rules: preparePolicyRules(props),
      },
    }, this.programId)

    return {
      address,
      instructions: [ix],
    }
  }

  /**
   * Update a policy with the specified properties.
   */
  async update(props: UpdatePolicyProps, opts?: SendOpts) {
    const { instructions, address } = this.updateIx(props)
    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)
    return { address, signature }
  }

  deleteIx(props: DeletePolicyProps) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.serviceCode)
    const [policy] = this.pda.policy(serviceProvider, props.code)

    const ix = createDeletePolicyInstruction({
      policy,
      serviceProvider,
      authority,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete a policy based on the specified properties.
   */
  async delete(props: DeletePolicyProps, opts?: SendOpts) {
    const { instructions } = this.deleteIx(props)
    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)
    return { signature }
  }

  async deleteByAddrIx(addr: PublicKeyInitData) {
    const policy = await this.load(addr)

    const ix = createDeletePolicyInstruction({
      policy: new PublicKey(addr),
      serviceProvider: policy.serviceProvider,
      authority: this.provider.publicKey,
    }, this.programId)

    return {
      instructions: [ix],
    }
  }

  /**
   * Delete policy by address.
   */
  async deleteByAddr(addr: PublicKeyInitData, opts?: SendOpts) {
    const { instructions } = await this.deleteByAddrIx(addr)

    const signature = await this.txBuilder
      .addInstruction(...instructions)
      .sendAndConfirm(opts)

    return { signature }
  }
}

function preparePolicyRules(props: UpdatePolicyProps) {
  return props.rules?.map(r => ({
    key: r.key,
    label: r.label ?? '',
    value: Array.from(
      Albus.crypto.ffUtils.beInt2Buff(
        Albus.credential.ClaimsTree.encodeValue(
          Array.isArray(r.value) ? new TextDecoder().decode(Uint8Array.from(r.value)) : r.value,
        ),
        32,
      ),
    ),
  })) ?? []
}

export type CreatePolicyProps = {
  circuitCode: string
  name: string
} & UpdatePolicyProps

export type UpdatePolicyProps = {
  serviceCode: string
  code: string
  name?: string
  description?: string
  expirationPeriod?: number
  retentionPeriod?: number
  rules?: Array<{
    key: string
    value: string | number | bigint | number[]
    label?: string
  }>
}

export type DeletePolicyProps = {
  serviceCode: string
  code: string
}

export type FindPolicyProps = {
  circuitCode?: string
  serviceCode?: string
  withoutData?: boolean
}
