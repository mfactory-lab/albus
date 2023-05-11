import { ZKPRequestStatus } from '@albus/sdk'
import log from 'loglevel'
import { useContext } from '../../context'
import { exploreAddress } from '../../utils'

export async function show(addr: string) {
  const { client } = useContext()

  const zkpRequest = await client.loadZKPRequest(addr)

  log.info('--------------------------------------------------------------------------')
  log.info(`Address: ${addr}`)
  log.info(`Service provider: ${zkpRequest.serviceProvider}`)
  log.info(`Circuit: ${zkpRequest.circuit}`)
  log.info(exploreAddress(zkpRequest.circuit))
  log.info(`Owner: ${zkpRequest.owner}`)
  log.info(exploreAddress(zkpRequest.owner))
  log.info(`Proof: ${zkpRequest.proof}`)
  if (zkpRequest.proof) {
    log.info(exploreAddress(zkpRequest.proof))
  }
  log.info(`Created at: ${zkpRequest.createdAt}`)
  log.info(`Expired at: ${zkpRequest.expiredAt}`)
  log.info(`Proved at: ${zkpRequest.provedAt}`)
  log.info(`Verification date: ${zkpRequest.verifiedAt}`)
  log.info(`Status: ${ZKPRequestStatus[zkpRequest.status]}`)
  log.info('--------------------------------------------------------------------------')
}

interface SearchOpts {
  sp: string
  circuit: string
  requester: string
}

export async function find(opts: SearchOpts) {
  const { client } = useContext()
  const [serviceProviderAddr] = client.getServiceProviderPDA(opts.sp)
  const [zkpRequestAddr] = client.getZKPRequestPDA(serviceProviderAddr, opts.circuit, opts.requester)
  await show(zkpRequestAddr.toString())
}

interface ShowAllOpts {
  sp?: string
  circuit?: string
  proof?: string
}

export async function showAll(opts: ShowAllOpts) {
  const { client } = useContext()

  const items = await client.searchZKPRequests({
    serviceProvider: opts.sp,
    circuit: opts.circuit,
    proof: opts.proof,
  })

  log.info('--------------------------------------------------------------------------')
  log.info('Address | Circuit | Service Provider | Proof | Requester')
  log.info('--------------------------------------------------------------------------')

  for (const item of items) {
    log.info(`${item.pubkey} | ${item.data.circuit} | ${item.data.serviceProvider} | ${item.data.proof} | ${item.data.owner}`)
    log.info('--------------------------------------------------------------------------')
  }
}
