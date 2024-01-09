import type {
  ConfirmOptions,
  Signer,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js'
import {
  Transaction,
} from '@solana/web3.js'
import type { ClientProvider } from '../client'
import { errorFromCode } from '../generated'

export class TxBuilder {
  txs: Array<{ tx: Transaction, signers?: Signer[] }> = []

  constructor(readonly provider: ClientProvider) {
    this.addTransaction(new Transaction(), [])
  }

  addTransaction(tx: Transaction, signers?: Signer[]) {
    this.txs.push({ tx, signers })
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

  async sendAll(opts?: ConfirmOptions) {
    try {
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
      return await this.provider.sendAndConfirm(this.txs[0]!.tx, this.txs[0]!.signers, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    }
  }
}
