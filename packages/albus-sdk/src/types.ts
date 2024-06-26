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

import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type PrivateKey = number[] | string | Uint8Array
export type AlbusNftCode = 'DC' | 'ID'

export type Wallet = {
  publicKey: PublicKey
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>
}

export enum KnownSignals {
  Timestamp = 'timestamp',
  CredentialRoot = 'credentialRoot',
  IssuerPublicKey = 'issuerPk',
  IssuerSignature = 'issuerSignature',
  UserPrivateKey = 'userPrivateKey',
  TrusteePublicKey = 'trusteePublicKey',
}
