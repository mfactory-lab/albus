import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'
import { findZKPRequestInfo } from './show'

interface Opts {
  code: string
  mint: string
  expires?: number
}

export async function createZKPRequest(opts: Opts) {
  const { client, provider } = useContext()

  const signature = await client.createZKPRequest({
    serviceProviderCode: opts.code,
    circuitMint: new PublicKey(opts.mint),
    expiresIn: opts.expires,
  })

  log.info(`Signature: ${signature}`)
  const [serviceProviderAddr] = client.getServiceProviderPDA(opts.code)
  await findZKPRequestInfo({
    mint: opts.mint,
    requester: provider.wallet.publicKey.toString(),
    sp: serviceProviderAddr.toString(),
  })
  log.info('OK')
}
