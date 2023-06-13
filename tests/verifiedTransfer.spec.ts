/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { AlbusClient } from '@albus/sdk'
import { VerifiedTransferClient } from '@albus/verified-transfer-sdk'
import { assert, describe, it } from 'vitest'
import { assertErrorCode, mintNFT, payerKeypair, provider } from './utils'

describe('verified transfer', () => {
  const client = new AlbusClient(provider)
  const verifiedTransferClient = new VerifiedTransferClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  it('can transfer SOL with albus verification check', async () => {
    await client.addServiceProvider({ code: 'code', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    await verifiedTransferClient.transfer({
      amount: new BN(100),
      receiver: payerKeypair.publicKey,
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can transfer tokens with albus verification check', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    await client.prove({
      zkpRequest: ZKPRequestAddress,
      proofMint: proofNft.address,
    })

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const tokenMint = await createMint(provider.connection, payerKeypair, payerKeypair.publicKey, null, 9, web3.Keypair.generate(), undefined, TOKEN_PROGRAM_ID)
    const source = await getOrCreateAssociatedTokenAccount(provider.connection, payerKeypair, tokenMint, payerKeypair.publicKey)
    await mintTo(provider.connection, payerKeypair, tokenMint, source.address, payerKeypair.publicKey, 100)

    await verifiedTransferClient.splTransfer({
      destination: source.address,
      source: source.address,
      tokenMint,
      amount: new BN(100),
      receiver: payerKeypair.publicKey,
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can not transfer with albus verification check if ZKP request is not verified', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code',
    })

    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await verifiedTransferClient.transfer({
        amount: new BN(100),
        receiver: payerKeypair.publicKey,
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Custom(3)')
    }
  })
})
