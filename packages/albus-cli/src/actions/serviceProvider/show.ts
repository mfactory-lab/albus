import log from 'loglevel'
import { useContext } from '../../context'

export async function showServiceProviderInfo(addr: string) {
  const { client } = useContext()

  const serviceProvider = await client.loadServiceProvider(addr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Service Provider PDA: ${addr}`)
  log.info(`Authority: ${serviceProvider.authority}`)
  log.info(`Code: ${serviceProvider.code}`)
  log.info(`Name: ${serviceProvider.name}`)
  log.info(`ZKP request's count: ${serviceProvider.zkpRequestCount}`)
  log.info(`Creation time: ${serviceProvider.createdAt}`)
  log.info('--------------------------------------------------------------------------')
}

export async function findServiceProviderInfo(code: string) {
  const { client } = useContext()

  const [serviceProviderAddr] = client.getServiceProviderPDA(code)
  await showServiceProviderInfo(serviceProviderAddr.toString())
}

export async function showAllServiceProviders(authority?: string) {
  const { client, cluster } = useContext()

  const serviceProviders = await client.loadAllServiceProviders({ authority })

  log.info('--------------------------------------------------------------------------')
  for (const sp of serviceProviders) {
    log.info(`Service Provider PDA: ${sp.pubkey}`)
    log.info(`See full info: "pnpm cli -c ${cluster} sp show ${sp.pubkey}"`)
    log.info('--------------------------------------------------------------------------')
  }
}
