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

import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'

import { afterAll, assert, beforeAll, describe, it } from 'vitest'
import { AlbusClient } from '../../packages/albus-sdk/src'
import {
  assertErrorCode, assertErrorMessage,
  initMetaplex,
  initProvider,
  payer,
  provider,
  requestAirdrop,
} from './utils'

describe('credentialRequest', async () => {
  const issuer = Keypair.generate()
  const holder = Keypair.generate()

  const adminClient = new AlbusClient(provider).local()
  const holderClient = new AlbusClient(initProvider(holder)).local()
  const issuerClient = new AlbusClient(initProvider(issuer)).local()
  const mx = initMetaplex(payer)

  const specCode = 'AML'

  let mintAddress: PublicKey
  let issuerAddress: PublicKey

  beforeAll(async () => {
    await requestAirdrop(payer.publicKey)
    await requestAirdrop(issuer.publicKey)
    await requestAirdrop(holder.publicKey)

    const { address } = await adminClient.issuer.create({
      code: 'aml-issuer',
      name: 'aml-issuer',
      signer: issuer,
      authority: issuer.publicKey,
    })
    issuerAddress = address
  }, 20000)

  afterAll(async () => {
    await adminClient.issuer.delete({
      issuer: issuerAddress,
    })
  })

  it('should create a credential spec for the issuer', async () => {
    const { signature } = await issuerClient.credentialSpec.create({
      code: specCode,
      issuer: issuerAddress,
      uri: 'https://pdefinition.json',
    })
    assert.ok(!!signature)
  })

  it('should not allow to create a spec if is not authorized issuer', async () => {
    try {
      await holderClient.credentialSpec.create({
        code: 'test',
        issuer: issuerAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('should allow requesting a credential', async () => {
    const { mintAddress: address } = await holderClient.credential.create({ issuer: issuerAddress })
    mintAddress = address
    const { signature } = await holderClient.credentialRequest.create({
      mint: mintAddress,
      issuer: issuerAddress,
      specCode,
      uri: 'https://presentation.json',
    })
    assert.ok(!!signature)
  })

  it('should not allow requesting a credential with unauthorized credentials', async () => {
    const { nft } = await mx
      .nfts()
      .create({
        uri: 'https://test.json',
        name: 'Dummy NFT',
        sellerFeeBasisPoints: 0,
        symbol: `ALBUS-DC`,
        tokenOwner: holder.publicKey,
      })

    try {
      await holderClient.credentialRequest.create({
        mint: nft.mint.address,
        issuer: issuerAddress,
        specCode,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorMessage(e, 'Invalid authority type')
    }
  })

  it('should allow the issuer to update a credential', async () => {
    const [credentialSpec] = issuerClient.pda.credentialSpec(issuerAddress, specCode)
    const [credentialRequest] = issuerClient.pda.credentialRequest(credentialSpec, holder.publicKey)

    const data = {
      credentialRequest,
      uri: 'https://credential.json',
    }

    const { signature } = await issuerClient.credential.update(data)
    assert.ok(!!signature)

    const nft = await mx.nfts().findByMint({ mintAddress })
    assert.equal(data.uri, nft.uri)
  })

  it('should not allow the holder to update a credential', async () => {
    const [credentialSpec] = issuerClient.pda.credentialSpec(issuerAddress, specCode)
    const [credentialRequest] = issuerClient.pda.credentialRequest(credentialSpec, holder.publicKey)
    try {
      await holderClient.credential.update({
        credentialRequest,
        uri: 'https://credential.json',
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('should not allow the issuer to delete a credential request', async () => {
    const [credentialSpec] = issuerClient.pda.credentialSpec(issuerAddress, specCode)
    const [credentialRequest] = issuerClient.pda.credentialRequest(credentialSpec, holder.publicKey)

    try {
      await issuerClient.credentialRequest.delete({
        credentialRequest,
      })
      assert.ok(false)
    } catch (e: any) {
      // console.log(e)
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('should allow the holder to delete a credential request', async () => {
    const [credentialSpec] = issuerClient.pda.credentialSpec(issuerAddress, specCode)
    const [credentialRequest] = issuerClient.pda.credentialRequest(credentialSpec, holder.publicKey)

    const { signature } = await holderClient.credentialRequest.delete({
      credentialRequest,
    })
    assert.ok(!!signature)
  })

  it('should allow the issuer to delete a credential spec', async () => {
    const { signature } = await issuerClient.credentialSpec.delete({
      code: specCode,
      issuer: issuerAddress,
    })
    assert.ok(!!signature)
  })
})
