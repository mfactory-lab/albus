import * as beet from '@metaplex-foundation/beet'
import type { Metaplex } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import type { PublicKeyInitData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { assert } from 'chai'

export const payerKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))

const opts = AnchorProvider.defaultOptions()

export function newProvider(payerKeypair: web3.Keypair) {
  return new AnchorProvider(
    new web3.Connection('http://localhost:8899', opts.preflightCommitment),
    new Wallet(payerKeypair),
    AnchorProvider.defaultOptions(),
  )
}

export const provider = newProvider(payerKeypair)

export async function mintNFT(metaplex: Metaplex, symbol: string) {
  const { nft } = await metaplex.nfts().create({
    uri: 'http://localhost/metadata.json',
    name: 'ALBUS NFT',
    symbol,
    sellerFeeBasisPoints: 500,
  })
  return nft
}

export async function airdrop(addr: PublicKeyInitData, amount = 10) {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(new PublicKey(addr), amount * web3.LAMPORTS_PER_SOL),
  )
}

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}

const TRANSFER_PROGRAM_ID = new web3.PublicKey('4goQchSHCB4zSa3vjn2NdjnWhYuzn3oYSbx1kVwwZdHS')

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

  return new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
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

  return new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
}
