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

import { Buffer } from 'node:buffer'
import type { VerifiableCredential, VerifiablePresentation } from '@albus-finance/core'
import { credential } from '@albus-finance/core'
import type { Connection, Keypair, PublicKeyInitData } from '@solana/web3.js'
import type { IPresentationDefinition } from '@sphereon/pex'
import type { Wallet } from './types'
import type { ClientOptions } from './client'
import { AlbusClient } from './client'
import type { UpdateCredentialProps } from './credentialManager'
import type {
  CreateCredentialSpecProps,
  DeleteCredentialSpecProps,
  FindCredentialSpecProps,
} from './credentialSpecManager'
import type { FindCredentialRequestProps } from './credentialRequestManager'
import type { SendOpts } from './utils'

export class AlbusIssuerClient {
  constructor(private readonly client: AlbusClient) {
  }

  static fromWallet(connection: Connection, wallet?: Wallet, opts?: ClientOptions) {
    return new this(
      AlbusClient.fromWallet(connection, wallet, opts),
    )
  }

  static fromKeypair(connection: Connection, keypair: Keypair, opts?: ClientOptions) {
    return new this(
      AlbusClient.fromKeypair(connection, keypair, opts),
    )
  }

  /**
   * Create a new credential spec.
   */
  createCredentialSpec(props: CreateCredentialSpecProps, opts?: SendOpts) {
    return this.client.credentialSpec.create(props, opts)
  }

  /**
   * Delete a credential spec.
   */
  deleteCredentialSpec(props: DeleteCredentialSpecProps, opts?: SendOpts) {
    return this.client.credentialSpec.delete(props, opts)
  }

  /**
   * Load credential spec by the given address.
   */
  loadCredentialSpec(addr: PublicKeyInitData) {
    return this.client.credentialSpec.load(addr)
  }

  /**
   * Find credential specs with the given filters.
   */
  findCredentialSpec(props: FindCredentialSpecProps) {
    return this.client.credentialSpec.find(props)
  }

  /**
   * Load credential request by the given address.
   */
  loadCredentialRequest(addr: PublicKeyInitData) {
    return this.client.credentialRequest.load(addr)
  }

  /**
   * Find credential requests with the given filters.
   */
  findCredentialRequest(props: FindCredentialRequestProps) {
    return this.client.credentialRequest.find(props)
  }

  /**
   * Create a credential with the provided claims and options.
   */
  createCredential(claims: Record<string, any>, opts: credential.CreateCredentialOpts) {
    return credential.createVerifiableCredential(claims, opts)
  }

  /**
   * Verify a credential.
   */
  verifyCredential(vc: VerifiableCredential, opts?: credential.VerifyCredentialOpts) {
    return credential.verifyCredential(vc, opts)
  }

  /**
   * Verify a presentation.
   */
  verifyPresentation(vp: VerifiablePresentation, opts?: credential.VerifyPresentationOpts) {
    return credential.verifyPresentation(vp, opts)
  }

  /**
   * Issue a new credential, and return the URI of the uploaded credential.
   */
  async issueCredential(claims: Record<string, any>, opts: credential.CreateCredentialOpts, selfCheck = true) {
    const vc = await this.createCredential(claims, opts)
    if (selfCheck) {
      await credential.verifyCredential(vc)
    }
    return this.client.storage.upload(
      Buffer.from(JSON.stringify(vc)),
    )
  }

  /**
   * Update the credential.
   */
  async updateCredential(props: UpdateCredentialProps & { credentialRequest: PublicKeyInitData }, opts?: SendOpts) {
    return this.client.credential.update({
      credentialRequest: props.credentialRequest,
      uri: props.uri,
    }, opts)
  }

  /**
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   * presentationDefinition: It can be either v1 or v2 of presentationDefinition
   */
  evaluatePresentation(definition: IPresentationDefinition, vp: VerifiablePresentation) {
    return credential.PexHelper.evaluatePresentation(definition, vp)
  }
}
