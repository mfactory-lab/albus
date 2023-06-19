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
import { Keypair, PublicKey } from '@solana/web3.js'
import { assert, beforeAll, describe, it, vi } from 'vitest'
import { AlbusClient, ProofRequestStatus } from '@albus/sdk'
import { airdrop, assertErrorCode, loadFixture, mintNFT, newProvider, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  const serviceCode = 'code'
  const circuits: Record<'a' | 'b' | 'c' | string, PublicKey> = {}

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
    circuits.a = (await mintNFT(metaplex, 'ALBUS-C')).address
    circuits.b = (await mintNFT(metaplex, 'ALBUS-C')).address
    // circuits.c = (await mintNFT(metaplex, 'ALBUS-C')).address
  })

  it('can add service provider', async () => {
    try {
      const data = { code: serviceCode, name: 'name' }
      const { address } = await client.manager.addServiceProvider(data)
      const serviceProvider = await client.loadServiceProvider(address)
      assert.equal(serviceProvider.authority.toString(), payerKeypair.publicKey.toString())
      assert.equal(serviceProvider.code, data.code)
      assert.equal(serviceProvider.name, data.name)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can not create proof request with invalid circuit', async () => {
    const newPayerKeypair = Keypair.generate()
    await airdrop(newPayerKeypair.publicKey)

    const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
    const circuit = await mintNFT(metaplex, 'ALBUS-C')

    try {
      await client.createProofRequest({ circuit: circuit.address, serviceCode })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can create proof request', async () => {
    const { address } = await client.createProofRequest({ circuit: circuits.a, serviceCode })
    const proofRequest = await client.loadProofRequest(address)
    assert.equal(proofRequest.circuit.toString(), circuits.a.toString())
    assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
    assert.equal(proofRequest.status, ProofRequestStatus.Pending)
    assert.equal(proofRequest.proof, null)
  })

  it('can not create proof request if already exists', async () => {
    try {
      await client.createProofRequest({ circuit: circuits.a, serviceCode })
      assert.ok(false)
    } catch (e: any) {
      assert.ok(e.message.includes('custom program error: 0x0'))
    }
  })

  it('can prove proof request', async () => {
    const { address } = await client.createProofRequest({ circuit: circuits.b, serviceCode })

    vi.spyOn(client, 'loadCircuit').mockReturnValue({
      // @ts-expect-error ...
      address: PublicKey.default,
      wasmUrl: loadFixture('age.wasm'),
      zkeyUrl: loadFixture('age.zkey'),
      input: ['birthDate', 'currentDate', 'minAge', 'maxAge'],
    })

    vi.spyOn(client, 'loadCredential').mockReturnValue({
      // @ts-expect-error ...
      address: PublicKey.default,
      credentialSubject: {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '2005-01-01',
      },
    })

    await client.prove({ proofRequest: address, vc: PublicKey.default })
    const proofRequest = await client.loadProofRequest(address)
    assert.equal(proofRequest.status, ProofRequestStatus.Proved)
  })

  it('can not verify proof request with unauthorized authority', async () => {
    const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
    const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.b, payerKeypair.publicKey)

    const newPayerKeypair = Keypair.generate()
    const newClient = new AlbusClient(newProvider(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)

    try {
      await newClient.manager.verify({ proofRequest: proofRequestAddr })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can not verify unproved proof request', async () => {
    const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
    const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)

    try {
      await client.manager.verify({ proofRequest: proofRequestAddr })
      assert.ok(false)
    } catch (e: any) {
      console.log(e)
      assertErrorCode(e, 'Unproved')
    }
  })

  it('can verify proof request', async () => {
    const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
    const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.b, payerKeypair.publicKey)
    await client.manager.verify({ proofRequest: proofRequestAddr })
    const proofRequest = await client.loadProofRequest(proofRequestAddr)
    assert.equal(proofRequest.status, ProofRequestStatus.Verified)
  })

  // it('can reject proof request', async () => {
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)
  //   await client.prove({ proofRequest: proofRequestAddr, proof: getProofMock() })
  //   await client.manager.reject({ proofRequest: proofRequestAddr })
  //   const proofRequest = await client.loadProofRequest(proofRequestAddr)
  //   assert.equal(proofRequest.status, ProofRequestStatus.Rejected)
  // })

  it('can delete proof request', async () => {
    const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
    const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)
    await client.deleteProofRequest({ proofRequest: proofRequestAddr })
  })

  it('can delete service provider', async () => {
    await client.manager.deleteServiceProvider({ code: serviceCode })
  })
})
