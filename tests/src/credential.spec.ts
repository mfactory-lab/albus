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

import { AccountState } from '@solana/spl-token'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'

import { assert, beforeAll, describe, it, vi } from 'vitest'
import {
  AlbusClient,
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
} from '../../packages/albus-sdk/src'
import * as Albus from '../../packages/albus-core/src'
import * as sdkUtils from '../../packages/albus-sdk/src/utils'
import { assertErrorMessage, initMetaplex, initProvider, payer, provider, requestAirdrop } from './utils'

describe('albusCredential', async () => {
  const issuer = Keypair.generate()
  const holder = Keypair.generate()

  const client = new AlbusClient(provider).local()
  const holderClient = new AlbusClient(initProvider(holder)).local()
  const mx = initMetaplex(payer)

  const updateAuthority = client.pda.authority()[0]

  const CREDENTIAL_MOCK_URI = 'https://credential.json'

  const credential = {
    name: 'ALBUS Digital Credential',
    image: 'https://arweave.net/-RX1vgX0qdH-IdhovS0KuJCtqC1Eh3uM9UfSZBBZVVE',
    external_url: 'https://albus.finance',
    vc: await Albus.credential.createVerifiableCredential({
      name: 'test',
    }, {
      issuerSecretKey: issuer.secretKey,
    }),
  }

  beforeAll(async () => {
    await requestAirdrop(payer.publicKey)
    await requestAirdrop(holder.publicKey)
    // await requestAirdrop(updateAuthority)

    console.log(`Payer ${payer.publicKey}`)
    console.log(`Issuer ${issuer.publicKey}`)
    console.log(`Holder ${holder.publicKey}`)

    vi.spyOn(sdkUtils, 'loadNft')
      .mockImplementation(async (c, m) => {
        const metadata = await sdkUtils.getMetadataByMint(c, m, false)
        metadata!.json = credential
        return metadata as sdkUtils.ExtendedMetadata
      })
  })

  let credentialMint: PublicKey

  const resolver: any = {
    resolve() {
      return { didDocument: Albus.utils.generateDid(issuer) } as any
    },
  }

  it('should not create credential with empty balances', async () => {
    const client = new AlbusClient(initProvider(Keypair.generate())).local()
    try {
      await client.credential.create({}, { feePayer: payer })
      assert.ok(false)
    } catch (e: any) {
      // insufficient lamports 0, need 15616720
      assertErrorMessage(e, 'insufficient lamports 0')
    }
  })

  async function assertValidNft(mintAddress: PublicKey, owner: PublicKey) {
    const nft = await mx.nfts().findByMint({ mintAddress })
    assert.equal(String(nft.updateAuthorityAddress), String(updateAuthority))

    const tokenWithMint = await mx.tokens().findTokenWithMintByMint({
      mint: mintAddress,
      address: owner,
      addressType: 'owner',
    })

    assert.equal(String(tokenWithMint.delegateAddress), String(updateAuthority))
    assert.equal(tokenWithMint.state, AccountState.Frozen)
    assert.equal(tokenWithMint.amount.basisPoints.toNumber(), 1)
    return tokenWithMint
  }

  it('should create a credential with holder', async () => {
    const { mintAddress } = await holderClient.credential.create()
    credentialMint = mintAddress
    await assertValidNft(mintAddress, holderClient.provider.publicKey)
  })

  it('should manage credential with custom owner: updates credential URI and deletes credential', async () => {
    const owner = Keypair.generate()
    const { mintAddress } = await holderClient.credential.create({ owner })
    await assertValidNft(mintAddress, owner.publicKey)
    await client.credential.update({
      mint: mintAddress,
      uri: CREDENTIAL_MOCK_URI,
    })
    await holderClient.credential.delete({ mint: mintAddress, owner })
  })

  it('should update a credential', async () => {
    const data = {
      mint: credentialMint,
      owner: holder.publicKey,
      uri: CREDENTIAL_MOCK_URI,
    }
    await client.credential.update(data)
    const nft = await mx.nfts().findByMint({ mintAddress: credentialMint })
    assert.equal(nft.uri, data.uri)
  })

  it('should load a credential', async () => {
    const vc = await holderClient.credential.load(credentialMint, { throwOnError: true, resolver })
    assert.deepEqual(vc, credential.vc)
  })

  // TODO: mock
  // it('should load all credentials', async () => {
  //   const vc = await holderClient.credential.loadAll({ resolver })
  //   assert.equal(vc.length, 1)
  //   assert.deepEqual(vc[0]?.credential, credential.vc)
  // })

  it('should delete credential', async () => {
    const { signature } = await holderClient.credential.delete({ mint: credentialMint })
    const token = getAssociatedTokenAddress(credentialMint, client.provider.publicKey)

    const tx = await client.provider.connection.getParsedTransaction(signature)
    const balances = {}
    for (let i = 0; i < tx.transaction.message.accountKeys.length; i++) {
      const acc = tx.transaction.message.accountKeys[i]
      balances[acc.pubkey.toBase58()] = {
        pre: tx.meta.preBalances[i],
        post: tx.meta.postBalances[i],
      }
    }

    // Then the NFT accounts no longer exist.
    const accounts = await mx
      .rpc()
      .getMultipleAccounts([
        credentialMint,
        token,
        getMetadataPDA(credentialMint),
        getMasterEditionPDA(credentialMint),
      ])

    // {
    //   GVEBaeAT5DooHHoKgopT6gS5Jzz8qsMchZEhxTp8Ap83: { pre: 99956022600, post: 99966527200 },
    //   '5RpgxgE6ZxzKNJ8XePXWLZ8zvZoRqTZf3iP2C9a7TLWZ': { pre: 2853600, post: 0 },
    //   '5rxgvnYPCZQ96LdFa52BfjLNsZFDfKayBJQxbpTEiZWb': { pre: 2039280, post: 0 },
    //   '8N8eXhpv67PxUinZzheX42KKv2qNUrqZs8aD6D5AciRP': { pre: 1461600, post: 1461600 },
    //   HH5TcLDSEWCP6irvvSZzpjBoYKDSpgeq3t7HkMFwAdi8: { pre: 0, post: 0 },
    //   HpgAiSsNV7iTz89bnkeKrbnobKxBtpjpif21mr6M4yUk: { pre: 15616720, post: 10000000 },
    //   '11111111111111111111111111111111': { pre: 1, post: 1 },
    //   ALBSoqJrZeZZ423xWme5nozNcozCtMvDWTZZmQLMT3fp: { pre: 1141440, post: 1141440 },
    //   metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: { pre: 1141440, post: 1141440 },
    //   Sysvar1nstructions1111111111111111111111111: { pre: 0, post: 0 },
    //   TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: { pre: 929020800, post: 929020800 }
    // }

    assert.ok(balances[holder.publicKey.toBase58()].post > balances[holder.publicKey.toBase58()].pre)
    // assert.ok(postBalance > preBalance, 'holder received rent fee')
    assert.equal(accounts[0]?.exists, true, 'mint account still exists because of SPL Token')
    assert.equal(accounts[1]?.exists, false, 'token account no longer exists')
    // assert.equal(accounts[2]?.exists, false, 'metadata account no longer exists')
    assert.equal(accounts[3]?.exists, false, 'edition account no longer exists')
  })
})
