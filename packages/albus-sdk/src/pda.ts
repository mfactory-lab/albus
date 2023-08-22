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

import { PROGRAM_ID } from './generated'

export class PdaManager {
  programId = PROGRAM_ID

  constructor(private encoder = new TextEncoder()) {}

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
}
