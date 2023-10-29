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

import type { Wallet } from '@coral-xyz/anchor'
import { AnchorProvider } from '@coral-xyz/anchor'
import type { ConfirmOptions, Connection, Keypair } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { CircuitManager } from './circuitManager'
import { CredentialManager } from './credentialManager'
import { EventManager } from './eventManager'
import { PROGRAM_ID } from './generated'
import { InvestigationManager } from './investigationManager'
import { PdaManager } from './pda'
import { PolicyManager } from './policyManager'
import { ProofRequestManager } from './proofRequestManager'
import { ServiceManager } from './serviceManager'
import { TrusteeManager } from './trusteeManager'
import { NodeWallet } from './utils'
import idl from './idl/albus.json'

export class AlbusClient {
  programId = PROGRAM_ID

  pda: PdaManager
  circuit: CircuitManager
  policy: PolicyManager
  service: ServiceManager
  credential: CredentialManager
  trustee: TrusteeManager
  investigation: InvestigationManager
  proofRequest: ProofRequestManager
  eventManager: EventManager

  constructor(
    readonly provider: AnchorProvider,
  ) {
    this.pda = new PdaManager()
    // TODO: ts idl
    this.eventManager = new EventManager(this, idl as any)
    this.circuit = new CircuitManager(this.provider, this.pda)
    this.policy = new PolicyManager(this.provider, this.pda)
    this.service = new ServiceManager(this.provider, this.pda)
    this.credential = new CredentialManager(this.provider, this.pda)
    this.proofRequest = new ProofRequestManager(
      this.provider,
      this.circuit,
      this.service,
      this.credential,
      this.pda,
    )
    this.trustee = new TrusteeManager(this.provider, this.pda)
    this.investigation = new InvestigationManager(this.provider, this.proofRequest, this.service, this.pda)
  }

  static factory(connection: Connection, wallet?: Wallet, opts: ConfirmOptions = {}) {
    wallet = wallet ?? { publicKey: PublicKey.default } as unknown as Wallet
    return new this(new AnchorProvider(connection, wallet, opts))
  }

  static keypair(connection: Connection, keypair: Keypair, opts: ConfirmOptions = {}) {
    return new this(new AnchorProvider(connection, new NodeWallet(keypair), opts))
  }
}
