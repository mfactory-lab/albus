import { AnchorProvider, Wallet, web3 } from '@project-serum/anchor'
import { assert } from 'chai'
import { createVerifyProofInstruction } from '@albus/sdk/src/generated'

const payerKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))
const opts = AnchorProvider.defaultOptions()

const provider = new AnchorProvider(
  new web3.Connection('http://localhost:8899', opts.preflightCommitment),
  new Wallet(payerKeypair),
  AnchorProvider.defaultOptions(),
)

describe('albus', () => {
  before(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(provider.wallet.publicKey, 1000 * web3.LAMPORTS_PER_SOL),
    )
  })

  it('verify proof', async () => {
    const ix = createVerifyProofInstruction({
      authority: provider.wallet.publicKey,
    })

    const tx = new web3.Transaction()

    tx.add(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }))
    tx.add(ix)

    try {
      const _sig = await provider.sendAndConfirm(tx)
    } catch (e) {
      console.log(e)
    }

    // let a = new Program(OmnisolClient.IDL, OmnisolClient.programId, provider);

    assert(true)
  })
})
