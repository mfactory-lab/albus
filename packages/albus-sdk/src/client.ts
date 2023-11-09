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

import type { Provider } from '@coral-xyz/anchor'
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
import type { Wallet, WithRequired } from './types'
import { NodeWallet } from './utils'
import idl from './idl/albus.json'

export type ClientProvider = WithRequired<Provider, 'publicKey' | 'sendAndConfirm' | 'sendAll'> & { opts?: ConfirmOptions }

export type ClientOptions = {
  programId?: PublicKey
  debug?: boolean
}

export class AlbusClient {
  readonly options: ClientOptions
  readonly pda: PdaManager
  readonly circuit: CircuitManager
  readonly policy: PolicyManager
  readonly service: ServiceManager
  readonly credential: CredentialManager
  readonly trustee: TrusteeManager
  readonly investigation: InvestigationManager
  readonly proofRequest: ProofRequestManager
  readonly eventManager: EventManager

  constructor(readonly provider: ClientProvider, options?: ClientOptions) {
    if (!provider.publicKey) {
      throw new Error('no public key found on the argued provider')
    } else if (!provider.sendAndConfirm) {
      throw new Error('no `sendAndConfirm` function found on the argued provider')
    } else if (!provider.sendAll) {
      throw new Error('no `sendAll` function found on the argued provider')
    }

    this.options = options ?? {}
    this.pda = new PdaManager()
    this.eventManager = new EventManager(this, idl as any)
    this.circuit = new CircuitManager(this)
    this.policy = new PolicyManager(this)
    this.service = new ServiceManager(this)
    this.credential = new CredentialManager(this)
    this.trustee = new TrusteeManager(this)
    this.proofRequest = new ProofRequestManager(this)
    this.investigation = new InvestigationManager(this)
  }

  get programId() {
    return this.options.programId ?? PROGRAM_ID
  }

  configure<K extends keyof ClientOptions>(key: K, val: ClientOptions[K]) {
    this.options[key] = val
    return this
  }

  /**
   * Initialize a new `AlbusClient` from the provided {@link wallet}.
   */
  static fromWallet(connection: Connection, wallet?: Wallet, opts?: ConfirmOptions) {
    return new this(
      new AnchorProvider(
        connection,
        // @ts-expect-error anonymous
        wallet ?? { publicKey: PublicKey.default },
        { ...AnchorProvider.defaultOptions(), ...opts },
      ),
    )
  }

  /**
   * Initialize a new `AlbusClient` from the provided {@link keypair}.
   */
  static fromKeypair(connection: Connection, keypair: Keypair, opts?: ConfirmOptions) {
    return AlbusClient.fromWallet(connection, new NodeWallet(keypair), opts)
  }
}
