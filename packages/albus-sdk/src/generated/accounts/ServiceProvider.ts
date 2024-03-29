/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import type { ContactInfo } from '../types/ContactInfo'
import { contactInfoBeet } from '../types/ContactInfo'

/**
 * Arguments used to create {@link ServiceProvider}
 * @category Accounts
 * @category generated
 */
export type ServiceProviderArgs = {
  authority: web3.PublicKey
  code: string
  name: string
  website: string
  contactInfo: ContactInfo
  proofRequestCount: beet.bignum
  policyCount: beet.bignum
  createdAt: beet.bignum
  bump: number
  secretShareThreshold: number
  trustees: web3.PublicKey[]
}

export const serviceProviderDiscriminator = [14, 72, 40, 52, 66, 51, 252, 108]
/**
 * Holds the data for the {@link ServiceProvider} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class ServiceProvider implements ServiceProviderArgs {
  private constructor(
    readonly authority: web3.PublicKey,
    readonly code: string,
    readonly name: string,
    readonly website: string,
    readonly contactInfo: ContactInfo,
    readonly proofRequestCount: beet.bignum,
    readonly policyCount: beet.bignum,
    readonly createdAt: beet.bignum,
    readonly bump: number,
    readonly secretShareThreshold: number,
    readonly trustees: web3.PublicKey[],
  ) {}

  /**
   * Creates a {@link ServiceProvider} instance from the provided args.
   */
  static fromArgs(args: ServiceProviderArgs) {
    return new ServiceProvider(
      args.authority,
      args.code,
      args.name,
      args.website,
      args.contactInfo,
      args.proofRequestCount,
      args.policyCount,
      args.createdAt,
      args.bump,
      args.secretShareThreshold,
      args.trustees,
    )
  }

  /**
   * Deserializes the {@link ServiceProvider} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [ServiceProvider, number] {
    return ServiceProvider.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ServiceProvider} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<ServiceProvider> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find ServiceProvider account at ${address}`)
    }
    return ServiceProvider.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, serviceProviderBeet)
  }

  /**
   * Deserializes the {@link ServiceProvider} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [ServiceProvider, number] {
    return serviceProviderBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link ServiceProvider} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return serviceProviderBeet.serialize({
      accountDiscriminator: serviceProviderDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ServiceProvider} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: ServiceProviderArgs) {
    const instance = ServiceProvider.fromArgs(args)
    return serviceProviderBeet.toFixedFromValue({
      accountDiscriminator: serviceProviderDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ServiceProvider} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: ServiceProviderArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      ServiceProvider.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link ServiceProvider} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      authority: this.authority.toBase58(),
      code: this.code,
      name: this.name,
      website: this.website,
      contactInfo: this.contactInfo,
      proofRequestCount: (() => {
        const x = <{ toNumber: () => number }> this.proofRequestCount
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      policyCount: (() => {
        const x = <{ toNumber: () => number }> this.policyCount
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
      bump: this.bump,
      secretShareThreshold: this.secretShareThreshold,
      trustees: this.trustees,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const serviceProviderBeet = new beet.FixableBeetStruct<
  ServiceProvider,
  ServiceProviderArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['authority', beetSolana.publicKey],
    ['code', beet.utf8String],
    ['name', beet.utf8String],
    ['website', beet.utf8String],
    ['contactInfo', contactInfoBeet],
    ['proofRequestCount', beet.u64],
    ['policyCount', beet.u64],
    ['createdAt', beet.i64],
    ['bump', beet.u8],
    ['secretShareThreshold', beet.u8],
    ['trustees', beet.array(beetSolana.publicKey)],
  ],
  ServiceProvider.fromArgs,
  'ServiceProvider',
)
