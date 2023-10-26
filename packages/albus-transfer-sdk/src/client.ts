import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import type { ConfirmOptions, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import {
  PROGRAM_ID,
  createSplTransferInstruction,
  createTransferInstruction,
} from './generated'

export class AlbusTransferClient {
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
        proofRequest: props.proofRequest,
        policy: props.policy,
        sender: this.provider.publicKey,
        receiver: props.receiver,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  /**
   * Transfer SPL tokens
   */
  async transferToken(props: SplTransferProps, opts?: ConfirmOptions) {
    const instruction = createSplTransferInstruction(
      {
        proofRequest: props.proofRequest,
        policy: props.policy,
        sender: this.provider.publicKey,
        receiver: props.receiver,
        source: props.source,
        destination: props.destination,
        tokenMint: props.tokenMint,
      },
      {
        amount: props.amount,
      },
    )

    const tx = new Transaction().add(instruction)
    return this.provider.sendAndConfirm(tx, [], opts)
  }
}

export interface TransferProps {
  receiver: PublicKey
  proofRequest: PublicKey
  policy: PublicKey
  amount: BN
}

export interface SplTransferProps extends TransferProps {
  source: PublicKey
  destination: PublicKey
  tokenMint: PublicKey
}
