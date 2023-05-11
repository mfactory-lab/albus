import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import { useContext } from '../../context'
import { exploreTransaction } from '../../utils'
import { find } from './show'

interface Opts {
  // Service provider code
  sp: string
  // Circuit mint address
  circuit: string
  // Expires in seconds
  expiresIn?: number
}

export async function create(opts: Opts) {
  const { client, provider } = useContext()

  try {
    const { signature } = await client.createZKPRequest({
      serviceCode: opts.sp,
      circuit: new PublicKey(opts.circuit),
      expiresIn: opts.expiresIn,
    })

    log.info(`Signature: ${signature}`)
    log.info(exploreTransaction(signature))

    await find({
      sp: opts.sp,
      circuit: opts.circuit,
      requester: provider.wallet.publicKey.toString(),
    })
  } catch (e) {
    log.error(e)
  }
}
