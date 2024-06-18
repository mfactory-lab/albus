import log from 'loglevel'
import { useContext } from '@/context'

export async function fund(_opts: any) {
  const { client } = useContext()
  const addr = client.pda.authority()[0]
  log.info(`Funding ${addr} ...`)
  const signature = await client.provider.connection.requestAirdrop(addr, 2)
  log.info(`Signature: ${signature}`)
}
