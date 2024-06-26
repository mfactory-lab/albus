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

import type { PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'

import * as Albus from '@albus-finance/core'
import { PROGRAM_ID } from './generated'

export class PdaManager {
  constructor(
    readonly programId: PublicKey = PROGRAM_ID,
    private readonly encoder = new TextEncoder(),
  ) {}

  authority() {
    return PublicKey.findProgramAddressSync([this.programId.toBuffer()], this.programId)
  }

  issuer(code: string) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('issuer'),
      this.encoder.encode(code),
    ], this.programId)
  }

  credential(issuer: PublicKeyInitData, id: number) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('credential'),
      new PublicKey(issuer).toBuffer(),
      Albus.crypto.utils.hexToBytes(id.toString(16)),
    ], this.programId)
  }

  credentialSpec(issuer: PublicKeyInitData, code: string) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('credential-spec'),
      new PublicKey(issuer).toBuffer(),
      this.encoder.encode(code),
    ], this.programId)
  }

  credentialRequest(spec: PublicKeyInitData, authority: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('credential-request'),
      new PublicKey(spec).toBuffer(),
      new PublicKey(authority).toBuffer(),
    ], this.programId)
  }

  circuit(code: string) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('circuit'),
      this.encoder.encode(code),
    ], this.programId)
  }

  serviceProvider(code: string) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('service-provider'),
      this.encoder.encode(code),
    ], this.programId)
  }

  policy(service: PublicKeyInitData, code: string) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('policy'),
      new PublicKey(service).toBuffer(),
      this.encoder.encode(code),
    ], this.programId)
  }

  proofRequest(policy: PublicKeyInitData, user: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('proof-request'),
      new PublicKey(policy).toBuffer(),
      new PublicKey(user).toBuffer(),
    ], this.programId)
  }

  investigationRequest(proofRequest: PublicKeyInitData, authority: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('investigation-request'),
      new PublicKey(proofRequest).toBuffer(),
      new PublicKey(authority).toBuffer(),
    ], this.programId)
  }

  investigationRequestShare(investigation: PublicKeyInitData, trustee: PublicKeyInitData) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('investigation-request-share'),
      new PublicKey(investigation).toBuffer(),
      new PublicKey(trustee).toBuffer(),
    ], this.programId)
  }

  trustee(key: ArrayLike<number>) {
    return PublicKey.findProgramAddressSync([
      this.encoder.encode('trustee'),
      Uint8Array.from(key),
    ], this.programId)
  }
}
