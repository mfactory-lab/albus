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
 * Arguments used to create {@link CredentialSpec}
 * @category Accounts
 * @category generated
 */
export type CredentialSpecArgs = {
  issuer: web3.PublicKey
  name: string
  credentialRequestCount: beet.bignum
  bump: number
  uri: string
}

export const credentialSpecDiscriminator = [243, 229, 68, 49, 149, 173, 133, 95]
/**
 * Holds the data for the {@link CredentialSpec} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class CredentialSpec implements CredentialSpecArgs {
  private constructor(
    readonly issuer: web3.PublicKey,
    readonly name: string,
    readonly credentialRequestCount: beet.bignum,
    readonly bump: number,
    readonly uri: string,
  ) {}

  /**
   * Creates a {@link CredentialSpec} instance from the provided args.
   */
  static fromArgs(args: CredentialSpecArgs) {
    return new CredentialSpec(
      args.issuer,
      args.name,
      args.credentialRequestCount,
      args.bump,
      args.uri,
    )
  }

  /**
   * Deserializes the {@link CredentialSpec} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [CredentialSpec, number] {
    return CredentialSpec.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link CredentialSpec} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<CredentialSpec> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find CredentialSpec account at ${address}`)
    }
    return CredentialSpec.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, credentialSpecBeet)
  }

  /**
   * Deserializes the {@link CredentialSpec} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [CredentialSpec, number] {
    return credentialSpecBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link CredentialSpec} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return credentialSpecBeet.serialize({
      accountDiscriminator: credentialSpecDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link CredentialSpec} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: CredentialSpecArgs) {
    const instance = CredentialSpec.fromArgs(args)
    return credentialSpecBeet.toFixedFromValue({
      accountDiscriminator: credentialSpecDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link CredentialSpec} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: CredentialSpecArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      CredentialSpec.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link CredentialSpec} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      issuer: this.issuer.toBase58(),
      name: this.name,
      credentialRequestCount: (() => {
        const x = <{ toNumber: () => number }> this.credentialRequestCount
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
      uri: this.uri,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const credentialSpecBeet = new beet.FixableBeetStruct<
  CredentialSpec,
  CredentialSpecArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['issuer', beetSolana.publicKey],
    ['name', beet.utf8String],
    ['credentialRequestCount', beet.u64],
    ['bump', beet.u8],
    ['uri', beet.utf8String],
  ],
  CredentialSpec.fromArgs,
  'CredentialSpec',
)
