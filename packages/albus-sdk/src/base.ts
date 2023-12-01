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

import { Transaction } from '@solana/web3.js'
import type { ConfirmOptions, Signer, TransactionInstruction, TransactionInstructionCtorFields } from '@solana/web3.js'
import { AlbusClient } from './client'
import type { ClientProvider } from './client'
import { errorFromCode } from './generated'

export abstract class BaseManager {
  public constructor(readonly client: AlbusClient) {}

  protected traceNamespace: string = this.constructor.name

  protected get provider() {
    return this.client.provider
  }

  protected get pda() {
    return AlbusClient.pda
  }

  protected trace(...msg: any[]) {
    if (!this.client.options.debug) {
      return
    }
    console.log(`[AlbusClient][${this.traceNamespace}]`, ...msg)
  }

  protected get txBuilder() {
    return new TxBuilder(this.provider)
  }
}

export class TxBuilder {
  txs: Array<{ tx: Transaction; signers?: Signer[] }> = []

  constructor(readonly provider: ClientProvider) {
    this.addTransaction(new Transaction(), [])
  }

  addTransaction(tx: Transaction, signers?: Signer[]) {
    this.txs.push({ tx, signers })
    return this
  }

  addInstruction(...items: Array<Transaction | TransactionInstruction | TransactionInstructionCtorFields>) {
    this.txs[0]?.tx.add(...items)
    return this
  }

  addSigner(signer: Signer) {
    this.txs[0]?.signers?.push(signer)
    return this
  }

  async sendAll(opts?: ConfirmOptions) {
    try {
      // skip empty transactions
      const txs = this.txs.filter(({ tx }) => tx.instructions.length > 0)
      return await this.provider.sendAll(txs, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  async sendAndConfirm(opts?: ConfirmOptions, feePayer?: Signer) {
    try {
      if (feePayer !== undefined) {
        this.txs[0]!.tx.feePayer = feePayer.publicKey
        this.txs[0]!.signers?.push(feePayer)
      }
      return await this.provider.sendAndConfirm(this.txs[0]!.tx, this.txs[0]!.signers, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }
}
