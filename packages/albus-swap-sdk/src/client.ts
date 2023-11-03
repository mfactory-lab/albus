import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import type { Commitment, ConfirmOptions, PublicKeyInitData } from '@solana/web3.js'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import type {
  CurveInfo,
  FeesInfo,
} from './generated'
import {
  PROGRAM_ID,
  TokenSwap, createInitializeInstruction, createSwapInstruction,
} from './generated'

export class AlbusSwapClient {
  programId = PROGRAM_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  swapAuthority(addr: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [addr.toBuffer()],
      this.programId,
    )[0]
  }

  /**
   * Initialize Token Swap Pool
   */
  async init(props: InitProps, opts?: ConfirmOptions) {
    const tx = new Transaction()

    const pool = props.pool ?? Keypair.generate()

    const space = TokenSwap.byteSize({
      bumpSeed: 0,
      curve: props.curve,
      fees: props.fees,
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
        newAccountPubkey: pool.publicKey,
        programId: this.programId,
        lamports,
        space,
      }),
    )

    tx.add(
      createInitializeInstruction(
        {
          authority: this.swapAuthority(pool.publicKey),
          tokenSwap: pool.publicKey,
          destination: props.destination,
          feeAccount: props.feeAccount,
          poolMint: props.poolMint,
          tokenA: props.tokenA,
          tokenB: props.tokenB,
        },
        {
          feesInput: props.fees,
          curveInput: props.curve,
        },
      ),
    )

    const signature = await this.provider.sendAndConfirm(tx, [pool], opts)

    return {
      pool: pool.publicKey,
      signature,
    }
  }

  /**
   * Swap tokens
   */
  async swap(props: SwapProps, opts?: ConfirmOptions) {
    const instruction = createSwapInstruction(
      {
        authority: this.swapAuthority(props.pool),
        userTransferAuthority: this.provider.publicKey,
        userSource: props.userSource,
        userDestination: props.userDestination,
        tokenSwap: props.pool,
        poolFee: props.poolFee,
        poolMint: props.poolMint,
        poolSource: props.poolSource,
        poolDestination: props.poolDestination,
        proofRequest: props.proofRequest,
        hostFeeAccount: props.hostFeeAccount,
      },
      {
        amountIn: props.amountIn,
        minimumAmountOut: props.minimumAmountOut,
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Load token swap by address
   */
  async load(addr: PublicKeyInitData, commitment?: Commitment) {
    return TokenSwap.fromAccountAddress(this.provider.connection, new PublicKey(addr), commitment)
  }

  async loadAll() {
    // ...
  }
}

export interface InitProps {
  /// Optional pool keypair
  pool?: Keypair
  /// Pool Token Mint. Must be empty, owned by swap authority.
  poolMint: PublicKey
  /// Pool Token Account to deposit trading and withdraw fees.
  /// Must be empty, not owned by swap authority
  feeAccount: PublicKey
  /// Pool Token Account to deposit the initial pool token
  destination: PublicKey
  /// Token "A" Account. Must be non-zero, owned by swap authority.
  tokenA: PublicKey
  /// Token "B" Account. Must be non-zero, owned by swap authority.
  tokenB: PublicKey
  /// Curve params
  curve: CurveInfo
  /// Fees
  fees: FeesInfo
}

export interface SwapProps {
  proofRequest: PublicKey
  authority: PublicKey
  userSource: PublicKey
  userDestination: PublicKey
  pool: PublicKey
  poolFee: PublicKey
  poolMint: PublicKey
  poolDestination: PublicKey
  poolSource: PublicKey
  hostFeeAccount?: PublicKey
  amountIn: BN
  minimumAmountOut: BN
}
