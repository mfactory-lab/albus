import log from 'loglevel'
import { useContext } from '../../../context'
import { show } from './show'

interface Opts {
  code: string
  name: string
}

export async function add(opts: Opts) {
  const { client } = useContext()

  const { signature } = await client.addServiceProvider({
    code: opts.code,
    name: opts.name,
  })

  await show(opts.code)

  log.info(`Signature: ${signature}`)
  log.info('OK')
}
