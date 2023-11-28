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
import type { AlbusClient, ClientProvider } from './client'
import { errorFromCode } from './generated'

export abstract class BaseManager {
  public constructor(readonly client: AlbusClient) {}

  protected traceNamespace: string = this.constructor.name

  protected get provider() {
    return this.client.provider
  }

  protected get pda() {
    return this.client.pda
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
  tx = new Transaction()
  signers: Signer[] = []

  constructor(readonly provider: ClientProvider) {
  }

  addInstruction(...items: Array<Transaction | TransactionInstruction | TransactionInstructionCtorFields>) {
    this.tx.add(...items)
    return this
  }

  addSigner(signer: Signer) {
    this.signers.push(signer)
    return this
  }

  async sendAndConfirm(opts?: TxOpts) {
    try {
      if (opts?.feePayer) {
        this.tx.feePayer = opts.feePayer.publicKey
        this.addSigner(opts.feePayer)
      }
      return await this.provider.sendAndConfirm(this.tx, this.signers, {
        ...this.provider.opts,
        ...opts?.confirm,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }
}

export type TxOpts = {
  confirm?: ConfirmOptions
  feePayer?: Signer
}
