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
  ProofRequestStatus,
  proofRequestStatusBeet,
} from '../types/ProofRequestStatus'

/**
 * Arguments used to create {@link ProofRequest}
 * @category Accounts
 * @category generated
 */
export interface ProofRequestArgs {
  serviceProvider: web3.PublicKey
  policy: web3.PublicKey
  circuit: web3.PublicKey
  owner: web3.PublicKey
  identifier: beet.bignum
  createdAt: beet.bignum
  expiredAt: beet.bignum
  verifiedAt: beet.bignum
  provedAt: beet.bignum
  status: ProofRequestStatus
  bump: number
  vpUri: string
}

export const proofRequestDiscriminator = [78, 10, 176, 254, 231, 33, 111, 224]
/**
 * Holds the data for the {@link ProofRequest} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class ProofRequest implements ProofRequestArgs {
  private constructor(
    readonly serviceProvider: web3.PublicKey,
    readonly policy: web3.PublicKey,
    readonly circuit: web3.PublicKey,
    readonly owner: web3.PublicKey,
    readonly identifier: beet.bignum,
    readonly createdAt: beet.bignum,
    readonly expiredAt: beet.bignum,
    readonly verifiedAt: beet.bignum,
    readonly provedAt: beet.bignum,
    readonly status: ProofRequestStatus,
    readonly bump: number,
    readonly vpUri: string,
  ) {}

  /**
   * Creates a {@link ProofRequest} instance from the provided args.
   */
  static fromArgs(args: ProofRequestArgs) {
    return new ProofRequest(
      args.serviceProvider,
      args.policy,
      args.circuit,
      args.owner,
      args.identifier,
      args.createdAt,
      args.expiredAt,
      args.verifiedAt,
      args.provedAt,
      args.status,
      args.bump,
      args.vpUri,
    )
  }

  /**
   * Deserializes the {@link ProofRequest} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [ProofRequest, number] {
    return ProofRequest.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ProofRequest} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<ProofRequest> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find ProofRequest account at ${address}`)
    }
    return ProofRequest.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, proofRequestBeet)
  }

  /**
   * Deserializes the {@link ProofRequest} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [ProofRequest, number] {
    return proofRequestBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link ProofRequest} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return proofRequestBeet.serialize({
      accountDiscriminator: proofRequestDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ProofRequest} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: ProofRequestArgs) {
    const instance = ProofRequest.fromArgs(args)
    return proofRequestBeet.toFixedFromValue({
      accountDiscriminator: proofRequestDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ProofRequest} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: ProofRequestArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      ProofRequest.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link ProofRequest} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      serviceProvider: this.serviceProvider.toBase58(),
      policy: this.policy.toBase58(),
      circuit: this.circuit.toBase58(),
      owner: this.owner.toBase58(),
      identifier: (() => {
        const x = <{ toNumber: () => number }> this.identifier
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
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
      status: `ProofRequestStatus.${ProofRequestStatus[this.status]}`,
      bump: this.bump,
      vpUri: this.vpUri,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const proofRequestBeet = new beet.FixableBeetStruct<
  ProofRequest,
  ProofRequestArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['serviceProvider', beetSolana.publicKey],
    ['policy', beetSolana.publicKey],
    ['circuit', beetSolana.publicKey],
    ['owner', beetSolana.publicKey],
    ['identifier', beet.u64],
    ['createdAt', beet.i64],
    ['expiredAt', beet.i64],
    ['verifiedAt', beet.i64],
    ['provedAt', beet.i64],
    ['status', proofRequestStatusBeet],
    ['bump', beet.u8],
    ['vpUri', beet.utf8String],
  ],
  ProofRequest.fromArgs,
  'ProofRequest',
)
