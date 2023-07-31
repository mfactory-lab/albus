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

import { Buffer } from 'node:buffer'
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Connection, Keypair, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js'

const ARWEAVE_BASE_URL = 'https://arweave.net'
const BUNDLR_DEVNET = 'https://devnet.bundlr.network'
const BUNDLR_MAINNET = 'https://node1.bundlr.network'

export interface BundlrOpts {
  timeout?: number
  providerUrl?: string
}

export class BundlrStorageDriver {
  constructor(
    readonly provider: AnchorProvider,
  ) {
  }

  /**
   *
   * Example:
   *   https://github.com/metaplex-foundation/js/blob/281403cfc045369be82fe8e44e87f7e094e57140/packages/js/src/plugins/bundlrStorage/BundlrStorageDriver.ts#L237
   *
   */
  async uploadData(data: Buffer | Uint8Array | string, opts: BundlrOpts = {}) {
    const bundlr = await this.initBundlr(opts)
    const response = await bundlr.uploader.uploadData(Buffer.from(data), {
      tags: [{ name: 'Content-Type', value: 'application/ld+json' }],
    })

    console.log(response)

    // return response.public
    return `${ARWEAVE_BASE_URL}/${response.id}`
  }

  private async initBundlr(opts: BundlrOpts = {}) {
    const options = {
      timeout: opts.timeout,
      providerUrl: opts.providerUrl ?? this.provider.connection.rpcEndpoint,
    }

    let address
    if (options.providerUrl.includes('localhost')
      || options.providerUrl.includes('devnet')
      || options.providerUrl.includes('testnet')) {
      address = BUNDLR_DEVNET
    } else {
      address = BUNDLR_MAINNET
    }

    const bundlr = _removeDoubleDefault(await import('@bundlr-network/client'))

    if ('payer' in this.provider.wallet) {
      const identity = this.provider.wallet.payer as Keypair
      return new bundlr.NodeBundlr(address, 'solana', identity.secretKey, options)
    }

    return new bundlr.WebBundlr(address, 'solana', this.bundlrWallet, options)
  }

  get bundlrWallet() {
    return {
      publicKey: this.provider.publicKey,
      signMessage: (message: Uint8Array) => {
        // this.provider.wallet.signMessage(message)
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
        return this.provider
          .connection
          .sendTransaction(transaction, signers, sendOptions)
      },
    }
  }
}

/**
 * This method is necessary to import certain packages on both ESM and CJS modules.
 * Without this, we get a different structure on each module. For instance:
 * - CJS: { default: [Getter], WebBundlr: [Getter] }
 * - ESM: { default: { default: [Getter], WebBundlr: [Getter] } }
 * This method fixes this by ensure there is not double default in the imported package.
 */
export function _removeDoubleDefault<T>(pkg: T): T {
  if (
    pkg
    && typeof pkg === 'object'
    && 'default' in pkg
    && 'default' in (pkg as any).default
  ) {
    return (pkg as any).default
  }

  return pkg
}
