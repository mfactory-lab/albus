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
import * as Albus from '@mfactory-lab/albus-core'
import type { Commitment, ConfirmOptions, GetAccountInfoConfig, GetMultipleAccountsConfig, PublicKeyInitData } from '@solana/web3.js'
import { PublicKey, Transaction } from '@solana/web3.js'
import type { UpdateServiceProviderData } from './generated'
import {
  ServiceProvider,
  createCreateServiceProviderInstruction,
  createDeleteServiceProviderInstruction,
  createUpdateServiceProviderInstruction,
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
   * Load {@link ServiceProvider} by {@link addr}
   * @param addr
   * @param commitmentOrConfig
   */
  async load(addr: PublicKeyInitData | ServiceProvider, commitmentOrConfig?: Commitment | GetAccountInfoConfig) {
    if (addr instanceof ServiceProvider) {
      return addr
    }
    return ServiceProvider.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitmentOrConfig)
  }

  /**
   * Load multiple {@link ServiceProvider}[]
   * @param addrs
   * @param commitmentOrConfig
   */
  async loadMultiple(addrs: PublicKey[], commitmentOrConfig?: Commitment | GetMultipleAccountsConfig) {
    return (await this.provider.connection.getMultipleAccountsInfo(addrs, commitmentOrConfig))
      .filter(acc => acc !== null)
      .map(acc => ServiceProvider.fromAccountInfo(acc!)[0])
  }

  /**
   * Load {@link ServiceProvider} by id
   * @param id
   * @param commitmentOrConfig
   */
  async loadById(id: string, commitmentOrConfig?: Commitment | GetAccountInfoConfig) {
    return this.load(this.pda.serviceProvider(id)[0], commitmentOrConfig)
  }

  /**
   * Load and unpack trustee keys
   * @param trustees
   */
  async loadTrusteeKeys(trustees: PublicKey[]) {
    const accounts = await this.provider.connection
      .getMultipleAccountsInfo(trustees, {
        dataSlice: {
          offset: 8, // discriminator
          length: 40,
        },
      })
    return accounts
      .map(acc => acc && Albus.zkp.unpackPubkey(Uint8Array.from(acc.data)))
    // .filter(acc => acc !== null) as [bigint, bigint][]
  }

  /**
   * Find {@link ServiceProvider}[]
   * @param props
   */
  async find(props: FindServicesProps = {}) {
    const builder = ServiceProvider.gpaBuilder()
      .addFilter('accountDiscriminator', serviceProviderDiscriminator)

    // after fetch filters
    const filters: CallableFunction[] = []

    if (props.noData) {
      builder.config.dataSlice = {
        offset: 0,
        length: 0,
      }
    }

    if (props.authority) {
      builder.addFilter('authority', new PublicKey(props.authority))
    }

    if (props.code) {
      builder.addFilter('code', props.code)
    }

    if (props.name) {
      builder.addFilter('name', props.name)
    }

    if (props.trustees) {
      filters.push((data: ServiceProvider) => props.trustees?.every(t => data.trustees.includes(new PublicKey(t))))
    }

    const res = (await builder.run(this.provider.connection))
      .map(acc => ({
        pubkey: acc.pubkey,
        data: props.noData ? null : ServiceProvider.fromAccountInfo(acc.account)[0],
      }))

    return filters.length === 0 ? res : res.filter(({ data }) => filters.every(f => f(data)))
  }

  /**
   * Find {@link ServiceProvider}[] and return a map
   * @param props
   */
  async findMapped(props: FindServicesProps = {}) {
    return (await this.find(props))
      .reduce((a, { pubkey, data }) => {
        a.set(pubkey.toString(), data)
        return a
      }, new Map<string, ServiceProvider | null>())
  }

  /**
   * Add new {@link ServiceProvider}
   * @param props
   * @param opts
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
        website: props.website ?? '',
        contactInfo: props.contactInfo ?? null,
        secretShareThreshold: props.secretShareThreshold ?? null,
        trustees: props.trustees ? props.trustees.map(t => new PublicKey(t)) : null,
        authority: props.authority ? new PublicKey(props.authority) : null,
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
   * Update a {@link ServiceProvider}
   *
   * @param {UpdateServiceProps} props - The properties for updating the service.
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns Promise<{signature:string}>
   */
  async update(props: UpdateServiceProps, opts?: ConfirmOptions) {
    const instruction = createUpdateServiceProviderInstruction({
      authority: this.provider.publicKey,
      serviceProvider: new PublicKey(props.serviceProvider),
      anchorRemainingAccounts: props.trustees?.map(pubkey => ({
        pubkey: new PublicKey(pubkey),
        isSigner: false,
        isWritable: false,
      })),
    }, {
      data: {
        name: props.name ?? null,
        website: props.website ?? null,
        contactInfo: props.contactInfo ?? null,
        secretShareThreshold: props.secretShareThreshold ?? null,
        newAuthority: props.newAuthority ? new PublicKey(props.newAuthority) : null,
      },
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
   * Delete a {@link ServiceProvider} by its code
   * Require admin authority
   *
   * @param {code} props - The properties for deleting the service.
   * @param props.code
   * @param {ConfirmOptions} [opts] - Optional confirmation options for the transaction.
   * @returns Promise<{signature:string}>
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

export enum ServiceContactType {
  Email = 1,
  Phone = 2,
  Telegram = 3,
}

export interface ServiceContact {
  kind: ServiceContactType
  value: string
}

export interface CreateServiceProps extends Partial<UpdateServiceProviderData> {
  code: string
  name: string
  authority?: PublicKeyInitData
  trustees?: PublicKeyInitData[]
}

export interface UpdateServiceProps extends Partial<UpdateServiceProviderData> {
  serviceProvider: PublicKeyInitData
  trustees?: PublicKeyInitData[]
}

export interface FindServicesProps {
  authority?: PublicKeyInitData
  code?: string
  name?: string
  noData?: boolean
  trustees?: PublicKeyInitData[]
}
