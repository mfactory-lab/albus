import { AlbusClient } from '@albus/sdk'
import { assert } from 'chai'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'

const payerKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))
const opts = AnchorProvider.defaultOptions()

const provider = new AnchorProvider(
  new web3.Connection('http://localhost:8899', opts.preflightCommitment),
  new Wallet(payerKeypair),
  AnchorProvider.defaultOptions(),
)

describe('albus', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  let mint: web3.PublicKey

  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payerKeypair.publicKey, 10 * web3.LAMPORTS_PER_SOL),
    )
  })

  it('can add service provider', async () => {
    try {
      await client.addServiceProvider({
        code: 'code',
        name: 'name',
      })
    } catch (e) {
      console.log(e)
      throw e
    }

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(serviceProviderData.authority.equals(payerKeypair.publicKey), true)
    assert.equal(serviceProviderData.code, 'code')
    assert.equal(serviceProviderData.name, 'name')
    assert.equal(serviceProviderData.zkpRequestCount, 0)
  })

  it('can not create ZKP request with unauthorized update authority', async () => {
    const payerKeypair = web3.Keypair.generate()
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payerKeypair.publicKey, 10 * web3.LAMPORTS_PER_SOL),
    )
    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))
    const { nft } = await metaplex.nfts().create({
      uri: 'uri',
      name: 'NFT',
      sellerFeeBasisPoints: 500,
    })
    const mint = nft.address

    try {
      await client.createZKPRequest({
        circuitMint: mint,
        serviceProviderCode: 'code',
      })
      assert.ok(false)
    } catch (e) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can create ZKP request', async () => {
    const { nft } = await metaplex.nfts().create({
      uri: 'uri',
      name: 'circuit',
      sellerFeeBasisPoints: 500,
    })
    mint = nft.address

    try {
      await client.createZKPRequest({
        circuitMint: mint,
        serviceProviderCode: 'code',
      })
    } catch (e) {
      console.log(e)
      throw e
    }

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)
    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(ZKPRequestData.serviceProvider.equals(serviceProviderAddress), true)
    assert.equal(ZKPRequestData.circuit.equals(mint), true)
    assert.equal(ZKPRequestData.owner.equals(payerKeypair.publicKey), true)
    assert.equal(ZKPRequestData.proof, null)
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can prove ZKP request', async () => {
    const { nft } = await metaplex.nfts().create({
      uri: 'uri',
      name: 'proof',
      sellerFeeBasisPoints: 500,
    })

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await client.prove({
        proofMetadata: nft.metadataAddress,
        zkpRequest: ZKPRequestAddress,
      })
    } catch (e) {
      console.log(e)
      throw e
    }

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal((ZKPRequestData.proof !== undefined), true)
    if (ZKPRequestData.proof) {
      assert.equal(ZKPRequestData.proof.equals(nft.address), true)
    }
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can verify ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await client.verify({
        zkpRequest: ZKPRequestAddress,
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  })

  it('can delete ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await client.deleteZKPRequest({
        zkpRequest: ZKPRequestAddress,
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  })

  it('can delete service provider', async () => {
    try {
      await client.deleteServiceProvider({
        code: 'code',
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  })
})

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}
