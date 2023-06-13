import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import type { ConfirmOptions, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import {
  PROGRAM_ID,
  createSplTransferInstruction,
  createTransferInstruction,
} from './generated'

export class VerifiedTransferClient {
  programId = PROGRAM_ID

  constructor(private readonly provider: AnchorProvider) {}

  get connection() {
    return this.provider.connection
  }

  /**
   * Transfer SOL
   */
  async transfer(props: TransferProps, opts?: ConfirmOptions) {
    const instruction = createTransferInstruction(
      {
        receiver: props.receiver,
        sender: this.provider.publicKey,
        zkpRequest: props.zkpRequest,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Transfer SPL tokens
   */
  async splTransfer(props: SplTransferProps, opts?: ConfirmOptions) {
    const instruction = createSplTransferInstruction(
      {
        destination: props.destination,
        receiver: props.receiver,
        sender: this.provider.publicKey,
        source: props.source,
        tokenMint: props.tokenMint,
        zkpRequest: props.zkpRequest,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return await this.provider.sendAndConfirm(tx, [], opts)
  }
}

export interface TransferProps {
  receiver: PublicKey
  zkpRequest: PublicKey
  amount: BN
}

export interface SplTransferProps {
  receiver: PublicKey
  source: PublicKey
  destination: PublicKey
  zkpRequest: PublicKey
  tokenMint: PublicKey
  amount: BN
}
