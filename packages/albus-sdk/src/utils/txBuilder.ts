import type {
  ConfirmOptions,
  Signer,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js'
import {
  ComputeBudgetProgram,
  Transaction,
} from '@solana/web3.js'
import type { ClientProvider } from '../client'
import { errorFromCode } from '../generated'

export type PriorityFeeLoader = () => Promise<number>

export class TxBuilder {
  txs: Array<{ tx: Transaction, signers?: Signer[] }> = []
  private priorityFeeLoader: PriorityFeeLoader | undefined

  constructor(readonly provider: ClientProvider) {
    this.addTransaction(new Transaction(), [])
  }

  addTransaction(tx: Transaction, signers?: Signer[]) {
    if (this.txs[0] && this.txs[0].tx.instructions.length > 0) {
      this.txs.push({ tx, signers })
    } else {
      this.txs[0] = { tx, signers }
    }
    return this
  }

  addInstruction(...items: Array<Transaction | TransactionInstruction | TransactionInstructionCtorFields>) {
    this.txs[0]?.tx.add(...items)
    return this
  }

  addSigner(signer: Signer) {
    this.txs[0]?.signers?.push(signer)
    return this
  }

  priorityFee(microLamports: number | bigint) {
    if (microLamports > 0) {
      for (const { tx } of this.txs) {
        tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: BigInt(microLamports) }))
      }
    }
    return this
  }

  withPriorityFeeLoader(fn: PriorityFeeLoader | undefined) {
    this.priorityFeeLoader = fn
    return this
  }

  async sendAll(opts?: ConfirmOptions) {
    try {
      if (this.priorityFeeLoader) {
        this.priorityFee(await this.priorityFeeLoader())
      }
      // skip empty transactions
      const txs = this.txs.filter(({ tx }) => tx.instructions.length > 0)
      return await this.provider.sendAll(txs, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  async sendAndConfirm(opts?: ConfirmOptions, feePayer?: Signer) {
    try {
      if (feePayer !== undefined) {
        this.txs[0]!.tx.feePayer = feePayer.publicKey
        this.txs[0]!.signers?.push(feePayer)
      }
      if (this.priorityFeeLoader) {
        this.priorityFee(await this.priorityFeeLoader())
      }
      return await this.provider.sendAndConfirm(this.txs[0]!.tx, this.txs[0]!.signers, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }

  clear() {
    this.txs = []
  }
}
