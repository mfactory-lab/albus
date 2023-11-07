import type { AnchorProvider, BN } from '@coral-xyz/anchor'
import type { ConfirmOptions, PublicKey } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import { TokenAccountNotFoundError, TokenInvalidAccountOwnerError, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token'
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
    const tx = this.createTransferTx(props)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  createTransferTx(props: TransferProps) {
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

    return new Transaction().add(instruction)
  }

  async getTransferFee(props: TransferProps) {
    const tx = this.createTransferTx(props)
    return this.transactionFee(tx)
  }

  /**
   * Transfer SPL tokens
   */
  async transferToken(props: SplTransferProps, opts?: ConfirmOptions) {
    const tx = await this.createTransferTokenTx(props)
    return this.provider.sendAndConfirm(tx, [], opts)
  }

  async createTransferTokenTx(props: SplTransferProps) {
    const tx = new Transaction()

    try {
      await getAccount(this.connection, props.destination)
    } catch (error: unknown) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            this.provider.publicKey,
            props.destination,
            props.receiver,
            props.tokenMint,
          ),
        )
      }
    }

    tx.add(
      createSplTransferInstruction(
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
      ),
    )

    return tx
  }

  async getTransferTokenFee(props: SplTransferProps) {
    const tx = await this.createTransferTokenTx(props)
    return this.transactionFee(tx)
  }

  async transactionFee(transaction: Transaction) {
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash('finalized')).blockhash
    transaction.feePayer = this.provider.publicKey

    const { value } = await this.connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed',
    )
    return Number(value)
  }
}

export type TransferProps = {
  receiver: PublicKey
  proofRequest: PublicKey
  policy: PublicKey
  amount: BN
}

export type SplTransferProps = {
  source: PublicKey
  destination: PublicKey
  tokenMint: PublicKey
} & TransferProps
