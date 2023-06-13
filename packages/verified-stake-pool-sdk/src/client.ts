import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import { web3 } from '@coral-xyz/anchor'
import type { ConfirmOptions, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import {
  PROGRAM_ID,
  createAddValidatorInstruction,
  createDepositSolInstruction,
  createDepositStakeInstruction,
  createWithdrawSolInstruction, createWithdrawStakeInstruction,
} from './generated'

export class VerifiedStakePoolClient {
  programId = PROGRAM_ID
  clock = web3.SYSVAR_CLOCK_PUBKEY
  stakeProgram = web3.StakeProgram.programId
  stakeHistory = web3.SYSVAR_STAKE_HISTORY_PUBKEY
  stakeConfig = web3.STAKE_CONFIG_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  /**
   * Deposit SOL
   */
  async depositSol(props: DepositSolProps, opts?: ConfirmOptions) {
    let anchorRemainingAccounts
    let signers
    if (props.solDepositAuthority) {
      anchorRemainingAccounts = [{
        pubkey: props.solDepositAuthority.publicKey,
        isWritable: false,
        isSigner: true,
      }]
      signers = [props.solDepositAuthority]
    } else {
      anchorRemainingAccounts = []
      signers = []
    }

    const instruction = createDepositSolInstruction(
      {
        authority: this.provider.publicKey,
        managerFeeAccount: props.managerFeeAccount,
        poolMint: props.poolMint,
        poolTokensTo: props.poolTokensTo,
        referrerPoolTokensAccount: props.referrerPoolTokensAccount,
        reserveStake: props.reserveStake,
        stakePool: props.stakePool,
        stakePoolWithdrawAuthority: props.stakePoolWithdrawAuthority,
        zkpRequest: props.zkpRequest,
        anchorRemainingAccounts,
        stakePoolProgram: props.stakePoolProgram,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, signers, opts)
  }

  /**
   * Deposit stake account
   */
  async depositStake(props: DepositStakeProps, opts?: ConfirmOptions) {
    let anchorRemainingAccounts
    let signers
    if (props.stakePoolDepositAuthoritySigner) {
      anchorRemainingAccounts = [{
        pubkey: props.stakePoolDepositAuthoritySigner.publicKey,
        isWritable: false,
        isSigner: true,
      }]
      signers = [props.stakePoolDepositAuthoritySigner]
    } else {
      anchorRemainingAccounts = []
      signers = []
    }

    const instruction = createDepositStakeInstruction(
      {
        authority: this.provider.publicKey,
        clock: this.clock,
        depositStake: props.depositStake,
        managerFeeAccount: props.managerFeeAccount,
        poolMint: props.poolMint,
        poolTokensTo: props.poolTokensTo,
        referrerPoolTokensAccount: props.referrerPoolTokensAccount,
        reserveStake: props.reserveStake,
        stakeHistory: this.stakeHistory,
        stakePool: props.stakePool,
        stakePoolDepositAuthority: props.stakePoolDepositAuthority,
        stakePoolWithdrawAuthority: props.stakePoolWithdrawAuthority,
        stakeProgram: this.stakeProgram,
        validatorListStorage: props.validatorListStorage,
        validatorStake: props.validatorStake,
        zkpRequest: props.zkpRequest,
        anchorRemainingAccounts,
        stakePoolProgram: props.stakePoolProgram,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, signers, opts)
  }

  /**
   * Withdraw SOL
   */
  async withdrawSol(props: WithdrawSolProps, opts?: ConfirmOptions) {
    let anchorRemainingAccounts
    let signers
    if (props.solWithdrawAuthority) {
      anchorRemainingAccounts = [{
        pubkey: props.solWithdrawAuthority.publicKey,
        isWritable: false,
        isSigner: true,
      }]
      signers = [props.solWithdrawAuthority]
    } else {
      anchorRemainingAccounts = []
      signers = []
    }

    const instruction = createWithdrawSolInstruction(
      {
        authority: this.provider.publicKey,
        clock: this.clock,
        lamportsTo: props.lamportsTo,
        managerFeeAccount: props.managerFeeAccount,
        poolMint: props.poolMint,
        poolTokensFrom: props.poolTokensFrom,
        reserveStake: props.reserveStake,
        stakeHistory: this.stakeHistory,
        stakePool: props.stakePool,
        stakePoolWithdrawAuthority: props.stakePoolWithdrawAuthority,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
        anchorRemainingAccounts,
        stakePoolProgram: props.stakePoolProgram,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, signers, opts)
  }

  /**
   * Withdraw stake account
   */
  async withdrawStake(props: WithdrawStakeProps, opts?: ConfirmOptions) {
    const instruction = createWithdrawStakeInstruction(
      {
        userStakeAuthority: props.userStakeAuthority,
        authority: this.provider.publicKey,
        clock: this.clock,
        managerFeeAccount: props.managerFeeAccount,
        poolMint: props.poolMint,
        poolTokensFrom: props.poolTokensFrom,
        stakePool: props.stakePool,
        stakePoolWithdrawAuthority: props.stakePoolWithdrawAuthority,
        stakeProgram: this.stakeProgram,
        stakeToReceive: props.stakeToReceive,
        stakeToSplit: props.stakeToSplit,
        validatorListStorage: props.validatorListStorage,
        zkpRequest: props.zkpRequest,
        stakePoolProgram: props.stakePoolProgram,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Add validator to stake pool
   */
  async addValidator(props: AddValidatorProps, opts?: ConfirmOptions) {
    const instruction = createAddValidatorInstruction(
      {
        clock: this.clock,
        funder: this.provider.publicKey,
        stake: props.stake,
        stakeConfig: this.stakeConfig,
        stakeHistory: this.stakeHistory,
        stakePool: props.stakePool,
        stakePoolWithdrawAuthority: props.stakePoolWithdrawAuthority,
        stakeProgram: this.stakeProgram,
        staker: props.staker.publicKey,
        validator: props.validator,
        validatorListStorage: props.validatorListStorage,
        zkpRequest: props.zkpRequest,
        stakePoolProgram: props.stakePoolProgram,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.staker], opts)
  }
}

export interface DepositSolProps {
  zkpRequest: PublicKey
  managerFeeAccount: PublicKey
  poolMint: PublicKey
  poolTokensTo: PublicKey
  referrerPoolTokensAccount: PublicKey
  reserveStake: PublicKey
  stakePool: PublicKey
  stakePoolWithdrawAuthority: PublicKey
  stakePoolProgram: PublicKey
  amount: BN
  solDepositAuthority?: web3.Signer
}

export interface DepositStakeProps {
  zkpRequest: PublicKey
  managerFeeAccount: PublicKey
  poolMint: PublicKey
  poolTokensTo: PublicKey
  referrerPoolTokensAccount: PublicKey
  reserveStake: PublicKey
  stakePool: PublicKey
  stakePoolWithdrawAuthority: PublicKey
  stakePoolDepositAuthority: PublicKey
  depositStake: PublicKey
  validatorListStorage: PublicKey
  validatorStake: PublicKey
  stakePoolProgram: PublicKey
  stakePoolDepositAuthoritySigner?: web3.Signer
}

export interface WithdrawSolProps {
  zkpRequest: PublicKey
  managerFeeAccount: PublicKey
  poolMint: PublicKey
  lamportsTo: PublicKey
  reserveStake: PublicKey
  stakePool: PublicKey
  stakePoolWithdrawAuthority: PublicKey
  poolTokensFrom: PublicKey
  amount: BN
  stakePoolProgram: PublicKey
  solWithdrawAuthority?: web3.Signer
}

export interface WithdrawStakeProps {
  zkpRequest: PublicKey
  managerFeeAccount: PublicKey
  poolMint: PublicKey
  stakeToSplit: PublicKey
  stakeToReceive: PublicKey
  stakePool: PublicKey
  stakePoolWithdrawAuthority: PublicKey
  poolTokensFrom: PublicKey
  validatorListStorage: PublicKey
  userStakeAuthority: PublicKey
  stakePoolProgram: PublicKey
  amount: BN
}

export interface AddValidatorProps {
  zkpRequest: PublicKey
  stake: PublicKey
  staker: web3.Signer
  stakePool: PublicKey
  stakePoolWithdrawAuthority: PublicKey
  validator: PublicKey
  validatorListStorage: PublicKey
  stakePoolProgram: PublicKey
}
