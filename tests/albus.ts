import { AlbusClient, ZKPRequestStatus } from '@albus/sdk'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import type { PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { assert } from 'chai'

const payerKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))
const opts = AnchorProvider.defaultOptions()

function newProvider(payerKeypair: web3.Keypair) {
  return new AnchorProvider(
    new web3.Connection('http://localhost:8899', opts.preflightCommitment),
    new Wallet(payerKeypair),
    AnchorProvider.defaultOptions(),
  )
}

const provider = newProvider(payerKeypair)

async function mintNFT(metaplex: Metaplex) {
  const { nft } = await metaplex.nfts().create({
    uri: 'http://localhost/metadata.json',
    name: 'ALBUS NFT',
    symbol: 'ALBUS',
    sellerFeeBasisPoints: 500,
  })
  return nft
}

async function airdrop(addr: PublicKeyInitData, amount = 10) {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(new PublicKey(addr), amount * web3.LAMPORTS_PER_SOL),
  )
}

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
    const nft = await mintNFT(metaplex)
    const mint = nft.address
    try {
      await client.createZKPRequest({
        circuitMint: mint,
        serviceProviderCode: 'code',
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can create ZKP request', async () => {
    const nft = await mintNFT(metaplex)
    mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

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
    const proofNft = await mintNFT(metaplex)

    try {
      await client.prove({
        proofMetadata: proofNft.metadataAddress,
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can prove ZKP request', async () => {
    const nft = await mintNFT(metaplex)
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMetadata: nft.metadataAddress,
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal((ZKPRequestData.proof !== undefined), true)
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

  it('can verify ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })
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

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}
