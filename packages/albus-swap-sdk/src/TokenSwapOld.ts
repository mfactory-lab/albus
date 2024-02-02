/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import type { FeesInfo } from './generated/types/FeesInfo'
import { feesInfoBeet } from './generated/types/FeesInfo'
import type { CurveInfo } from './generated/types/CurveInfo'
import { curveInfoBeet } from './generated/types/CurveInfo'

/**
 * Arguments used to create {@link TokenSwapOld}
 * @category Accounts
 * @category generated
 */
export type TokenSwapOldArgs = {
  isInitialized: boolean
  bumpSeed: number
  tokenProgramId: web3.PublicKey
  tokenA: web3.PublicKey
  tokenB: web3.PublicKey
  poolMint: web3.PublicKey
  tokenAMint: web3.PublicKey
  tokenBMint: web3.PublicKey
  poolFeeAccount: web3.PublicKey
  fees: FeesInfo
  curve: CurveInfo
  policy: beet.COption<web3.PublicKey>
}

export const tokenSwapOldDiscriminator = [135, 144, 215, 161, 140, 125, 41, 96]
/**
 * Holds the data for the {@link TokenSwapOld} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class TokenSwapOld implements TokenSwapOldArgs {
  private constructor(
    readonly isInitialized: boolean,
    readonly bumpSeed: number,
    readonly tokenProgramId: web3.PublicKey,
    readonly tokenA: web3.PublicKey,
    readonly tokenB: web3.PublicKey,
    readonly poolMint: web3.PublicKey,
    readonly tokenAMint: web3.PublicKey,
    readonly tokenBMint: web3.PublicKey,
    readonly poolFeeAccount: web3.PublicKey,
    readonly fees: FeesInfo,
    readonly curve: CurveInfo,
    readonly policy: beet.COption<web3.PublicKey>,
  ) {}

  /**
   * Creates a {@link TokenSwapOld} instance from the provided args.
   */
  static fromArgs(args: TokenSwapOldArgs) {
    return new TokenSwapOld(
      args.isInitialized,
      args.bumpSeed,
      args.tokenProgramId,
      args.tokenA,
      args.tokenB,
      args.poolMint,
      args.tokenAMint,
      args.tokenBMint,
      args.poolFeeAccount,
      args.fees,
      args.curve,
      args.policy,
    )
  }

  /**
   * Deserializes the {@link TokenSwapOld} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0,
  ): [TokenSwapOld, number] {
    return TokenSwapOld.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link TokenSwapOld} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig,
  ): Promise<TokenSwapOld> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig,
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find TokenSwap account at ${address}`)
    }
    return TokenSwapOld.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq',
    ),
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, tokenSwapOldBeet)
  }

  /**
   * Deserializes the {@link TokenSwapOld} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [TokenSwapOld, number] {
    return tokenSwapOldBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link TokenSwapOld} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return tokenSwapOldBeet.serialize({
      accountDiscriminator: tokenSwapOldDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link TokenSwapOld} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: TokenSwapOldArgs) {
    const instance = TokenSwapOld.fromArgs(args)
    return tokenSwapOldBeet.toFixedFromValue({
      accountDiscriminator: tokenSwapOldDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link TokenSwapOld} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: TokenSwapOldArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment,
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      TokenSwapOld.byteSize(args),
      commitment,
    )
  }

  /**
   * Returns a readable version of {@link TokenSwapOld} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      isInitialized: this.isInitialized,
      bumpSeed: this.bumpSeed,
      tokenProgramId: this.tokenProgramId.toBase58(),
      tokenA: this.tokenA.toBase58(),
      tokenB: this.tokenB.toBase58(),
      poolMint: this.poolMint.toBase58(),
      tokenAMint: this.tokenAMint.toBase58(),
      tokenBMint: this.tokenBMint.toBase58(),
      poolFeeAccount: this.poolFeeAccount.toBase58(),
      fees: this.fees,
      curve: this.curve,
      policy: this.policy,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const tokenSwapOldBeet = new beet.FixableBeetStruct<
  TokenSwapOld,
  TokenSwapOldArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['isInitialized', beet.bool],
    ['bumpSeed', beet.u8],
    ['tokenProgramId', beetSolana.publicKey],
    ['tokenA', beetSolana.publicKey],
    ['tokenB', beetSolana.publicKey],
    ['poolMint', beetSolana.publicKey],
    ['tokenAMint', beetSolana.publicKey],
    ['tokenBMint', beetSolana.publicKey],
    ['poolFeeAccount', beetSolana.publicKey],
    ['fees', feesInfoBeet],
    ['curve', curveInfoBeet],
    ['policy', beet.coption(beetSolana.publicKey)],
  ],
  TokenSwapOld.fromArgs,
  'TokenSwap',
)
