import log from 'loglevel'
import { useContext } from '../../context'
import { findServiceProviderInfo } from './show'

interface Opts {
  code: string
  name: string
}

export async function addServiceProvider(opts: Opts) {
  const { client } = useContext()

  const signature = await client.addServiceProvider({
    code: opts.code,
    name: opts.name,
  })

  log.info(`Signature: ${signature}`)
  await findServiceProviderInfo(opts.code)
  log.info('OK')
}
