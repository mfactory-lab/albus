import { AlbusClient } from '@albus/sdk'
import * as beet from '@metaplex-foundation/beet'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import * as web3 from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { mintNFT, payerKeypair, provider } from './albus'

const TRANSFER_PROGRAM_ID = new web3.PublicKey('4goQchSHCB4zSa3vjn2NdjnWhYuzn3oYSbx1kVwwZdHS')

describe('verified transfer', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  it('can transfer SOL with albus verification check', async () => {
    await client.addServiceProvider({ code: 'code', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex)
    const mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMetadata: nft.metadataAddress,
      zkpRequest: ZKPRequestAddress,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const instruction = createTransferInstruction(
      {
        albus_program: TRANSFER_PROGRAM_ID,
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
    const nft = await mintNFT(metaplex)
    const mint = nft.address

    await client.createZKPRequest({
      circuitMint: mint,
      serviceProviderCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMetadata: nft.metadataAddress,
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
        albus_program: TRANSFER_PROGRAM_ID,
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
})

export interface TransferData {
  amount: beet.bignum
}

export const transferDataBeet
  = new beet.FixableBeetArgsStruct<TransferData>(
    [
      ['amount', beet.u64],
    ],
    'TransferData',
  )

export interface TransferInstructionArgs {
  data: TransferData
}

export const transferStruct = new beet.FixableBeetArgsStruct<
  TransferInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
  >(
    [
      ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
      ['data', transferDataBeet],
    ],
    'TransferInstructionArgs',
  )

export interface TransferInstructionAccounts {
  sender: web3.PublicKey
  receiver: web3.PublicKey
  zkp_request: web3.PublicKey
  albus_program: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const transferInstructionDiscriminator = [
  163, 52, 200, 231, 140, 3, 69, 186,
]

export function createTransferInstruction(
  accounts: TransferInstructionAccounts,
  args: TransferInstructionArgs,
  programId = TRANSFER_PROGRAM_ID,
) {
  const [data] = transferStruct.serialize({
    instructionDiscriminator: transferInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.sender,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.receiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.zkp_request,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.albus_program,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}

export interface SplTransferData {
  amount: beet.bignum
}

export const splTransferDataBeet
  = new beet.FixableBeetArgsStruct<SplTransferData>(
    [
      ['amount', beet.u64],
    ],
    'SPLTransferData',
  )

export interface SplTransferInstructionArgs {
  data: SplTransferData
}

export const splTransferStruct = new beet.FixableBeetArgsStruct<
  SplTransferInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
  >(
    [
      ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
      ['data', splTransferDataBeet],
    ],
    'SplTransferInstructionArgs',
  )

export interface SplTransferInstructionAccounts {
  sender: web3.PublicKey
  receiver: web3.PublicKey
  tokenMint: web3.PublicKey
  source: web3.PublicKey
  destination: web3.PublicKey
  zkp_request: web3.PublicKey
  albus_program: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const splTransferInstructionDiscriminator = [
  67, 186, 237, 99, 235, 243, 166, 198,
]

export function createSplTransferInstruction(
  accounts: SplTransferInstructionAccounts,
  args: SplTransferInstructionArgs,
  programId = TRANSFER_PROGRAM_ID,
) {
  const [data] = splTransferStruct.serialize({
    instructionDiscriminator: splTransferInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.sender,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.receiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.source,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.destination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.zkp_request,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.albus_program,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
