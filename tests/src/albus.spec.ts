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
import { Keypair } from '@solana/web3.js'
import type { PublicKey } from '@solana/web3.js'
import { assert, beforeAll, describe, it } from 'vitest'
import { AlbusClient, ZKPRequestStatus } from '@albus/sdk'
import { airdrop, assertErrorCode, mintNFT, newProvider, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  let mint: PublicKey

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  it('can add service provider', async () => {
    await client.addServiceProvider({ code: 'code', name: 'name' })
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(serviceProviderData.authority.equals(payerKeypair.publicKey), true)
    assert.equal(serviceProviderData.code, 'code')
    assert.equal(serviceProviderData.name, 'name')
    assert.equal(serviceProviderData.zkpRequestCount, 0)
  })

  it('can not create ZKP request with unauthorized update authority of circuit NFT metadata', async () => {
    const newPayerKeypair = Keypair.generate()
    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address
    try {
      await client.createZKPRequest({
        circuit: mint,
        serviceCode: 'code',
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can create ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    mint = nft.address

    try {
      await client.createZKPRequest({
        circuit: mint,
        serviceCode: 'code',
      })
    } catch (e) {
      console.log(e)
    }

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)
    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal(ZKPRequestData.serviceProvider.equals(serviceProviderAddress), true)
    assert.equal(ZKPRequestData.circuit.equals(mint), true)
    assert.equal(ZKPRequestData.owner.equals(payerKeypair.publicKey), true)
    assert.equal(ZKPRequestData.proof, null)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Pending)
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can not prove ZKP request with unauthorized update authority of proof NFT metadata', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const newPayerKeypair = Keypair.generate()
    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)
    const proofNft = await mintNFT(metaplex, 'ALBUS-P')

    try {
      await client.prove({
        proofMint: proofNft.address,
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can prove ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-P')
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMint: nft.address,
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    const serviceProviderData = await client.loadServiceProvider(serviceProviderAddress)
    assert.equal((ZKPRequestData.proof !== undefined), true)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Proved)
    if (ZKPRequestData.proof) {
      assert.equal(ZKPRequestData.proof.equals(nft.address), true)
    }
    assert.equal(serviceProviderData.zkpRequestCount, 1)
  })

  it('can not verify ZKP request with unauthorized authority', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    const newPayerKeypair = Keypair.generate()
    const provider = newProvider(newPayerKeypair)
    const newClient = new AlbusClient(provider)
    await airdrop(newPayerKeypair.publicKey)

    try {
      await newClient.verify({
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can not verify unproved ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-C')
    const mint = nft.address

    await client.createZKPRequest({
      circuit: mint,
      serviceCode: 'code',
    })

    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    try {
      await client.verify({
        zkpRequest: ZKPRequestAddress,
      })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unproved')
    }
  })

  it('can verify ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.verify({
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Verified)
  })

  it('can deny ZKP request', async () => {
    const nft = await mintNFT(metaplex, 'ALBUS-P')
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.prove({
      proofMint: nft.address,
      zkpRequest: ZKPRequestAddress,
    })

    await client.reject({
      zkpRequest: ZKPRequestAddress,
    })

    const ZKPRequestData = await client.loadZKPRequest(ZKPRequestAddress)
    assert.equal(ZKPRequestData.status, ZKPRequestStatus.Rejected)
  })

  it('can delete ZKP request', async () => {
    const [serviceProviderAddress] = client.getServiceProviderPDA('code')
    const [ZKPRequestAddress] = client.getZKPRequestPDA(serviceProviderAddress, mint, payerKeypair.publicKey)

    await client.deleteZKPRequest({
      zkpRequest: ZKPRequestAddress,
    })
  })

  it('can delete service provider', async () => {
    await client.deleteServiceProvider({
      code: 'code',
    })
  })
})