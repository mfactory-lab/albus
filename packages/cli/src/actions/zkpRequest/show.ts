import log from 'loglevel'
import { useContext } from '../../context'

export async function showZKPRequestInfo(addr: string) {
  const { client } = useContext()

  const zkpRequest = await client.loadZKPRequest(addr)

  log.info('--------------------------------------------------------------------------')
  log.info(`ZKP Request PDA: ${addr}`)
  log.info(`Service provider: ${zkpRequest.serviceProvider}`)
  log.info(`Circuit: ${zkpRequest.circuit}`)
  log.info(`Owner: ${zkpRequest.owner}`)
  log.info(`Proof: ${zkpRequest.proof}`)
  log.info(`Created at: ${zkpRequest.createdAt}`)
  log.info(`Expired at: ${zkpRequest.expiredAt}`)
  log.info(`Verified at: ${zkpRequest.verifiedAt}`)
  log.info(`Proved at: ${zkpRequest.provedAt}`)
  log.info(`Status: ${zkpRequest.status}`)
  log.info('--------------------------------------------------------------------------')
}

interface FindOpts {
  sp: string
  mint: string
  requester: string
}

export async function findZKPRequestInfo(opts: FindOpts) {
  const { client } = useContext()

  const [zkpRequestAddr] = client.getZKPRequestPDA(opts.sp, opts.mint, opts.requester)
  await showZKPRequestInfo(zkpRequestAddr.toString())
}

interface ShowAllOpts {
  sp?: string
  circuit?: string
  proof?: string
}

export async function showAllZKPRequests(opts: ShowAllOpts) {
  const { client, cluster } = useContext()

  const zkpRequests = await client.loadAllZKPRequests({ serviceProvider: opts.sp, circuit: opts.circuit, proof: opts.proof })

  log.info('--------------------------------------------------------------------------')
  for (const sp of zkpRequests) {
    log.info(`ZKP Request PDA: ${sp.pubkey}`)
    log.info(`See full info: "pnpm cli -c ${cluster} zkp show ${sp.pubkey}"`)
    log.info('--------------------------------------------------------------------------')
  }
}
