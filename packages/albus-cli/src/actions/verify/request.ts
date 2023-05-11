import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {}

/**
 * Verify ZKP request
 */
export async function verifyRequest(addr: string, _opts: Opts) {
  const { client } = useContext()

  log.debug('Verifying proof...')
  const isVerified = await client.verifyZKPRequest(addr)
  log.debug('Status:', isVerified)

  try {
    log.debug('Update on-chain status...')
    if (isVerified) {
      await client.verify({ zkpRequest: new PublicKey(addr) })
      log.debug('Verified!')
    } else {
      await client.reject({ zkpRequest: new PublicKey(addr) })
      log.debug('Rejected!')
    }
  } catch (e) {
    log.error(e)
  }

  process.exit(0)
}
