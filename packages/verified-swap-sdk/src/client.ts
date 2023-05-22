import type { AnchorProvider, BN } from '@project-serum/anchor'
import type { ConfirmOptions, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import {
  PROGRAM_ID,
  createDepositAllTokenTypesInstruction,
  createDepositSingleTokenInstruction,
  createSwapInstruction,
  createWithdrawAllTokenTypesInstruction,
  createWithdrawSingleTokenInstruction,
} from './generated'

export class VerifiedSwapClient {
  programId = PROGRAM_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  /**
   * Swap tokens
   */
  async swap(props: SwapProps, opts?: ConfirmOptions) {
    const instruction = createSwapInstruction(
      {
        authority: props.authority,
        destination: props.destination,
        poolFee: props.poolFee,
        poolMint: props.poolMint,
        source: props.source,
        splTokenSwapProgram: props.splTokenSwapProgram,
        swap: props.swap,
        swapDestination: props.swapDestination,
        swapSource: props.swapSource,
        userTransferAuthority: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        amountIn: props.amountIn,
        minimumAmountOut: props.minimumAmountOut,
      },
    )

    const tx = new Transaction().add(instruction)
    await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Deposit single token type tokens
   */
  async depositSingle(props: DepositSingleProps, opts?: ConfirmOptions) {
    const instruction = createDepositSingleTokenInstruction(
      {
        authority: props.authority,
        destination: props.destination,
        poolMint: props.poolMint,
        sourceToken: props.sourceToken,
        splTokenSwapProgram: props.splTokenSwapProgram,
        swap: props.swap,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
        userTransferAuthority: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        minimumPoolTokenAmount: props.minimumPoolTokenAmount,
        sourceTokenAmount: props.sourceTokenAmount,
      },
    )

    const tx = new Transaction().add(instruction)
    await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Withdraw single token type tokens
   */
  async withdrawSingle(props: WithdrawSingleProps, opts?: ConfirmOptions) {
    const instruction = createWithdrawSingleTokenInstruction(
      {
        feeAccount: props.feeAccount,
        poolTokenSource: props.poolTokenSource,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
        authority: props.authority,
        destination: props.destination,
        poolMint: props.poolMint,
        splTokenSwapProgram: props.splTokenSwapProgram,
        swap: props.swap,
        userTransferAuthority: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        destinationTokenAmount: props.destinationTokenAmount,
        maximumPoolTokenAmount: props.maximumPoolTokenAmount,
      },
    )

    const tx = new Transaction().add(instruction)
    await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Deposit all token types
   */
  async depositAll(props: DepositAllProps, opts?: ConfirmOptions) {
    const instruction = createDepositAllTokenTypesInstruction(
      {
        authority: props.authority,
        depositTokenA: props.depositTokenA,
        depositTokenB: props.depositTokenB,
        destination: props.destination,
        poolMint: props.poolMint,
        splTokenSwapProgram: props.splTokenSwapProgram,
        swap: props.swap,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
        userTransferAuthority: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        maximumTokenAAmount: props.maximumTokenAAmount,
        maximumTokenBAmount: props.maximumTokenBAmount,
        poolTokenAmount: props.poolTokenAmount,
      },
    )

    const tx = new Transaction().add(instruction)
    await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Withdraw all token types
   */
  async withdrawAll(props: WithdrawAllProps, opts?: ConfirmOptions) {
    const instruction = createWithdrawAllTokenTypesInstruction(
      {
        authority: props.authority,
        destinationTokenA: props.destinationTokenA,
        destinationTokenB: props.destinationTokenB,
        feeAccount: props.feeAccount,
        poolMint: props.poolMint,
        source: props.source,
        splTokenSwapProgram: props.splTokenSwapProgram,
        swap: props.swap,
        swapTokenA: props.swapTokenA,
        swapTokenB: props.swapTokenB,
        userTransferAuthority: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        minimumTokenAAmount: props.minimumTokenAAmount,
        minimumTokenBAmount: props.minimumTokenBAmount,
        poolTokenAmount: props.poolTokenAmount,
      },
    )

    const tx = new Transaction().add(instruction)
    await this.provider.sendAndConfirm(tx, [], opts)
  }
}

export interface SwapProps {
  destination: PublicKey
  poolFee: PublicKey
  poolMint: PublicKey
  source: PublicKey
  splTokenSwapProgram: PublicKey
  swap: PublicKey
  swapDestination: PublicKey
  swapSource: PublicKey
  authority: PublicKey
  zkpRequest: PublicKey
  amountIn: BN
  minimumAmountOut: BN
}

export interface DepositSingleProps {
  authority: PublicKey
  destination: PublicKey
  poolMint: PublicKey
  sourceToken: PublicKey
  splTokenSwapProgram: PublicKey
  swap: PublicKey
  swapTokenA: PublicKey
  swapTokenB: PublicKey
  zkpRequest: PublicKey
  minimumPoolTokenAmount: BN
  sourceTokenAmount: BN
}

export interface WithdrawSingleProps {
  authority: PublicKey
  destination: PublicKey
  poolMint: PublicKey
  feeAccount: PublicKey
  splTokenSwapProgram: PublicKey
  swap: PublicKey
  swapTokenA: PublicKey
  swapTokenB: PublicKey
  poolTokenSource: PublicKey
  zkpRequest: PublicKey
  destinationTokenAmount: BN
  maximumPoolTokenAmount: BN
}

export interface DepositAllProps {
  authority: PublicKey
  depositTokenA: PublicKey
  depositTokenB: PublicKey
  destination: PublicKey
  poolMint: PublicKey
  splTokenSwapProgram: PublicKey
  swapTokenA: PublicKey
  swapTokenB: PublicKey
  swap: PublicKey
  zkpRequest: PublicKey
  maximumTokenAAmount: BN
  maximumTokenBAmount: BN
  poolTokenAmount: BN
}

export interface WithdrawAllProps {
  authority: PublicKey
  destinationTokenA: PublicKey
  destinationTokenB: PublicKey
  feeAccount: PublicKey
  poolMint: PublicKey
  source: PublicKey
  swapTokenA: PublicKey
  swapTokenB: PublicKey
  swap: PublicKey
  splTokenSwapProgram: PublicKey
  zkpRequest: PublicKey
  minimumTokenAAmount: BN
  minimumTokenBAmount: BN
  poolTokenAmount: BN
}
