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
import { airdrop, netMetaplex, newProvider, payerKeypair, provider } from './utils'

const credential = {
  name: 'ALBUS Verifiable Credential',
  image: 'https://arweave.net/hcbme7qK8G-aos2akxPub-nm7XGNaZ0Tr-sh7syqWxk',
  external_url: 'https://albus.finance',
  vc: {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
    ],
    'type': [
      'VerifiableCredential',
      'AlbusCredential',
    ],
    'issuer': 'did:web:issuer.albus.finance:fake',
    'issuanceDate': '2023-10-02T18:59:11.425Z',
    'credentialSubject': {
      encrypted: 'W5xvhgbJDiEaFYwJaS+OR5kYfZ957CxXoqsdsZc9lSgRYh36+X4ee//t1ZEtfeiDsycY//rNPZCzmWT1csfhzL3q3v9DXmM5RFDvSWpMJ9PBYUGnDcA6VL9vDpc9rhVbqnT5+RaPSO/KBZkr3r4Hj5N27WdBQCWVTD53l8F0iWM0rZqex7Vq/JILOV6JRAeqfOpNzOloOfeu3nGHcvavra55UBGxQpy8IUzynHMneEpMkflRJGyeboQVRt0xxt7lzNTujukvl7z809OmoU6qqkg4NamQxeLgaZBgJ6OsGGtWkn/Vk2GtyWSkLJwBErANMvdzYg==',
    },
    'proof': {
      type: 'BJJSignature2021',
      created: 1696273151721,
      verificationMethod: 'did:web:issuer.albus.finance:fake#eddsa-bjj',
      rootHash: '13734296669612465157065630684375000547574498367020126210327710078244046279320',
      proofValue: {
        ax: '17281608414500272942926857538904179701981623683161575728981126685887789130748',
        ay: '15375967852937051010384309239440519791525886180615377470153101980457579998366',
        r8x: '13752946170795660522212744808413559627947178088732602814020765250952213206748',
        r8y: '438153240054645829900098164755628400290372863044956388237821033323841734115',
        s: '2349542200687397301602429863181401276929629554567127558810400042014053165114',
      },
      proofPurpose: 'assertionMethod',
    },
  },
}

describe('Albus credential', () => {
  const holder = Keypair.generate()

  const client = new AlbusClient(provider)
  const holderClient = new AlbusClient(newProvider(holder))
  const mx = netMetaplex(payerKeypair)

  const updateAuthority = client.pda.authority()[0]

  console.log(`Payer: ${payerKeypair.publicKey}`)
  console.log(`Holder: ${holder.publicKey}`)
  console.log(`UpdateAuthority: ${updateAuthority}`)

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
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
