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
import { type IFullLogger, type Logger, toFullLogger } from './logger'

export type PriorityFeeLoader = (tx: Transaction) => Promise<number>

export class TxBuilder {
  txs: Array<{ tx: Transaction, signers?: Signer[] }> = []

  private priorityFee?: number | bigint
  private priorityFeeLoader?: PriorityFeeLoader
  private logger?: IFullLogger

  constructor(readonly provider: ClientProvider, private readonly opts?: { simulate?: boolean, logger?: Logger }) {
    this.addTransaction(new Transaction(), [])
    if (opts?.logger) {
      this.setLogger(opts.logger)
    }
  }

  setLogger(logger: Logger) {
    this.logger = toFullLogger(logger)
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

  addSigner(...signer: Signer[]) {
    this.txs[0]?.signers?.push(...signer)
    return this
  }

  withPriorityFee(microLamports: number | bigint) {
    this.priorityFee = microLamports
    return this
  }

  withPriorityFeeLoader(fn: PriorityFeeLoader | undefined) {
    this.priorityFeeLoader = fn
    return this
  }

  async sendAll(opts?: ConfirmOptions) {
    try {
      // skip empty transactions
      const txs = this.txs.filter(({ tx }) => tx.instructions.length > 0)

      // apply priority fee
      if (this.priorityFee && this.priorityFee > 0) {
        for (const { tx } of this.txs) {
          tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: BigInt(this.priorityFee) }))
        }
      } else if (this.priorityFeeLoader) {
        for (const { tx } of this.txs) {
          const microLamports = await this.priorityFeeLoader(tx)
          tx.instructions = [
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
            ...tx.instructions,
          ]
        }
      }

      for (const { tx, signers } of txs) {
        if (this.opts?.simulate && this.provider.simulate) {
          try {
            const res = await this.provider.simulate(tx, signers, opts?.commitment)
            this.logger?.log('simulation', res)
          } catch (e) {
            this.logger?.error('simulation', e)
          }
        }
      }

      return await this.provider.sendAll(txs, {
        ...this.provider.opts,
        ...opts,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    } finally {
      this.clear()
    }
  }

  async sendAndConfirm(opts?: SendOpts) {
    if (this.txs[0] === undefined) {
      throw new Error('No transactions to send')
    }

    if (opts?.feePayer !== undefined) {
      this.txs[0].tx.feePayer = opts.feePayer.publicKey
      this.txs[0].signers?.push(opts.feePayer)
    }

    // apply priority fee
    if (opts?.priorityFee !== undefined) {
      for (const { tx } of this.txs) {
        tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: BigInt(opts?.priorityFee) }))
      }
    } else if (this.priorityFee && this.priorityFee > 0) {
      for (const { tx } of this.txs) {
        tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: BigInt(this.priorityFee) }))
      }
    } else if (this.priorityFeeLoader) {
      const microLamports = await this.priorityFeeLoader(this.txs[0].tx)
      for (const { tx } of this.txs) {
        tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }))
      }
    }

    if (this.opts?.simulate && this.provider.simulate) {
      try {
        const res = await this.provider.simulate(this.txs[0].tx, this.txs[0].signers, opts?.confirm?.commitment)
        this.logger?.log('simulation', res)
      } catch (e) {
        this.logger?.error('simulation', e)
      }
    }

    try {
      return await this.provider.sendAndConfirm(this.txs[0].tx, this.txs[0].signers, {
        ...this.provider.opts,
        ...opts?.confirm,
      })
    } catch (e: any) {
      throw errorFromCode(e.code) ?? e
    } finally {
      this.clear()
    }
  }

  clear() {
    this.txs = []
    this.addTransaction(new Transaction(), [])
  }
}

export type SendOpts = {
  confirm?: ConfirmOptions
  feePayer?: Signer
  priorityFee?: number
}
