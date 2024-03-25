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
 * The developer of this program can be contacted at <info@finance>.
 */

import { credential } from '@albus-finance/core'
import type { ConfirmOptions, Connection, Keypair, PublicKeyInitData } from '@solana/web3.js'
import type { Claims, VerifiableCredential, VerifiablePresentation } from '@albus-finance/core'
import type { Wallet } from './types'
import { AlbusClient } from './client'
import type { TxOpts, UpdateCredentialProps } from './credentialManager'
import type {
  FindCredentialSpecProps,
} from './credentialSpecManager'
import type { FindCredentialRequestProps } from './credentialRequestManager'

export class AlbusIssuerClient {
  constructor(private readonly client: AlbusClient) {
  }

  static fromWallet(connection: Connection, wallet?: Wallet, opts?: ConfirmOptions) {
    return new this(
      AlbusClient.fromWallet(connection, wallet, opts),
    )
  }

  static fromKeypair(connection: Connection, keypair: Keypair, opts?: ConfirmOptions) {
    return new this(
      AlbusClient.fromKeypair(connection, keypair, opts),
    )
  }

  createVerifiableCredential(claims: Claims, opts: credential.CreateCredentialOpts) {
    return credential.createVerifiableCredential(claims, opts)
  }

  verifyVerifiableCredential(vc: VerifiableCredential, opts: credential.VerifyCredentialOpts) {
    return credential.verifyCredential(vc, opts)
  }

  verifyCredentialRequest(addr: PublicKeyInitData) {
    // TODO:
  }

  verifyVerifiablePresentation(vc: VerifiablePresentation) {
    // TODO:
  }

  loadCredentialSpec(props: PublicKeyInitData) {
    return this.client.credentialSpec.load(props)
  }

  findCredentialSpec(props: FindCredentialSpecProps) {
    return this.client.credentialSpec.find(props)
  }

  /**
   * Load credential request with the given properties.
   */
  loadCredentialRequest(props: PublicKeyInitData) {
    return this.client.credentialRequest.load(props)
  }

  /**
   * Find credential requests
   */
  findCredentialRequest(props: FindCredentialRequestProps) {
    return this.client.credentialRequest.find(props)
  }

  /**
   * Update a credential with the provided properties.
   */
  async updateCredential(props: UpdateCredentialProps & { credentialRequest: PublicKeyInitData }, opts?: TxOpts) {
    return this.client.credential.update({
      credentialRequest: props.credentialRequest,
      uri: props.uri,
    }, opts)
  }
}
