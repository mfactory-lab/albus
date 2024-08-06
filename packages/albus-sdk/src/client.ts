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
import { IssuerManager } from './issuerManager'
import { PdaManager } from './pda'
import { PolicyManager } from './policyManager'
import { ProofRequestManager } from './proofRequestManager'
import { ServiceManager } from './serviceManager'
import { TrusteeManager } from './trusteeManager'
import type { Wallet, WithRequired } from './types'
import type { Logger, PriorityFeeLoader } from './utils'
import { NodeWallet } from './utils'
import { DEV_PROGRAM_ID } from './constants'
import { CredentialSpecManager } from './credentialSpecManager'
import { CredentialRequestManager } from './credentialRequestManager'
import type { IrysOptions } from './storage/irys'
import { IrysStorageDriver } from './storage/irys'
import idl from './idl/albus.json'
import type { StorageDriver } from './storage'

export enum AlbusClientEnv { DEV = 'dev', STAGE = 'stage', PROD = 'prod' }

export class AlbusClient {
  readonly options: ClientOptions
  readonly circuit: CircuitManager
  readonly policy: PolicyManager
  readonly service: ServiceManager
  readonly credential: CredentialManager
  readonly credentialSpec: CredentialSpecManager
  readonly credentialRequest: CredentialRequestManager
  readonly trustee: TrusteeManager
  readonly issuer: IssuerManager
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
    this.eventManager = new EventManager(this, idl as any)
    this.issuer = new IssuerManager(this)
    this.circuit = new CircuitManager(this)
    this.policy = new PolicyManager(this)
    this.service = new ServiceManager(this)
    this.credential = new CredentialManager(this)
    this.credentialSpec = new CredentialSpecManager(this)
    this.credentialRequest = new CredentialRequestManager(this)
    this.trustee = new TrusteeManager(this)
    this.proofRequest = new ProofRequestManager(this)
    this.investigation = new InvestigationManager(this)
  }

  /**
   * Initialize a new `AlbusClient` from the provided {@link wallet}.
   */
  static fromWallet(connection: Connection, wallet?: Wallet, opts?: ClientOptions) {
    return new this(
      new AnchorProvider(
        connection,
        // @ts-expect-error anonymous
        wallet ?? { publicKey: PublicKey.default },
        { ...AnchorProvider.defaultOptions(), ...opts?.confirmOptions },
      ),
      opts,
    )
  }

  /**
   * Initialize a new `AlbusClient` from the provided {@link keypair}.
   */
  static fromKeypair(connection: Connection, keypair: Keypair, opts?: ClientOptions) {
    return AlbusClient.fromWallet(connection, new NodeWallet(keypair), opts)
  }

  /**
   * Retrieves an instance of the PdaManager.
   */
  static pda(programId?: PublicKey) {
    return new PdaManager(programId)
  }

  /**
   * Retrieves an instance of the PdaManager associated with the current instance's program ID.
   */
  get pda() {
    return AlbusClient.pda(this.programId)
  }

  /**
   * Returns the storage driver based on the selected storage driver option.
   */
  get storage(): StorageDriver {
    switch (this.options.storage?.driver) {
      case 'irys':
      default:
        return new IrysStorageDriver(this.provider, this.options.storage?.options)
    }
  }

  /**
   * Get the current program ID.
   */
  get programId(): PublicKey {
    return this.options.programId ?? PROGRAM_ID
  }

  /**
   * Configure a specific option.
   */
  configure<K extends keyof ClientOptions>(key: K, val: ClientOptions[K]) {
    this.options[key] = val
    return this
  }

  /**
   * Enable or disable debugging.
   */
  debug(val = true) {
    return this.configure('debug', val)
  }

  /**
   * Set the environment.
   */
  env(env: AlbusClientEnv) {
    if (env === AlbusClientEnv.PROD) {
      return this.configure('programId', PROGRAM_ID)
    }
    return this.configure('programId', DEV_PROGRAM_ID)
  }

  /**
   * Local environment.
   * Uses the dev program ID.
   */
  local() {
    return this.configure('programId', DEV_PROGRAM_ID)
  }
}

export type ClientProvider = WithRequired<Provider, 'publicKey' | 'sendAndConfirm' | 'sendAll'> &
  { wallet: Wallet, opts?: ConfirmOptions }

export type ClientOptions = {
  /// Custom Program ID
  programId?: PublicKey
  /// Enable debugging
  debug?: boolean
  /// Logger
  logger?: Logger
  /// Simulate transactions and log them
  txSimulate?: boolean
  /// Storage driver
  storage?: { driver: string, options?: IrysOptions | Record<string, any> }
  /// Priority fee to be used with the transaction builder, in micro-lamports
  priorityFee?: number
  /// Priority fee callback to be used with the transaction builder
  priorityFeeLoader?: PriorityFeeLoader
  /// Confirm options
  confirmOptions?: ConfirmOptions
} & Record<string, any>
