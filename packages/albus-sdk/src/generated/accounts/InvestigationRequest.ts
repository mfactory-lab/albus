/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import type { SecretShare } from '../types/SecretShare'
import { secretShareBeet } from '../types/SecretShare'
import {
  InvestigationStatus,
  investigationStatusBeet,
} from '../types/InvestigationStatus'

/**
 * Arguments used to create {@link InvestigationRequest}
 * @category Accounts
 * @category generated
 */
export interface InvestigationRequestArgs {
  authority: web3.PublicKey
  encryptionKey: beet.COption<web3.PublicKey>
  proofRequest: web3.PublicKey
  proofRequestOwner: web3.PublicKey
  serviceProvider: web3.PublicKey
  requiredShareCount: number
  secretShares: SecretShare[]
  status: InvestigationStatus
  createdAt: beet.bignum
  bump: number
}

export const investigationRequestDiscriminator = [
  155, 75, 212, 176, 2, 184, 54, 19,
]
/**
 * Holds the data for the {@link InvestigationRequest} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class InvestigationRequest implements InvestigationRequestArgs {
  private constructor(
    readonly authority: web3.PublicKey,
    readonly encryptionKey: beet.COption<web3.PublicKey>,
    readonly proofRequest: web3.PublicKey,
    readonly proofRequestOwner: web3.PublicKey,
    readonly serviceProvider: web3.PublicKey,
    readonly requiredShareCount: number,
    readonly secretShares: SecretShare[],
    readonly status: InvestigationStatus,
    readonly createdAt: beet.bignum,
    readonly bump: number,
  ) {}

  /**
   * Creates a {@link InvestigationRequest} instance from the provided args.
   */
  static fromArgs(args: InvestigationRequestArgs) {
    return new InvestigationRequest(
      args.authority,
      args.encryptionKey,
      args.proofRequest,
      args.proofRequestOwner,
      args.serviceProvider,
      args.requiredShareCount,
      args.secretShares,
      args.status,
      args.createdAt,
      args.bump,
    )
  }

  /**
   * Deserializes the {@link InvestigationRequest} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [InvestigationRequest, number] {
    return InvestigationRequest.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link InvestigationRequest} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<InvestigationRequest> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(
        `Unable to find InvestigationRequest account at ${address}`,
      )
    }
    return InvestigationRequest.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz',
    ),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, investigationRequestBeet)
  }

  /**
   * Deserializes the {@link InvestigationRequest} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [InvestigationRequest, number] {
    return investigationRequestBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link InvestigationRequest} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return investigationRequestBeet.serialize({
      accountDiscriminator: investigationRequestDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link InvestigationRequest} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: InvestigationRequestArgs) {
    const instance = InvestigationRequest.fromArgs(args)
    return investigationRequestBeet.toFixedFromValue({
      accountDiscriminator: investigationRequestDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link InvestigationRequest} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: InvestigationRequestArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      InvestigationRequest.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link InvestigationRequest} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      authority: this.authority.toBase58(),
      encryptionKey: this.encryptionKey,
      proofRequest: this.proofRequest.toBase58(),
      proofRequestOwner: this.proofRequestOwner.toBase58(),
      serviceProvider: this.serviceProvider.toBase58(),
      requiredShareCount: this.requiredShareCount,
      secretShares: this.secretShares,
      status: `InvestigationStatus.${InvestigationStatus[this.status]}`,
      createdAt: (() => {
        const x = <{ toNumber: () => number }> this.createdAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      bump: this.bump,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const investigationRequestBeet = new beet.FixableBeetStruct<
  InvestigationRequest,
  InvestigationRequestArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['authority', beetSolana.publicKey],
    ['encryptionKey', beet.coption(beetSolana.publicKey)],
    ['proofRequest', beetSolana.publicKey],
    ['proofRequestOwner', beetSolana.publicKey],
    ['serviceProvider', beetSolana.publicKey],
    ['requiredShareCount', beet.u8],
    ['secretShares', beet.array(secretShareBeet)],
    ['status', investigationStatusBeet],
    ['createdAt', beet.i64],
    ['bump', beet.u8],
  ],
  InvestigationRequest.fromArgs,
  'InvestigationRequest',
)