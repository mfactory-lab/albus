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
import { assert, beforeAll, describe, it } from 'vitest'
import {
  AlbusClient,
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
} from '../../packages/albus-sdk/src'
import { airdrop, netMetaplex, payerKeypair, provider } from './utils'

describe('Albus credential', () => {
  const client = new AlbusClient(provider)
  const mx = netMetaplex(payerKeypair)

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  let credentialMint: PublicKey

  it('can create credential', async () => {
    const { signature, mintAddress } = await client.credential.create()
    console.log(`signature ${signature}`)
    console.log(`mintAddress ${mintAddress}`)

    credentialMint = mintAddress

    const tokenWithMint = await mx.tokens().findTokenWithMintByMint({
      mint: mintAddress,
      address: payerKeypair.publicKey,
      addressType: 'owner',
    })

    assert.equal(String(tokenWithMint.delegateAddress), String(client.pda.authority()[0]))
    assert.equal(tokenWithMint.state, AccountState.Frozen)
  })

  it('can update credential', async () => {
    const data = {
      mint: credentialMint,
      uri: 'https://example.com',
      name: 'Test Credential',
    }
    await client.credential.update(data)

    const nft = await mx.nfts().findByMint({ mintAddress: credentialMint })
    assert.equal(nft.uri, data.uri)
    assert.equal(nft.name, data.name)
  })

  it('can revoke credential', async () => {
    await client.credential.revoke({
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
