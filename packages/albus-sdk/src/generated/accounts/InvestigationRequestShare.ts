/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import {
  RevelationStatus,
  revelationStatusBeet,
} from '../types/RevelationStatus'

/**
 * Arguments used to create {@link InvestigationRequestShare}
 * @category Accounts
 * @category generated
 */
export interface InvestigationRequestShareArgs {
  investigationRequest: web3.PublicKey
  proofRequestOwner: web3.PublicKey
  trustee: web3.PublicKey
  index: number
  createdAt: beet.bignum
  revealedAt: beet.bignum
  status: RevelationStatus
  share: string
}

export const investigationRequestShareDiscriminator = [
  100, 72, 101, 243, 197, 9, 230, 18,
]
/**
 * Holds the data for the {@link InvestigationRequestShare} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class InvestigationRequestShare
implements InvestigationRequestShareArgs {
  private constructor(
    readonly investigationRequest: web3.PublicKey,
    readonly proofRequestOwner: web3.PublicKey,
    readonly trustee: web3.PublicKey,
    readonly index: number,
    readonly createdAt: beet.bignum,
    readonly revealedAt: beet.bignum,
    readonly status: RevelationStatus,
    readonly share: string,
  ) {}

  /**
   * Creates a {@link InvestigationRequestShare} instance from the provided args.
   */
  static fromArgs(args: InvestigationRequestShareArgs) {
    return new InvestigationRequestShare(
      args.investigationRequest,
      args.proofRequestOwner,
      args.trustee,
      args.index,
      args.createdAt,
      args.revealedAt,
      args.status,
      args.share,
    )
  }

  /**
   * Deserializes the {@link InvestigationRequestShare} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [InvestigationRequestShare, number] {
    return InvestigationRequestShare.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link InvestigationRequestShare} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<InvestigationRequestShare> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(
        `Unable to find InvestigationRequestShare account at ${address}`,
      )
    }
    return InvestigationRequestShare.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(
      programId,
      investigationRequestShareBeet,
    )
  }

  /**
   * Deserializes the {@link InvestigationRequestShare} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(
    buf: Buffer,
    offset = 0,
  ): [InvestigationRequestShare, number] {
    return investigationRequestShareBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link InvestigationRequestShare} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return investigationRequestShareBeet.serialize({
      accountDiscriminator: investigationRequestShareDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link InvestigationRequestShare} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: InvestigationRequestShareArgs) {
    const instance = InvestigationRequestShare.fromArgs(args)
    return investigationRequestShareBeet.toFixedFromValue({
      accountDiscriminator: investigationRequestShareDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link InvestigationRequestShare} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: InvestigationRequestShareArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      InvestigationRequestShare.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link InvestigationRequestShare} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      investigationRequest: this.investigationRequest.toBase58(),
      proofRequestOwner: this.proofRequestOwner.toBase58(),
      trustee: this.trustee.toBase58(),
      index: this.index,
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
      revealedAt: (() => {
        const x = <{ toNumber: () => number }> this.revealedAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      status: `RevelationStatus.${RevelationStatus[this.status]}`,
      share: this.share,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const investigationRequestShareBeet = new beet.FixableBeetStruct<
  InvestigationRequestShare,
  InvestigationRequestShareArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['investigationRequest', beetSolana.publicKey],
    ['proofRequestOwner', beetSolana.publicKey],
    ['trustee', beetSolana.publicKey],
    ['index', beet.u8],
    ['createdAt', beet.i64],
    ['revealedAt', beet.i64],
    ['status', revelationStatusBeet],
    ['share', beet.utf8String],
  ],
  InvestigationRequestShare.fromArgs,
  'InvestigationRequestShare',
)