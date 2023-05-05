import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {}

export async function remove(addr: string, opts: Opts) {
  const { client } = useContext()

  const signature = await client.deleteZKPRequest({
    zkpRequest: new PublicKey(addr),
  })

  log.info(`Signature: ${signature}`)
  log.info('OK')
}
