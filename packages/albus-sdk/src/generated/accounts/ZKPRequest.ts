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
  ZKPRequestStatus,
  zKPRequestStatusBeet,
} from '../types/ZKPRequestStatus'

/**
 * Arguments used to create {@link ZKPRequest}
 * @category Accounts
 * @category generated
 */
export interface ZKPRequestArgs {
  serviceProvider: web3.PublicKey
  circuit: web3.PublicKey
  owner: web3.PublicKey
  proof: beet.COption<web3.PublicKey>
  createdAt: beet.bignum
  expiredAt: beet.bignum
  verifiedAt: beet.bignum
  provedAt: beet.bignum
  status: ZKPRequestStatus
  bump: number
}

export const zKPRequestDiscriminator = [218, 125, 94, 109, 164, 128, 230, 47]
/**
 * Holds the data for the {@link ZKPRequest} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class ZKPRequest implements ZKPRequestArgs {
  private constructor(
    readonly serviceProvider: web3.PublicKey,
    readonly circuit: web3.PublicKey,
    readonly owner: web3.PublicKey,
    readonly proof: beet.COption<web3.PublicKey>,
    readonly createdAt: beet.bignum,
    readonly expiredAt: beet.bignum,
    readonly verifiedAt: beet.bignum,
    readonly provedAt: beet.bignum,
    readonly status: ZKPRequestStatus,
    readonly bump: number,
  ) {}

  /**
   * Creates a {@link ZKPRequest} instance from the provided args.
   */
  static fromArgs(args: ZKPRequestArgs) {
    return new ZKPRequest(
      args.serviceProvider,
      args.circuit,
      args.owner,
      args.proof,
      args.createdAt,
      args.expiredAt,
      args.verifiedAt,
      args.provedAt,
      args.status,
      args.bump,
    )
  }

  /**
   * Deserializes the {@link ZKPRequest} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [ZKPRequest, number] {
    return ZKPRequest.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ZKPRequest} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<ZKPRequest> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find ZKPRequest account at ${address}`)
    }
    return ZKPRequest.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, zKPRequestBeet)
  }

  /**
   * Deserializes the {@link ZKPRequest} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [ZKPRequest, number] {
    return zKPRequestBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link ZKPRequest} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return zKPRequestBeet.serialize({
      accountDiscriminator: zKPRequestDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ZKPRequest} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: ZKPRequestArgs) {
    const instance = ZKPRequest.fromArgs(args)
    return zKPRequestBeet.toFixedFromValue({
      accountDiscriminator: zKPRequestDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ZKPRequest} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: ZKPRequestArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      ZKPRequest.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link ZKPRequest} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      serviceProvider: this.serviceProvider.toBase58(),
      circuit: this.circuit.toBase58(),
      owner: this.owner.toBase58(),
      proof: this.proof,
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
      expiredAt: (() => {
        const x = <{ toNumber: () => number }> this.expiredAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      verifiedAt: (() => {
        const x = <{ toNumber: () => number }> this.verifiedAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      provedAt: (() => {
        const x = <{ toNumber: () => number }> this.provedAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      status: `ZKPRequestStatus.${ZKPRequestStatus[this.status]}`,
      bump: this.bump,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const zKPRequestBeet = new beet.FixableBeetStruct<
  ZKPRequest,
  ZKPRequestArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['serviceProvider', beetSolana.publicKey],
    ['circuit', beetSolana.publicKey],
    ['owner', beetSolana.publicKey],
    ['proof', beet.coption(beetSolana.publicKey)],
    ['createdAt', beet.i64],
    ['expiredAt', beet.i64],
    ['verifiedAt', beet.i64],
    ['provedAt', beet.i64],
    ['status', zKPRequestStatusBeet],
    ['bump', beet.u8],
  ],
  ZKPRequest.fromArgs,
  'ZKPRequest',
)