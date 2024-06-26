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

import type { AlbusClient } from './client'
import type { IFullLogger, Logger } from './utils'
import { TxBuilder, noopLogger, toFullLogger } from './utils'

export abstract class BaseManager {
  protected logger: IFullLogger
  private _txBuilder?: TxBuilder

  public constructor(readonly client: AlbusClient, log: Logger = noopLogger) {
    this.logger = toFullLogger(client.options.logger ?? log)
  }

  public setLogger(logger: Logger) {
    this.logger = toFullLogger(logger)
  }

  get txBuilder() {
    return this._txBuilder ?? new TxBuilder(this.client.provider)
      .withPriorityFeeLoader(this.client.options?.priorityFeeLoader)
      .withPriorityFee(this.client.options?.priorityFee ?? 0)
  }

  public setTxBuilder(txBuilder: TxBuilder) {
    this._txBuilder = txBuilder
  }

  protected get programId() {
    return this.client.programId
  }

  protected get provider() {
    return this.client.provider
  }

  protected get pda() {
    return this.client.pda
  }
}
