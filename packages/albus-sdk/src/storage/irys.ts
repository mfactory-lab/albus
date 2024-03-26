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

import type {
  Connection,
  Keypair,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js'

// eslint-disable-next-line import/no-named-default
import { default as NodeIrys, WebIrys } from '@irys/sdk'
import BigNumber from 'bignumber.js'
import type { ClientProvider } from '../client'
import type { StorageDriver, StorageFile } from './index'

export type IrysOptions = {
  address?: string
  timeout?: number
  providerUrl?: string
  priceMultiplier?: number
  identity?: Signer
}

export type IrysWalletAdapter = {
  publicKey: PublicKey | null
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction?: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions & { signers?: Signer[] }
  ) => Promise<TransactionSignature>
}

const ARWEAVE_BASE_URL = 'https://arweave.net'
const IRYS_DEVNET = 'https://devnet.irys.xyz'
const IRYS_MAINNET = 'https://node1.irys.xyz'

const MIN_WITHDRAW_BALANCE = 5000

/// Size of irys transaction header
const HEADER_SIZE = 2_000

/// Minimum file size for cost calculation
const MINIMUM_SIZE = 80_000

export class IrysStorageDriver implements StorageDriver {
  protected _irys: WebIrys | NodeIrys | null = null
  protected _options: IrysOptions

  constructor(
    readonly provider: ClientProvider,
    options: IrysOptions = {},
  ) {
    this._options = {
      providerUrl: provider.connection.rpcEndpoint,
      ...options,
    }
  }

  async getUploadPrice(bytes: number): Promise<number> {
    const irys = await this.irys()
    const price = await irys.getPrice(bytes)
    return price.multipliedBy(this._options.priceMultiplier ?? 1.1).toNumber()
  }

  async getUploadPriceForFiles(files: StorageFile[]): Promise<number> {
    const bytes: number = files.reduce((sum, file) => {
      return sum + HEADER_SIZE + Math.max(MINIMUM_SIZE, file.buffer.byteLength)
    }, 0)

    return this.getUploadPrice(bytes)
  }

  async upload(file: StorageFile): Promise<string> {
    const [uri] = await this.uploadAll([file])
    return uri!
  }

  async uploadAll(files: StorageFile[]): Promise<string[]> {
    const irys = await this.irys()
    const amount = await this.getUploadPrice(
      files.reduce((acc, file) => acc + file.buffer.byteLength, 0),
    )
    await this.fund(amount)

    const promises = files.map(async (file) => {
      const irysTx = irys.createTransaction(file, {
        // tags: getMetaplexFileTagsWithContentType(file),
      })
      await irysTx.sign()

      const { status, data } = await irys.uploader.uploadTransaction(irysTx)

      if (status >= 300) {
        throw new AssetUploadFailedError(status)
      }

      return `${ARWEAVE_BASE_URL}/${data.id}`
    })

    return Promise.all(promises)
  }

  async uploadData(data: string) {
    const irys = await this.irys()
    const bytes = new TextEncoder().encode(data)
    const amount = await this.getUploadPrice(bytes.byteLength)
    await this.fund(amount)
    const response = await irys.uploader.uploadData(data, {
      tags: [{ name: 'Content-Type', value: 'application/ld+json' }],
    })
    return `${ARWEAVE_BASE_URL}/${response.id}`
  }

  async getBalance(): Promise<number> {
    const irys = await this.irys()
    const balance = await irys.getLoadedBalance()

    return balance.toNumber()
  }

  async fund(amount: number | BigNumber, skipBalanceCheck = false): Promise<void> {
    const irys = await this.irys()
    let toFund = new BigNumber(amount)

    if (!skipBalanceCheck) {
      const balance = await irys.getLoadedBalance()

      toFund = toFund.isGreaterThan(balance)
        ? toFund.minus(balance)
        : new BigNumber(0)
    }

    if (toFund.isLessThanOrEqualTo(0)) {
      return
    }

    // TODO: Catch errors and wrap in irysErrors.
    await irys.fund(toFund.integerValue())
  }

  async withdrawAll(): Promise<void> {
    const irys = await this.irys()
    const balance = await irys.getLoadedBalance()
    const minimumBalance = MIN_WITHDRAW_BALANCE
    if (balance.isLessThan(minimumBalance)) {
      return
    }
    const balanceToWithdraw = balance.minus(minimumBalance)
    await this.withdraw(balanceToWithdraw.toNumber())
  }

  async withdraw(amount: number | string): Promise<void> {
    const irys = await this.irys()
    try {
      await irys.withdrawBalance(amount)
    } catch (e: any) {
      throw new IrysWithdrawError(
        e instanceof Error ? e.message : e.toString(),
      )
    }
  }

