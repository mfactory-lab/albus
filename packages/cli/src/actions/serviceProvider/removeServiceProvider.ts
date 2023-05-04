import log from 'loglevel'
import { useContext } from '../../context'

interface Opts {}

export async function removeServiceProvider(code: string, opts: Opts) {
  const { client } = useContext()

  const signature = await client.deleteServiceProvider({
    code,
  })

  log.info(`Signature: ${signature}`)
  log.info('OK')
}
