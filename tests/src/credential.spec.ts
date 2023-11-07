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
import {
  AlbusClient,
  getAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataPDA,
} from '../../packages/albus-sdk/src'
import { airdrop, netMetaplex, newProvider, payer, provider } from './utils'

const credential = {
  name: 'ALBUS Digital Credential',
  image: 'https://arweave.net/-RX1vgX0qdH-IdhovS0KuJCtqC1Eh3uM9UfSZBBZVVE',
  external_url: 'https://albus.finance',
  vc: {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    'type': ['VerifiableCredential', 'AlbusCredential', 'Passport'],
    'issuer': 'did:web:issuer.albus.finance:fake',
    'issuanceDate': '2023-10-26T21:05:10.470Z',
    'credentialSubject': {
      encryptionKey: 'CwsF2xtpVkSizj8E3aNfj4L6sfVmuhk1Ewv58iTRF3Lb',
      encrypted: 'Y4QBctqBZHgsr6LdydlB/fgPG87q2YXJYA6Kvu6NQB1MM8k4TUKHUnSf/eoMZJdzNwzDKJ54SKGxc3z3PXFrSH5OmOpk+BM1ssqk1/kLG6Rlxv8rSSFipOmT4lhJ5ovCP5q4XEhcpds++ffLVPQM38u5fNEjm8wBOJOuTGaiE2d4o22etMflgmDu6Xxicgh/NsMdjLT5rp/b/rGfhQFGyVboUB6yUD2eVolNG55h150zHvcpXuXIZzvkyGLQ6knQXmZD10iEanLco2iF1o30PCTCK/Lk+/VfIeyMNqcnCHKhTJwukPz8QVNdmCcSKWI=',
    },
    'proof': { type: 'BJJSignature2021', created: 1698354310758, verificationMethod: 'did:web:issuer.albus.finance:fake#eddsa-bjj', rootHash: '8418696509132575644783365087890757754482467717073743620809994498242667101387', proofValue: { ax: '12279242631152480922448440387665898145185461262650789258320537467533451473248', ay: '562652728416453518865033172714223342104200904426339863473937692826883086980', r8x: '20215271862370783154637155562451401714868816530380434349250343595863447538890', r8y: '13679675971479620294460361170758237082770683984891545014480931165078200499192', s: '49356083573453035125553711262287700869914163322839993196255457345136248925' }, proofPurpose: 'assertionMethod' },
  },
}
// decryptionKey: ["expose","excuse","beef","left","cradle","bean","awesome","draw","curtain","like","boring","patch"]

describe('albusCredential', () => {
  const holder = Keypair.generate()

  const client = new AlbusClient(provider)
  const holderClient = new AlbusClient(newProvider(holder))
  const mx = netMetaplex(payer)

  const updateAuthority = client.pda.authority()[0]

  console.log(`Payer: ${payer.publicKey}`)
  console.log(`Holder: ${holder.publicKey}`)
  console.log(`UpdateAuthority: ${updateAuthority}`)

  beforeAll(async () => {
    await airdrop(payer.publicKey)
    await airdrop(holder.publicKey)
    await airdrop(updateAuthority)
  })

  let credentialMint: PublicKey

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

    const vc = await holderClient.credential.load(credentialMint)

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

    const vc = await holderClient.credential.loadAll()

    console.log(vc)

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
