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
import type { Connection, Keypair, PublicKeyInitData } from '@solana/web3.js'
import type { ArgumentsType } from 'vitest'
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
import { CredentialRequestStatus } from './generated'

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

  // issuer?: { pubkey: PublicKey, data: Issuer }
  //
  // async init() {
  //   if (!this.client.provider.publicKey) {
  //     return
  //   }
  //   // Try to find the issuer account by the authority public key
  //   await this.findIssuerByAuthority()
  // }
  //
  // /**
  //  * Finds the issuer account by the authority public key and sets the `issuer` property.
  //  *
  //  * @throws {IssuerNotFound} - If the issuer account is not found.
  //  */
  // async findIssuerByAuthority() {
  //   const [iss] = await this.client.issuer.find({
  //     authority: this.client.provider.publicKey,
  //   })
  //   if (!iss) {
  //     throw new IssuerNotFound()
  //   }
  //   this.issuer = {
  //     pubkey: iss.pubkey,
  //     data: iss.data!,
  //   }
  // }

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
  createCredential(...args: ArgumentsType<typeof credential.createVerifiableCredential>) {
    return credential.createVerifiableCredential(...args)
  }

  /**
   * Update the credential.
   */
  updateCredential(props: UpdateCredentialProps & { credentialRequest: PublicKeyInitData }, opts?: SendOpts) {
    return this.client.credential.update({
      credentialRequest: props.credentialRequest,
      uri: props.uri,
    }, opts)
  }

  /**
   * Verify a credential.
   */
  verifyCredential(...args: ArgumentsType<typeof credential.verifyCredential>) {
    return credential.verifyCredential(...args)
  }

  /**
   * Verify a presentation.
   */
  verifyPresentation(...args: ArgumentsType<typeof credential.verifyPresentation>) {
    return credential.verifyPresentation(...args)
  }

  /**
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   * presentationDefinition: It can be either v1 or v2 of presentationDefinition
   */
  evaluatePresentation(...args: ArgumentsType<typeof credential.PexHelper.evaluatePresentation>): typeof credential.EvaluationResults {
    return credential.PexHelper.evaluatePresentation(...args)
  }

  /**
   * Add instructions to reject the credential request
   *
   * @param {object} props - The properties for rejecting the credential request.
   * @param {PublicKeyInitData} props.credentialRequest - The credential request to reject.
   * @param {PublicKeyInitData} props.issuer - The issuer of the credential request.
   * @param {string} [props.message] - Optional message for rejecting the credential request.
   * @param {SendOpts} [opts] - Optional send options.
   */
  async rejectCredentialRequest(props: { credentialRequest: PublicKeyInitData, issuer: PublicKeyInitData, message?: string }, opts?: SendOpts) {
    const txBuilder = this.client.credential.txBuilder

    // Add instructions to reject the credential request
    txBuilder.addInstruction(
      ...this.client.credentialRequest.updateIx({
        credentialRequest: props.credentialRequest,
        issuer: props.issuer,
        status: CredentialRequestStatus.Rejected,
        message: props.message,
      }).instructions,
    )

    // Add instructions to reject the credential
    txBuilder.addInstruction(
      ...(await this.client.credential.updateIx({
        credentialRequest: props.credentialRequest,
        uri: `data:,status=rejected&ref=cr`,
      })).instructions,
    )

    return txBuilder.sendAndConfirm(opts)
  }

  /**
   * Approves a credential request by updating the status to "Approved" and updating the credential with the provided URI.
   *
   * @param {object} props - The properties for approving the credential request.
   * @param {PublicKeyInitData} props.credentialRequest - The credential request to approve.
   * @param {PublicKeyInitData} props.issuer - The issuer of the credential request.
   * @param {string} props.uri - The URI of the credential.
   * @param {SendOpts} [opts] - Optional send options.
   */
  async approveCredentialRequest(props: { credentialRequest: PublicKeyInitData, issuer: PublicKeyInitData, uri: string }, opts?: SendOpts) {
    const txBuilder = this.client.credential.txBuilder

    // Add instructions to approve the credential request
    txBuilder.addInstruction(
      ...this.client.credentialRequest.updateIx({
        credentialRequest: props.credentialRequest,
        issuer: props.issuer,
        status: CredentialRequestStatus.Approved,
      }).instructions,
    )

    // Add instructions to approve the credential
    txBuilder.addInstruction(
      ...(await this.client.credential.updateIx({
        credentialRequest: props.credentialRequest,
        uri: props.uri,
      })).instructions,
    )

    return txBuilder.sendAndConfirm(opts)
  }
}

export class IssuerNotFound extends Error {
}
