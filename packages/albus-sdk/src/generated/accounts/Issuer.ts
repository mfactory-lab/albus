/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link Issuer}
 * @category Accounts
 * @category generated
 */
export type IssuerArgs = {
  pubkey: web3.PublicKey
  zkPubkey: number[] /* size: 64 */
  authority: web3.PublicKey
  isDisabled: boolean
  createdAt: beet.bignum
  bump: number
  code: string
  name: string
  description: string
}

export const issuerDiscriminator = [216, 19, 83, 230, 108, 53, 80, 14]
/**
 * Holds the data for the {@link Issuer} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Issuer implements IssuerArgs {
  private constructor(
    readonly pubkey: web3.PublicKey,
    readonly zkPubkey: number[] /* size: 64 */,
    readonly authority: web3.PublicKey,
    readonly isDisabled: boolean,
    readonly createdAt: beet.bignum,
    readonly bump: number,
    readonly code: string,
    readonly name: string,
    readonly description: string,
  ) {}

  /**
   * Creates a {@link Issuer} instance from the provided args.
   */
  static fromArgs(args: IssuerArgs) {
    return new Issuer(
      args.pubkey,
      args.zkPubkey,
      args.authority,
      args.isDisabled,
      args.createdAt,
      args.bump,
      args.code,
      args.name,
      args.description,
    )
  }

  /**
   * Deserializes the {@link Issuer} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [Issuer, number] {
    return Issuer.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Issuer} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<Issuer> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Issuer account at ${address}`)
    }
    return Issuer.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi',
    ),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, issuerBeet)
  }

  /**
   * Deserializes the {@link Issuer} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Issuer, number] {
    return issuerBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Issuer} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return issuerBeet.serialize({
      accountDiscriminator: issuerDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Issuer} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: IssuerArgs) {
    const instance = Issuer.fromArgs(args)
    return issuerBeet.toFixedFromValue({
      accountDiscriminator: issuerDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Issuer} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: IssuerArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Issuer.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link Issuer} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      pubkey: this.pubkey.toBase58(),
      zkPubkey: this.zkPubkey,
      authority: this.authority.toBase58(),
      isDisabled: this.isDisabled,
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
      code: this.code,
      name: this.name,
      description: this.description,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const issuerBeet = new beet.FixableBeetStruct<
  Issuer,
  IssuerArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['pubkey', beetSolana.publicKey],
    ['zkPubkey', beet.uniformFixedSizeArray(beet.u8, 64)],
    ['authority', beetSolana.publicKey],
    ['isDisabled', beet.bool],
    ['createdAt', beet.i64],
    ['bump', beet.u8],
    ['code', beet.utf8String],
    ['name', beet.utf8String],
    ['description', beet.utf8String],
  ],
  Issuer.fromArgs,
  'Issuer',
)
