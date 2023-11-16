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
import { Keypair } from '@solana/web3.js'
import type { PublicKey } from '@solana/web3.js'
import axios from 'axios'

import { assert, beforeAll, describe, it, vi } from 'vitest'
import * as Albus from '../../packages/albus-core'
import { generateDid } from '../../packages/albus-core/src/utils'
import {
  AlbusClient,
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
} from '../../packages/albus-sdk/src'
import { airdrop, netMetaplex, newProvider, payer, provider } from './utils'

describe('albusCredential', async () => {
  const issuer = Keypair.generate()
  const holder = Keypair.generate()

  const client = new AlbusClient(provider)
  const holderClient = new AlbusClient(newProvider(holder))
  const mx = netMetaplex(payer)

  const updateAuthority = client.pda.authority()[0]

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

  console.log(`Payer: ${payer.publicKey}`)
  console.log(`Holder: ${holder.publicKey}`)
  console.log(`UpdateAuthority: ${updateAuthority}`)

  beforeAll(async () => {
    await airdrop(payer.publicKey)
    await airdrop(holder.publicKey)
    await airdrop(updateAuthority)
  })

  let credentialMint: PublicKey

  const resolver: any = {
    resolve() {
      return { didDocument: generateDid(issuer) } as any
    },
  }

  it('can create credential', async () => {
    const { signature, mintAddress } = await holderClient.credential.create()
    console.log(`signature ${signature}`)
    console.log(`mintAddress ${mintAddress}`)

    credentialMint = mintAddress

    const nft = await mx.nfts().findByMint({ mintAddress })

    assert.equal(String(nft.updateAuthorityAddress), String(updateAuthority))

    const tokenWithMint = await mx.tokens().findTokenWithMintByMint({
      mint: mintAddress,
      address: holderClient.provider.publicKey,
      addressType: 'owner',
    })

    assert.equal(String(tokenWithMint.delegateAddress), String(updateAuthority))
    assert.equal(tokenWithMint.state, AccountState.Frozen)
  })

  it('can update credential', async () => {
    const data = {
      mint: credentialMint,
      owner: holder.publicKey,
      uri: 'https://credential.json',
      name: 'Test Credential',
    }
    await client.credential.update(data)
    const nft = await mx.nfts().findByMint({ mintAddress: credentialMint })
    assert.equal(nft.uri, data.uri)
    assert.equal(nft.name, data.name)
  })

  it('can load credential', async () => {
    vi.spyOn(axios, 'get')
      .mockImplementationOnce(async (uri) => {
        switch (uri) {
          case 'https://credential.json':
            return {
              status: 200,
              data: credential,
            }
        }
      })

    const vc = await holderClient.credential.load(credentialMint, { resolver })

    assert.deepEqual(vc, credential.vc)
  })

  it('can load all credentials', async () => {
    vi.spyOn(axios, 'get')
      .mockImplementationOnce(async (uri) => {
        switch (uri) {
          case 'https://credential.json':
            return {
              status: 200,
              data: credential,
            }
        }
      })

    const vc = await holderClient.credential.loadAll({ resolver })

    assert.equal(vc.length, 1)
    assert.deepEqual(vc[0]?.credential, credential.vc)
  })

  it('can revoke credential', async () => {
    await holderClient.credential.revoke({
      mint: credentialMint,
    })

    const token = getAssociatedTokenAddress(credentialMint, client.provider.publicKey)

    // Then the NFT accounts no longer exist.
    const accounts = await mx
      .rpc()
      .getMultipleAccounts([
        credentialMint,
        token,
        getMetadataPDA(credentialMint),
        getMasterEditionPDA(credentialMint),
      ])

    assert.equal(accounts[0]?.exists, true, 'mint account still exists because of SPL Token')
    assert.equal(accounts[1]?.exists, false, 'token account no longer exists')
    // assert.equal(accounts[2]?.exists, false, 'metadata account no longer exists')
    assert.equal(accounts[3]?.exists, false, 'edition account no longer exists')
  })
})
