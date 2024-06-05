import log from 'loglevel'
import { createAdminWithdrawInstruction } from '@albus-finance/sdk'
import { Transaction } from '@solana/web3.js'
import { useContext } from '@/context'
import { lamportsToSol } from '@/utils'

export async function withdraw() {
  const { client } = useContext()

  const authority = client.pda.authority()[0]

  log.info(`Loading balance for authority ${authority}...`)
  const balance = await client.provider.connection.getBalance(authority)

  log.info(`Withdrawing ${lamportsToSol(balance)} SOL to ${client.provider.publicKey}...`)

  const ix = createAdminWithdrawInstruction({
    albusAuthority: authority,
    authority: client.provider.publicKey,
  }, client.programId)

  const sig = await client.provider.sendAndConfirm(new Transaction().add(ix))
  log.info(`Signature: ${sig}`)
}
