import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { web3 } from '@project-serum/anchor'
import { assert } from 'chai'
import { AlbusClient, ZKPRequestStatus } from '@albus/sdk'
import { airdrop, assertErrorCode, mintNFT, newProvider, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  let mint: web3.PublicKey

  before(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  it('can add service provider', async () => {
    await client.addServiceProvider({ code: 'code', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(serviceProviderData.authority.equals(payerKeypair.publicKey), true)
    assert.equal(serviceProviderData.code, 'code')
    assert.equal(serviceProviderData.name, 'name')
    assert.equal(serviceProviderData.zkpRequestCount, 0)
  })

  it('can not create ZKP request with unauthorized update authority of circuit NFT metadata', async () => {
    const newPayerKeypair = web3.Keypair.generate()
    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address
    try {
      await client.createZKPRequest({
        circuit: mint,
        serviceCode: 'code',
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can create ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    mint = nft.address

    try {
      await client.createZKPRequest({
        circuit: mint,
        serviceCode: 'code',
      })
    } catch (e) {
      console.log(e)
    }

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)
    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(ZKPRequestData.serviceProvider.equals(serviceProviderAddress), true)
    assert.equal(ZKPRequestData.circuit.equals(mint), true)
    assert.equal(ZKPRequestData.owner.equals(payerKeypair.publicKey), true)
    assert.equal(ZKPRequestData.proof, null)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Pending)
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can not prove ZKP request with unauthorized update authority of proof NFT metadata', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const newPayerKeypair = web3.Keypair.generate()
    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)
    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    try {
      await client.prove({
        proofMint: proofNft.address,
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can prove ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-P')
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMint: nft.address,
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal((ZKPRequestData.proof !== undefined), true)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Proved)
    if (ZKPRequestData.proof) {
      assert.equal(ZKPRequestData.proof.equals(nft.address), true)
    }
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can not verify ZKP request with unauthorized authority', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const newPayerKeypair = web3.Keypair.generate()
    const provider = newProvider(newPayerKeypair)
    const newClient = new AlbusClient(provider)
    await airdrop(newPayerKeypair.publicKey)

    try {
      await newClient.verify({
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can not verify unproved ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code',
    })

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await client.verify({
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unproved')
    }
  })

  it('can verify ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Verified)
  })

  it('can deny ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-P')
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMint: nft.address,
      zkpRequest: ZKPRequestAddress,
    })

    await client.reject({
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Rejected)
  })

  it('can delete ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.deleteZKPRequest({
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can delete service provider', async () => {
    await client.deleteServiceProvider({
      code: 'code',
    })
  })
})
