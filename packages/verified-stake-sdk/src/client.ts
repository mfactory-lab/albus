import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import type {
  ConfirmOptions, Keypair,
  PublicKey,
} from '@solana/web3.js'
import {
  STAKE_CONFIG_ID,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_STAKE_HISTORY_PUBKEY,
  StakeProgram,
  Transaction,
} from '@solana/web3.js'
import type { StakeAuthorize } from './generated'
import {
  PROGRAM_ID,
  createAuthorizeCheckedInstruction,
  createAuthorizeInstruction,
  createDelegateInstruction,
  createMergeInstruction,
  createRedelegateInstruction,
  createRedelegateWithSeedInstruction,
  createSplitInstruction,
  createSplitWithSeedInstruction,
  createWithdrawInstruction,
} from './generated'

export class VerifiedStakeClient {
  programId = PROGRAM_ID
  stakeProgram = StakeProgram.programId
  stakeHistory = SYSVAR_STAKE_HISTORY_PUBKEY
  clock = SYSVAR_CLOCK_PUBKEY
  stakeConfig = STAKE_CONFIG_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  /**
   * Split stake
   */
  async split(props: SplitProps, opts?: ConfirmOptions) {
    const instruction = createSplitInstruction(
      {
        authorized: this.provider.publicKey,
        splitStake: props.splitStake.publicKey,
        stake: props.stake,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
      },
      {
        lamports: props.lamports,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.splitStake], opts)
  }

  /**
   * Split stake with seed
   */
  async splitWithSeed(props: SplitWithSeedProps, opts?: ConfirmOptions) {
    const instruction = createSplitWithSeedInstruction(
      {
        authorized: this.provider.publicKey,
        base: props.base.publicKey,
        splitStake: props.splitStake.publicKey,
        stake: props.stake,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
      },
      {
        lamports: props.lamports,
        seed: props.seed,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.splitStake, props.base], opts)
  }

  /**
   * Merge stake
   */
  async merge(props: MergeProps, opts?: ConfirmOptions) {
    const instruction = createMergeInstruction(
      {
        authorized: this.provider.publicKey,
        clock: this.clock,
        destinationStake: props.destinationStake,
        sourceStake: props.sourceStake,
        stakeHistory: this.stakeHistory,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Withdraw from stake
   */
  async withdraw(props: WithdrawProps, opts?: ConfirmOptions) {
    const instruction = createWithdrawInstruction(
      {
        clock: this.clock,
        destination: props.destination,
        stake: props.stake,
        stakeHistory: this.stakeHistory,
        stakeProgram: this.stakeProgram,
        withdrawer: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        lamports: props.lamports,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Delegate stake
   */
  async delegate(props: DelegateProps, opts?: ConfirmOptions) {
    const instruction = createDelegateInstruction(
      {
        authorized: this.provider.publicKey,
        clock: this.clock,
        stake: props.stake,
        stakeConfig: this.stakeConfig,
        stakeHistory: this.stakeHistory,
        stakeProgram: this.stakeProgram,
        vote: props.vote,
        zkpRequest: props.zkpRequest,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Redelegate stake
   */
  async redelegate(props: RedelegateProps, opts?: ConfirmOptions) {
    const instruction = createRedelegateInstruction(
      {
        authorized: this.provider.publicKey,
        stake: props.stake,
        stakeConfig: this.stakeConfig,
        stakeProgram: this.stakeProgram,
        uninitializedStake: props.uninitializedStake.publicKey,
        vote: props.vote,
        zkpRequest: props.zkpRequest,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.uninitializedStake], opts)
  }

  /**
   * Redelegate stake with seed
   */
  async redelegateWithSeed(props: RedelegateWithSeedProps, opts?: ConfirmOptions) {
    const instruction = createRedelegateWithSeedInstruction(
      {
        authorized: this.provider.publicKey,
        base: props.base.publicKey,
        stake: props.stake,
        stakeConfig: this.stakeConfig,
        stakeProgram: this.stakeProgram,
        uninitializedStake: props.uninitializedStake,
        vote: props.vote,
        zkpRequest: props.zkpRequest,
      },
      {
        seed: props.seed,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.base], opts)
  }

  /**
   * Authorize stake
   */
  async authorize(props: AuthorizeProps, opts?: ConfirmOptions) {
    const instruction = createAuthorizeInstruction(
      {
        authorized: this.provider.publicKey,
        clock: this.clock,
        stake: props.stake,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
      },
      {
        newAuthorized: props.newAuthorized,
        stakeAuthorize: props.stakeAuthorized,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Authorize checked stake
   */
  async authorizeChecked(props: AuthorizeCheckedProps, opts?: ConfirmOptions) {
    const instruction = createAuthorizeCheckedInstruction(
      {
        authorized: this.provider.publicKey,
        clock: this.clock,
        newAuthorized: props.newAuthorized.publicKey,
        stake: props.stake,
        stakeProgram: this.stakeProgram,
        zkpRequest: props.zkpRequest,
      },
      {
        stakeAuthorize: props.stakeAuthorized,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [props.newAuthorized], opts)
  }
}

export interface SplitProps {
  stake: PublicKey
  splitStake: Keypair
  zkpRequest: PublicKey
  lamports: BN
}

export interface SplitWithSeedProps {
  stake: PublicKey
  splitStake: Keypair
  zkpRequest: PublicKey
  base: Keypair
  seed: string
  lamports: BN
}

export interface MergeProps {
  destinationStake: PublicKey
  sourceStake: PublicKey
  zkpRequest: PublicKey
}

export interface WithdrawProps {
  stake: PublicKey
  destination: PublicKey
  zkpRequest: PublicKey
  lamports: BN
}

export interface DelegateProps {
  stake: PublicKey
  vote: PublicKey
  zkpRequest: PublicKey
}

export interface RedelegateProps {
  stake: PublicKey
  vote: PublicKey
  uninitializedStake: Keypair
  zkpRequest: PublicKey
}

export interface RedelegateWithSeedProps {
  stake: PublicKey
  vote: PublicKey
  base: Keypair
  seed: string
  uninitializedStake: PublicKey
  zkpRequest: PublicKey
}

export interface AuthorizeProps {
  stake: PublicKey
  newAuthorized: PublicKey
  stakeAuthorized: StakeAuthorize
  zkpRequest: PublicKey
}

export interface AuthorizeCheckedProps {
  stake: PublicKey
  newAuthorized: Keypair
  stakeAuthorized: StakeAuthorize
  zkpRequest: PublicKey
}
