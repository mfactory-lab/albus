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
import { assert, beforeAll, describe, it } from 'vitest'
import { AlbusClient } from '../../packages/albus-sdk/src'
import { airdrop, netMetaplex, payerKeypair, provider } from './utils'

describe('Albus credential', () => {
  const client = new AlbusClient(provider)

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  it('can create credential nft', async () => {
    const { signature, mintAddress } = await client.credential.create()
    console.log(`signature ${signature}`)
    console.log(`mintAddress ${mintAddress}`)

    const mx = netMetaplex(payerKeypair)

    const tokenWithMint = await mx.tokens().findTokenWithMintByMint({
      mint: mintAddress,
      address: payerKeypair.publicKey,
      addressType: 'owner',
    })

    assert.equal(String(tokenWithMint.delegateAddress), String(client.pda.authority()[0]))
    assert.equal(tokenWithMint.state, AccountState.Frozen)

    // const nftByOwner = await mx.nfts().findAllByOwner({ owner: payerKeypair.publicKey })
    // console.log(nftByOwner)

    // const nft = await mx.nfts().findByMint({ mintAddress })
    // console.log(nft)
  })
})
