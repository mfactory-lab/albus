import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { assert } from 'chai'
import { AlbusClient } from '@albus/sdk'
import { assertErrorCode, createSplTransferInstruction, createTransferInstruction, mintNFT, payerKeypair, provider } from './utils'

describe('verified transfer', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  it('can transfer SOL with albus verification check', async () => {
    await client.addServiceProvider({ code: 'code', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      proofMetadata: proofNft.metadataAddress,
      zkpRequest: ZKPRequestAddress,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const instruction = createTransferInstruction(
      {
        albus_program: client.programId,
        receiver: payerKeypair.publicKey,
        sender: payerKeypair.publicKey,
        zkp_request: ZKPRequestAddress,
      },
      {
        data: {
          amount: 100,
        },
      },
    )

    const tx = new web3.Transaction().add(instruction)

    try {
      await provider.sendAndConfirm(tx, [])
    } catch (e: any) {
      console.log(e)
      throw e
    }
  })

  it('can transfer tokens with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      proofMetadata: proofNft.metadataAddress,
      zkpRequest: ZKPRequestAddress,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const tokenMint = await createMint(provider.connection, payerKeypair, payerKeypair.publicKey, null, 9, web3.Keypair.generate(), undefined, TOKEN_PROGRAM_ID)
    const source = await getOrCreateAssociatedTokenAccount(provider.connection, payerKeypair, tokenMint, payerKeypair.publicKey)
    await mintTo(provider.connection, payerKeypair, tokenMint, source.address, payerKeypair.publicKey, 100)

    const instruction = createSplTransferInstruction(
      {
        albus_program: client.programId,
        destination: source.address,
        receiver: payerKeypair.publicKey,
        sender: payerKeypair.publicKey,
        source: source.address,
        tokenMint,
        zkp_request: ZKPRequestAddress,
      },
      {
        data: {
          amount: 100,
        },
      },
    )

    const tx = new web3.Transaction().add(instruction)

    try {
      await provider.sendAndConfirm(tx, [])
    } catch (e: any) {
      console.log(e)
      throw e
    }
  })

  it('can not transfer with albus verification check if ZKP request is not verified', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      proofMetadata: proofNft.metadataAddress,
      zkpRequest: ZKPRequestAddress,
    })

    const instruction = createTransferInstruction(
      {
        albus_program: client.programId,
        receiver: payerKeypair.publicKey,
        sender: payerKeypair.publicKey,
        zkp_request: ZKPRequestAddress,
      },
      {
        data: {
          amount: 100,
        },
      },
    )

    const tx = new web3.Transaction().add(instruction)

    try {
      await provider.sendAndConfirm(tx, [])
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unverified')
    }
  })
})