  async irys(): Promise<WebIrys | NodeIrys> {
    if (this._irys) {
      return this._irys
    }

    return (this._irys = await this.initIrys())
  }

  async initIrys(): Promise<WebIrys | NodeIrys> {
    const currency = 'solana'
    let address = this._options?.address
    const options = {
      timeout: this._options.timeout,
      providerUrl: this._options.providerUrl,
    }

    // automatically set address if not set
    if (!address) {
      if (options.providerUrl?.includes('localhost')
        || options.providerUrl?.includes('devnet')
        || options.providerUrl?.includes('testnet')) {
        address = IRYS_DEVNET
      } else {
        address = IRYS_MAINNET
      }
    }

    // eslint-disable-next-line node/prefer-global/process,no-prototype-builtins
    const isNode = typeof window === 'undefined' || window.process?.hasOwnProperty('type')

    let irys: WebIrys | NodeIrys
    if (isNode && 'payer' in this.provider.wallet) {
      const identity = this.provider.wallet.payer as Keypair
      irys = await this.initNodeIrys(address, currency, identity, options)
    } else {
      irys = await this.initWebIrys(address, currency, options)
    }

    try {
      // Check for valid irys node.
      await irys.utils.getBundlerAddress(currency)
    } catch (error) {
      throw new FailedToConnectToIrysAddressError(address, error as Error)
    }

    return irys
  }

  async initNodeIrys(
    address: string,
    currency: string,
    keypair: Keypair,
    options: any,
  ): Promise<NodeIrys> {
    // const bPackage = await import('@irys/sdk')

    return new NodeIrys({
      url: address,
      token: currency,
      key: keypair.secretKey,
      config: options,
    })
  }

  async initWebIrys(
    address: string,
    currency: string,
    options: any,
  ): Promise<WebIrys> {
    const wallet: IrysWalletAdapter = {
      publicKey: this.provider.publicKey,
      signMessage: async (_message: Uint8Array) => {
        throw new Error('Not implemented')
      },
      signTransaction: (transaction: Transaction) =>
        this.provider.wallet.signTransaction(transaction),
      signAllTransactions: (transactions: Transaction[]) =>
        this.provider.wallet.signAllTransactions(transactions),
      sendTransaction: (
        transaction: Transaction,
        connection: Connection,
        options: SendOptions & { signers?: Signer[] } = {},
      ): Promise<TransactionSignature> => {
        const { signers = [], ...sendOptions } = options
        return this.provider.sendAndConfirm(transaction, signers, sendOptions)
      },
    }

    // const { WebIrys } = await import('@irys/sdk')
    // const bPackage = _removeDoubleDefault(await import('@irys/sdk'))
    const irys = new WebIrys({
      url: address,
      token: currency,
      wallet: { provider: wallet },
      config: options,
    })

    try {
      await irys.ready()
    } catch (error) {
      throw new FailedToInitializeIrysError(error as Error)
    }

    return irys
  }
}

/** @group Errors */
export class IrysError extends Error {
  readonly name: string = 'IrysError'
  readonly cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.cause = cause
    this.message
        = `${this.message
         }\n\n${
         this.cause ? `\n\nCaused By: ${this.cause}` : ''
         }\n`
  }
}

/** @group Errors */
export class FailedToInitializeIrysError extends IrysError {
  readonly name: string = 'FailedToInitializeIrysError'
  constructor(cause: Error) {
    const message
        = 'Irys could not be initialized. '
        + 'Please check the underlying error below for more details.'
    super(message, cause)
  }
}

/** @group Errors */
export class FailedToConnectToIrysAddressError extends IrysError {
  readonly name: string = 'FailedToConnectToIrysAddressError'
  constructor(address: string, cause: Error) {
    const message
        = `Irys could not connect to the provided address [${address}]. `
        + 'Please ensure the provided address is valid. Some valid addresses include: '
        + '"https://node1.irys.xyz" for mainnet and "https://devnet.irys.xyz" for devnet'
    super(message, cause)
  }
}

/** @group Errors */
export class AssetUploadFailedError extends IrysError {
  readonly name: string = 'AssetUploadFailedError'
  constructor(status: number) {
    const message
        = `The asset could not be uploaded to the Irys network and `
        + `returned the following status code [${status}].`
    super(message)
  }
}
export class IrysWithdrawError extends IrysError {
  readonly name: string = 'IrysWithdrawError'
  constructor(error: string) {
    const message
        = `The balance could not be withdrawn from the Irys network and `
        + `returned the following error: ${error}.`
    super(message)
  }
}
