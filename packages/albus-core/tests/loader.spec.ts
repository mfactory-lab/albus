import { describe, it } from 'vitest'
// import { securityLoader } from '@digitalcredentials/security-document-loader'
import { securityLoader } from '../src/credential/documentLoader'

describe('loader', async () => {
  it('works', async () => {
    const loader = securityLoader().build()

    // const did = 'did:web:albus.finance'
    // const did = 'did:albus:issuer:9not3fH8oNjWePPgaQGGtiAnMiZyWBsr3KL8mnMCmvHV?cluster=devnet'
    const did = 'did:key:z6MkmCz3XUUvYphXN8ieNYrU7hCUXAHFvzSRQ5YXJC1qwX6U'
    const res = await loader(did)

    // console.log(await loader('did:web:albus.finance'))
    console.log(JSON.stringify(res, null, 2))
    // console.log(await loader('did:albus:issuer:9not3fH8oNjWePPgaQGGtiAnMiZyWBsr3KL8mnMCmvHV?cluster=devnet'))
  })
})
