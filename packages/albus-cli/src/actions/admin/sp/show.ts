import log from 'loglevel'
import { useContext } from '../../../context'

export async function show(code: string) {
  const { client } = useContext()

  const [serviceProviderAddr] = client.getServiceProviderPDA(code)
  const sp = await client.loadServiceProvider(serviceProviderAddr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address ${serviceProviderAddr}`)
  log.info(`Authority: ${sp.authority}`)
  log.info(`Code: ${sp.code}`)
  log.info(`Name: ${sp.name}`)
  log.info(`ZKP request's count: ${sp.zkpRequestCount}`)
  log.info(`Creation time: ${sp.createdAt}`)
  log.info('--------------------------------------------------------------------------')
}

export async function showAll(opts: { authority?: string }) {
  const { client } = useContext()

  const items = await client.loadAllServiceProviders({
    authority: opts.authority,
  })

  log.info('--------------------------------------------------------------------------')
  log.info('Code | Name | Address | Request count')
  log.info('--------------------------------------------------------------------------')

  for (const item of items) {
    log.info(`${item.data.code} | ${item.data.name} | ${item.pubkey} | ${item.data.zkpRequestCount}`)
    log.info('--------------------------------------------------------------------------')
  }
}
