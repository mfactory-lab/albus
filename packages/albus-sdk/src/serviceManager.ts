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
import {
  ServiceProvider,
  createCreateServiceProviderInstruction,
  createDeleteServiceProviderInstruction,
  errorFromCode, serviceProviderDiscriminator,
} from './generated'
import type { PdaManager } from './pda'

export class ServiceManager {
  constructor(
    readonly provider: AnchorProvider,
    readonly pda: PdaManager,
  ) {
  }

  /**
   * Load service by {@link addr}
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return ServiceProvider.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load service by id
   */
  async loadById(id: string, commitment?: Commitment) {
    return this.load(this.pda.serviceProvider(id)[0], commitment)
  }

  /**
   * Find services
   */
  async find(filter: FindServicesProps = {}) {
    const builder = ServiceProvider.gpaBuilder()
      .addFilter('accountDiscriminator', serviceProviderDiscriminator)

    if (filter.authority) {
      builder.addFilter('authority', filter.authority)
    }

    return (await builder.run(this.provider.connection)).map((acc) => {
      return {
        pubkey: acc.pubkey,
        data: ServiceProvider.fromAccountInfo(acc.account)[0],
      }
    })
  }

  /**
   * Add new service
   */
  async create(props: CreateServiceProps, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.code)
    const instruction = createCreateServiceProviderInstruction({
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
   * Delete service
   */
  async delete(props: { code: string }, opts?: ConfirmOptions) {
    const authority = this.provider.publicKey
    const [serviceProvider] = this.pda.serviceProvider(props.code)
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

export interface CreateServiceProps {
  code: string
  name: string
}

export interface FindServicesProps {
  authority?: PublicKey
}
