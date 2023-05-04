import log from 'loglevel'
import { useContext } from '../../../context'

interface Opts {}

export async function remove(code: string, _opts: Opts) {
  const { client } = useContext()

  const { signature } = await client.deleteServiceProvider({ code })

  log.info(`Signature: ${signature}`)
  log.info('OK')
}
