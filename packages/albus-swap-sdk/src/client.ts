import { BN } from '@coral-xyz/anchor'
import type { AnchorProvider } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

import type { CurveType } from './generated'
import {
  PROGRAM_ID,
  TokenSwap,
  createDepositAllTokenTypesInstruction,
  createDepositSingleTokenTypeInstruction,
  createInitializeInstruction,
  createSwapInstruction,
  createWithdrawAllTokenTypesInstruction,
  createWithdrawSingleTokenTypeInstruction,
  tokenSwapDiscriminator,
} from './generated'

export class AlbusSwapClient {
  programId = PROGRAM_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  swapAuthority(tokenSwap: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [tokenSwap.toBuffer()],
      this.programId,
    )[0]
  }

  /**
   * Create a new Token Swap
   */
  async createTokenSwap(props: CreateTokenSwapProps, opts?: ConfirmOptions) {
    const tx = new Transaction()

    const tokenSwap = props.tokenSwap ?? Keypair.generate()

    const curveParameters = Array.from<number>({ length: 32 })
    const bytes = Array.from(props.curveParameters ?? [])
    for (let i = 0; i < bytes.length; i++) {
      curveParameters[i] = bytes[i]!
    }

    const curve = {
      curveType: props.curveType,
      curveParameters,
    }

    const space = TokenSwap.byteSize({
      bumpSeed: 0,
      curve,
      fees: {
        tradeFeeNumerator: 0,
        tradeFeeDenominator: 0,
        ownerTradeFeeNumerator: 0,
        ownerTradeFeeDenominator: 0,
        ownerWithdrawFeeNumerator: 0,
        ownerWithdrawFeeDenominator: 0,
        hostFeeNumerator: 0,
        hostFeeDenominator: 0,
      },
      isInitialized: false,
      policy: PublicKey.default,
      poolFeeAccount: PublicKey.default,
      poolMint: PublicKey.default,
      tokenA: PublicKey.default,
      tokenAMint: PublicKey.default,
      tokenB: PublicKey.default,
      tokenBMint: PublicKey.default,
      tokenProgramId: PublicKey.default,
    })

    const lamports = await this.connection.getMinimumBalanceForRentExemption(space)

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: this.provider.publicKey,
        newAccountPubkey: tokenSwap.publicKey,
        programId: this.programId,
        lamports,
        space,
      }),
    )

    tx.add(
      createInitializeInstruction(
        {
          authority: this.swapAuthority(tokenSwap.publicKey),
          tokenSwap: tokenSwap.publicKey,
          destination: props.destination,
          poolMint: props.poolMint,
          poolFee: props.poolFee,
          tokenA: props.tokenA,
          tokenB: props.tokenB,
        },
        {
          feesInput: {
            tradeFeeNumerator: new BN(props.fees.tradeFeeNumerator.toString()),
            tradeFeeDenominator: new BN(props.fees.tradeFeeDenominator.toString()),
            ownerTradeFeeNumerator: new BN(props.fees.ownerTradeFeeNumerator.toString()),
            ownerTradeFeeDenominator: new BN(props.fees.ownerTradeFeeDenominator.toString()),
            ownerWithdrawFeeNumerator: new BN(props.fees.ownerWithdrawFeeNumerator.toString()),
            ownerWithdrawFeeDenominator: new BN(props.fees.ownerWithdrawFeeDenominator.toString()),
            hostFeeNumerator: new BN(props.fees.hostFeeNumerator.toString()),
            hostFeeDenominator: new BN(props.fees.hostFeeDenominator.toString()),
          },
          curveInput: curve,
          policy: props.policy ?? null,
        },
      ),
    )

    const signature = await this.provider.sendAndConfirm(tx, [tokenSwap], opts)

    return {
      tokenSwap: tokenSwap.publicKey,
      signature,
    }
  }

  /**
   * Swap token A for token B
   */
  async swap(props: SwapProps, opts?: ConfirmOptions) {
    const instruction = createSwapInstruction(
      {
        authority: this.swapAuthority(props.tokenSwap),
        userTransferAuthority: this.provider.publicKey,
        userSource: props.userSource,
        userDestination: props.userDestination,
        tokenSwap: props.tokenSwap,
        poolFee: props.poolFee,
        poolMint: props.poolMint,
        poolSource: props.poolSource,
        poolDestination: props.poolDestination,
        proofRequest: props.proofRequest,
        hostFeeAccount: props.hostFeeAccount,
      },
      {
        amountIn: new BN(props.amountIn.toString()),
        minimumAmountOut: new BN(props.minimumAmountOut.toString()),
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Deposit tokens into the pool
   */
  async depositAllTokenTypes(
    props: DepositAllTokenTypesProps,
    opts?: ConfirmOptions,
  ) {
    const instruction = createDepositAllTokenTypesInstruction(
      {
        authority: this.swapAuthority(props.tokenSwap),
        userTransferAuthority: this.provider.publicKey,
        tokenSwap: props.tokenSwap,
        poolMint: props.poolMint,
        destination: props.destination,
        userTokenA: props.userTokenA,
        userTokenB: props.userTokenB,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
      },
      {
        poolTokenAmount: new BN(props.poolTokenAmount.toString()),
        maximumTokenAAmount: new BN(props.maximumTokenA.toString()),
        maximumTokenBAmount: new BN(props.maximumTokenB.toString()),
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Withdraw tokens from the pool
   */
  async withdrawAllTokenTypes(
    props: WithdrawAllTokenTypesProps,
    opts?: ConfirmOptions,
  ) {
    const instruction = createWithdrawAllTokenTypesInstruction(
      {
        authority: this.swapAuthority(props.tokenSwap),
        userTransferAuthority: this.provider.publicKey,
        tokenSwap: props.tokenSwap,
        poolMint: props.poolMint,
        poolFee: props.poolFee,
        source: props.source,
        destTokenA: props.destTokenA,
        destTokenB: props.destTokenB,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
      },
      {
        poolTokenAmount: new BN(props.poolTokenAmount.toString()),
        minimumTokenAAmount: new BN(props.minimumTokenA.toString()),
        minimumTokenBAmount: new BN(props.minimumTokenB.toString()),
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Deposit one side of tokens into the pool
   */
  async depositSingleTokenTypeExactAmountIn(props: DepositSingleTokenTypeExactAmountInProps, opts?: ConfirmOptions) {
    const instruction = createDepositSingleTokenTypeInstruction(
      {
        authority: this.swapAuthority(props.tokenSwap),
        userTransferAuthority: this.provider.publicKey,
        tokenSwap: props.tokenSwap,
        poolMint: props.poolMint,
        source: props.source,
        destination: props.destination,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
      },
      {
        sourceTokenAmount: new BN(props.sourceTokenAmount.toString()),
        minimumPoolTokenAmount: new BN(props.minimumPoolTokenAmount.toString()),
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Withdraw tokens from the pool
   */
  async withdrawSingleTokenTypeExactAmountOut(
    props: WithdrawSingleTokenTypeExactAmountOutProps,
    opts?: ConfirmOptions,
  ) {
    const instruction = createWithdrawSingleTokenTypeInstruction(
      {
        authority: this.swapAuthority(props.tokenSwap),
        userTransferAuthority: this.provider.publicKey,
        tokenSwap: props.tokenSwap,
        poolMint: props.poolMint,
        poolFee: props.poolFee,
        source: props.source,
        destination: props.destination,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
      },
      {
        destinationTokenAmount: new BN(props.destinationTokenAmount.toString()),
        maximumPoolTokenAmount: new BN(props.maximumPoolTokenAmount.toString()),
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Load `TokenSwap` by address
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return TokenSwap.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  /**
   * Load multiple `TokenSwap`
   */
  async loadAll(props: LoadAllProps = {}) {
    const builder = TokenSwap.gpaBuilder()
      .addFilter('accountDiscriminator', tokenSwapDiscriminator)

    if (props.noData) {
      builder.config.dataSlice = { offset: 0, length: 0 }
    }

    if (props.tokenProgramId) {
      builder.addFilter('tokenProgramId', new PublicKey(props.tokenProgramId))
    }

    if (props.poolMint) {
      builder.addFilter('poolMint', new PublicKey(props.poolMint))
    }

    if (props.tokenAMint) {
      builder.addFilter('tokenAMint', new PublicKey(props.tokenAMint))
    }

    if (props.tokenBMint) {
      builder.addFilter('tokenBMint', new PublicKey(props.tokenBMint))
    }

    return (await builder.run(this.provider.connection))
      .map(({ pubkey, account }) => ({
        pubkey,
        data: !props.noData ? TokenSwap.fromAccountInfo(account)[0] : null,
      }))
  }
}

export type LoadAllProps = {
  noData?: boolean
  tokenProgramId?: PublicKeyInitData
  poolMint?: PublicKeyInitData
  tokenAMint?: PublicKeyInitData
  tokenBMint?: PublicKeyInitData
}

export type CreateTokenSwapProps = {
  /// Optional token-swap keypair
  tokenSwap?: Keypair
  /// Pool Token Mint. Must be empty, owned by swap authority.
  poolMint: PublicKey
  /// Pool Token Account to deposit trading and withdraw fees.
  /// Must be empty, not owned by swap authority
  poolFee: PublicKey
  /// Pool Token Account to deposit the initial pool token
  destination: PublicKey
  /// Token "A" Account. Must be non-zero, owned by swap authority.
  tokenA: PublicKey
  /// Token "B" Account. Must be non-zero, owned by swap authority.
  tokenB: PublicKey
  /// Albus policy address
  policy?: PublicKey
  /// Swap curve info for pool, including CurveType and anything
  /// else that may be required
  curveType: CurveType
  curveParameters?: ArrayLike<number> /* 32 */
  /// All swap fees
  fees: {
    tradeFeeNumerator: bigint | number
    tradeFeeDenominator: bigint | number
    ownerTradeFeeNumerator: bigint | number
    ownerTradeFeeDenominator: bigint | number
    ownerWithdrawFeeNumerator: bigint | number
    ownerWithdrawFeeDenominator: bigint | number
    hostFeeNumerator: bigint | number
    hostFeeDenominator: bigint | number
  }
}

export type SwapProps = {
  proofRequest?: PublicKey
  /// Token-swap authority
  authority: PublicKey
  /// Token-swap
  tokenSwap: PublicKey
  /// SOURCE Account, amount is transferable by user transfer authority.
  userSource: PublicKey
  /// DESTINATION Account assigned to USER as the owner.
  userDestination: PublicKey
  /// Base Account to swap FROM.  Must be the DESTINATION token.
  poolSource: PublicKey
  /// Base Account to swap INTO. Must be the SOURCE token.
  poolDestination: PublicKey
  /// Pool token mint, to generate trading fees.
  poolMint: PublicKey
  /// Fee account, to receive trading fees.
  poolFee: PublicKey
  /// Host fee account to receive additional trading fees.
  hostFeeAccount?: PublicKey
  /// SOURCE amount to transfer, output to DESTINATION is based on the exchange rate
  amountIn: bigint | number
  /// Minimum amount of DESTINATION token to output, prevents excessive slippage
  minimumAmountOut: bigint | number
}

export type DepositAllTokenTypesProps = {
  /// Token-swap
  tokenSwap: PublicKey
  /// Pool MINT account, swap authority is the owner.
  poolMint: PublicKey
  /// Pool Account to deposit the generated tokens, user is the owner.
  destination: PublicKey
  /// token_a user transfer authority can transfer amount.
  userTokenA: PublicKey
  /// token_b user transfer authority can transfer amount.
  userTokenB: PublicKey
  /// token_a Base Account to deposit into.
  swapTokenA: PublicKey
  /// token_b Base Account to deposit into.
  swapTokenB: PublicKey
  /// Pool token amount to transfer. token_a and token_b amount is set by
  /// the current exchange rate and size of the pool
  poolTokenAmount: bigint | number
  /// Maximum token A amount to deposit, prevents excessive slippage
  maximumTokenA: bigint | number
  /// Maximum token B amount to deposit, prevents excessive slippage
  maximumTokenB: bigint | number
}

export type WithdrawAllTokenTypesProps = {
  /// Token-swap
  tokenSwap: PublicKey
  /// Pool MINT account, swap authority is the owner.
  poolMint: PublicKey
  /// Fee account, to receive withdrawal fees.
  poolFee: PublicKey
  /// SOURCE Pool account, amount is transferable by user transfer authority.
  source: PublicKey
  /// token_a user Account to credit.
  destTokenA: PublicKey
  /// token_b user Account to credit.
  destTokenB: PublicKey
  /// token_a Swap Account to withdraw FROM.
  swapTokenA: PublicKey
  /// token_b Swap Account to withdraw FROM.
  swapTokenB: PublicKey
  /// Number of pool tokens to burn. User receives an output of token a
  /// and b based on the percentage of the pool tokens that are returned.
  poolTokenAmount: bigint | number
  /// Minimum amount of token A to receive, prevents excessive slippage
  minimumTokenA: bigint | number
  /// Minimum amount of token B to receive, prevents excessive slippage
  minimumTokenB: bigint | number
}

export type DepositSingleTokenTypeExactAmountInProps = {
  /// Token-swap
  tokenSwap: PublicKey
  /// Pool MINT account, swap authority is the owner.
  poolMint: PublicKey
  /// token_(A|B) SOURCE Account, amount is transferable by user transfer authority.
  source: PublicKey
  /// Pool Account to deposit the generated tokens, user is the owner.
  destination: PublicKey
  /// token_a Swap Account, may deposit INTO.
  swapTokenA: PublicKey
  /// token_b Swap Account, may deposit INTO.
  swapTokenB: PublicKey
  /// Token amount to deposit.
  sourceTokenAmount: bigint | number
  /// Pool token amount to receive in exchange.
  /// The amount is set by the current exchange rate and size of the pool.
  minimumPoolTokenAmount: bigint | number
}

export type WithdrawSingleTokenTypeExactAmountOutProps = {
  /// Token-swap
  tokenSwap: PublicKey
  /// Pool MINT account, swap authority is the owner.
  poolMint: PublicKey
  /// Fee account, to receive withdrawal fees.
  poolFee: PublicKey
  /// SOURCE Pool account, amount is transferable by user transfer authority.
  source: PublicKey
  /// token_(A|B) User Account to credit.
  destination: PublicKey
  /// token_a Swap Account to potentially withdraw from.
  swapTokenA: PublicKey
  /// token_b Swap Account to potentially withdraw from.
  swapTokenB: PublicKey
  /// Amount of token A or B to receive
  destinationTokenAmount: bigint | number
  /// Maximum number of pool tokens to burn. User receives an output of token A
  /// or B based on the percentage of the pool tokens that are returned.
  maximumPoolTokenAmount: bigint | number
}
