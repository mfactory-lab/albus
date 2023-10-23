// /*
//  * This file is part of Albus code.
//  *
//  * Copyright (c) 2023, mFactory GmbH
//  *
//  * Albus is free software: you can redistribute it
//  * and/or modify it under the terms of the GNU Affero General Public License
//  * as published by the Free Software Foundation, either version 3
//  * of the License, or (at your option) any later version.
//  *
//  * Albus is distributed in the hope that it
//  * will be useful, but WITHOUT ANY WARRANTY; without even the implied
//  * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//  * See the GNU Affero General Public License for more details.
//  *
//  * You should have received a copy of the GNU Affero General Public License
//  * along with this program.
//  * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
//  *
//  * You can be released from the requirements of the Affero GNU General Public License
//  * by purchasing a commercial license. The purchase of such a license is
//  * mandatory as soon as you develop commercial activities using the
//  * Albus code without disclosing the source code of
//  * your own applications.
//  *
//  * The developer of this program can be contacted at <info@albus.finance>.
//  */
//
// import type { AnchorProvider } from '@coral-xyz/anchor'
// import type { Connection, Keypair, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js'
//
// import type { WebBundlr } from '@bundlr-network/client'
// import type { NodeBundlr } from '@bundlr-network/client/build/cjs/node'
//
// const ARWEAVE_BASE_URL = 'https://arweave.net'
// const BUNDLR_DEVNET = 'https://devnet.bundlr.network'
// const BUNDLR_MAINNET = 'https://node1.bundlr.network'
//
// export interface BundlrOpts {
//   timeout?: number
//   providerUrl?: string
// }
//
// export class BundlrStorageDriver {
//   protected _bundlr: WebBundlr | NodeBundlr | undefined
//   protected _opts: BundlrOpts | undefined
//
//   constructor(
//     readonly provider: AnchorProvider,
//   ) {
//   }
//
//   configure(opts: BundlrOpts) {
//     this._bundlr = undefined
//     this._opts = opts
//   }
//
//   /**
//    *
//    * Example:
//    *   https://github.com/metaplex-foundation/js/blob/281403cfc045369be82fe8e44e87f7e094e57140/packages/js/src/plugins/bundlrStorage/BundlrStorageDriver.ts#L237
//    *
//    */
//   async uploadData(data: string) {
//     const bundlr = await this.bundlr()
//     const bytes = new TextEncoder().encode(data)
//
//     const amount = await this.getUploadPrice(bytes.byteLength)
//     await this.fund(amount)
//
//     const response = await bundlr.uploader.uploadData(data, {
//       tags: [{ name: 'Content-Type', value: 'application/ld+json' }],
//     })
//
//     // return response.public
//     return `${ARWEAVE_BASE_URL}/${response.id}`
//   }
//
//   async getUploadPrice(bytes: number): Promise<number> {
//     const bundlr = await this.bundlr()
//     const price = await bundlr.getPrice(bytes)
//     return price.toNumber()
//   }
//
//   async fund(amount: number, skipBalanceCheck = false): Promise<void> {
//     const bundlr = await this.bundlr()
//     let toFund = amount
//
//     if (!skipBalanceCheck) {
//       const balance = await bundlr.getLoadedBalance()
//
//       toFund = toFund > balance.toNumber()
//         ? toFund - balance.toNumber()
//         : 0
//     }
//
//     if (toFund <= 0) {
//       return
//     }
//
//     // TODO: Catch errors and wrap in BundlrErrors.
//     await bundlr.fund(toFund, 1.1)
//   }
//
//   async bundlr(): Promise<WebBundlr | NodeBundlr> {
//     if (this._bundlr) {
//       return this._bundlr
//     }
//
//     return (this._bundlr = await this.initBundlr())
//   }
//
//   async initBundlr(): Promise<WebBundlr | NodeBundlr> {
//     const currency = 'solana'
//
//     const options = {
//       timeout: this._opts?.timeout,
//       providerUrl: this._opts?.providerUrl ?? this.provider.connection.rpcEndpoint,
//     }
//
//     let address: string
//     if (options.providerUrl.includes('localhost')
//       || options.providerUrl.includes('devnet')
//       || options.providerUrl.includes('testnet')) {
//       address = BUNDLR_DEVNET
//     } else {
//       address = BUNDLR_MAINNET
//     }
//
//     // eslint-disable-next-line n/prefer-global/process,no-prototype-builtins
//     const isNode = typeof window === 'undefined' || window.process?.hasOwnProperty('type')
//
//     if (isNode && 'payer' in this.provider.wallet) {
//       const identity = this.provider.wallet.payer as Keypair
//       return this.initNodeBundlr(address, currency, identity, options)
//     }
//
//     return this.initWebBundlr(address, currency, options)
//   }
//
//   async initNodeBundlr(
//     address: string,
//     currency: string,
//     keypair: Keypair,
//     options: any,
//   ): Promise<NodeBundlr> {
//     const { NodeBundlr } = await import('@bundlr-network/client')
//     return new NodeBundlr(address, currency, keypair.secretKey, options)
//   }
//
//   async initWebBundlr(
//     address: string,
//     currency: string,
//     options: any,
//   ): Promise<WebBundlr> {
//     const wallet = {
//       publicKey: this.provider.publicKey,
//       signMessage: (_msg: Uint8Array) => {
//         // this.provider.wallet.signMessage(msg)
//       },
//       signTransaction: (transaction: Transaction) =>
//         this.provider.wallet.signTransaction(transaction),
//       signAllTransactions: (transactions: Transaction[]) =>
//         this.provider.wallet.signAllTransactions(transactions),
//       sendTransaction: (
//         tx: Transaction,
//         _connection: Connection,
//         options: SendOptions & { signers?: Signer[] } = {},
//       ): Promise<TransactionSignature> => {
//         console.log('sendTransaction', options)
//         console.log(this.provider.wallet)
//         const { signers = [], ...sendOptions } = options
//         return this.provider.sendAndConfirm(tx, signers, sendOptions)
//       },
//     }
//
//     const { WebBundlr } = await import('@bundlr-network/client')
//
//     const bundlr = new WebBundlr(address, currency, wallet, options)
//
//     // Try to initiate bundlr.
//     await bundlr.ready()
//
//     return bundlr as any
//   }
// }
