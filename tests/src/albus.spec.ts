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

import { PublicKey } from '@solana/web3.js'
import { assert, beforeAll, describe, it } from 'vitest'
import { AlbusClient, ProofRequestStatus } from '../../packages/albus-sdk/src'
import { airdrop, loadFixture, mockedProve, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  // const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  const serviceCode = 'acme'
  let circuitAddress: PublicKey

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  it('can create circuit', async () => {
    try {
      const data = {
        privateSignals: [
          'birthDate',
        ],
        publicSignals: [
          'currentDate', 'minAge', 'maxAge',
          'credentialRoot', 'credentialProof[10]', 'credentialKey',
          'issuerPk[2]', 'issuerSignature[3]',
        ],
        wasmUri: 'mock:wasmUri',
        zkeyUri: 'mock:zkeyUri',
        code: 'age',
        name: 'Age policy',
      }
      const { signature, address } = await client.circuit.create(data)
      circuitAddress = address
      console.log('signature', signature)
      console.log('circuitAddress', circuitAddress)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can update circuit vk', async () => {
    const vk = JSON.parse(loadFixture('agePolicy.vk.json').toString())
    try {
      const data = { code: 'age', vk }
      const { signatures } = await client.circuit.updateVk(data)
      console.log('signatures', signatures)
      const circuit = await client.circuit.loadById(data.code)

      assert.equal(circuit.vk.alpha.length, 64)
      assert.equal(circuit.vk.beta.length, 128)
      assert.equal(circuit.vk.gamma.length, 128)
      assert.equal(circuit.vk.delta.length, 128)
      // assert.equal(circuit.vk.ic.length, 17)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can add service provider', async () => {
    try {
      const data = { code: serviceCode, name: 'name' }
      const { address } = await client.service.create(data)
      const service = await client.service.load(address)
      assert.equal(service.authority.toString(), payerKeypair.publicKey.toString())
      assert.equal(service.code, data.code)
      assert.equal(service.name, data.name)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create policy', async () => {
    try {
      const data = {
        serviceCode,
        circuitCode: 'age',
        name: 'Age policy 18+',
        description: 'Test policy',
        expiresIn: 0,
        rules: [
          { index: 1, value: client.utils.normalizePublicInput(18) },
          { index: 2, value: client.utils.normalizePublicInput(100) },
        ], // {}
      }
      const { signature } = await client.policy.create(data)
      console.log('signature', signature)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create proof request', async () => {
    const { address } = await client.proofRequest.create({ circuitId: 'age', serviceId: serviceCode })
    const proofRequest = await client.proofRequest.load(address)
    assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
    assert.equal(proofRequest.status, ProofRequestStatus.Pending)
  })

  it('can prove proof request', async () => {
    const [circuit] = client.pda.circuit('age')
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(circuit, service)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)

    await mockedProve(client, proofRequest)

    const { signature } = await client.prove({
      exposedFields: [],
      proofRequest,
      vc: PublicKey.default,
      // decryptionKey?: PrivateKey
      // force?: boolean
    })
    // console.log('signature', signature)
    // const proofRequest = await client.proofRequest.load(address)
    // assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
    // assert.equal(proofRequest.status, ProofRequestStatus.Pending)
  })

  // it('can not create proof request with invalid circuit', async () => {
  //   const newPayerKeypair = Keypair.generate()
  //   await airdrop(newPayerKeypair.publicKey)
  //
  //   const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(newPayerKeypair))
  //   const circuit = await mintNFT(metaplex, 'ALBUS-C')
  //
  //   try {
  //     await client.createProofRequest({ circuit: circuit.address, serviceCode })
  //     assert.ok(false)
  //   } catch (e: any) {
  //     assertErrorCode(e, 'Unauthorized')
  //   }
  // })
  //
  // it('can create proof request', async () => {
  //   const { address } = await client.createProofRequest({ circuit: circuits.a, serviceCode })
  //   const proofRequest = await client.loadProofRequest(address)
  //   assert.equal(proofRequest.circuit.toString(), circuits.a?.toString())
  //   assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
  //   assert.equal(proofRequest.status, ProofRequestStatus.Pending)
  //   assert.equal(proofRequest.proof, null)
  // })
  //
  // it('can not create proof request if already exists', async () => {
  //   try {
  //     await client.createProofRequest({ circuit: circuits.a, serviceCode })
  //     assert.ok(false)
  //   } catch (e: any) {
  //     assert.ok(e.message.includes('custom program error: 0x0'))
  //   }
  // })
  //
  // it('can prove proof request', async () => {
  //   const { address } = await client.createProofRequest({ circuit: circuits.b, serviceCode })
  //   await mockedProve(client, address)
  //   const proofRequest = await client.loadProofRequest(address)
  //   assert.equal(proofRequest.status, ProofRequestStatus.Proved)
  // })
  //
  // it('can not verify proof request with unauthorized authority', async () => {
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.b, payerKeypair.publicKey)
  //
  //   const newPayerKeypair = Keypair.generate()
  //   const newClient = new AlbusClient(newProvider(newPayerKeypair))
  //   await airdrop(newPayerKeypair.publicKey)
  //
  //   try {
  //     await newClient.manager.verifyProofRequest({ proofRequest: proofRequestAddr })
  //     assert.ok(false)
  //   } catch (e: any) {
  //     assertErrorCode(e, 'Unauthorized')
  //   }
  // })
  //
  // it('can not verify unproved proof request', async () => {
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)
  //
  //   try {
  //     await client.manager.verifyProofRequest({ proofRequest: proofRequestAddr })
  //     assert.ok(false)
  //   } catch (e: any) {
  //     console.log(e)
  //     assertErrorCode(e, 'Unproved')
  //   }
  // })
  //
  // it('can verify proof request', async () => {
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.b, payerKeypair.publicKey)
  //   await client.manager.verifyProofRequest({ proofRequest: proofRequestAddr })
  //   const proofRequest = await client.loadProofRequest(proofRequestAddr)
  //   assert.equal(proofRequest.status, ProofRequestStatus.Verified)
  // })
  //
  // it('can reject proof request', async () => {
  //   const { address } = await client.createProofRequest({ circuit: circuits.c, serviceCode })
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)
  //   await mockedProve(client, address)
  //   await client.manager.rejectProofRequest({ proofRequest: proofRequestAddr })
  //   const proofRequest = await client.loadProofRequest(proofRequestAddr)
  //   assert.equal(proofRequest.status, ProofRequestStatus.Rejected)
  // })
  //
  // it('can delete proof request', async () => {
  //   const [serviceProviderAddr] = client.getServiceProviderPDA(serviceCode)
  //   const [proofRequestAddr] = client.getProofRequestPDA(serviceProviderAddr, circuits.a, payerKeypair.publicKey)
  //   await client.deleteProofRequest({ proofRequest: proofRequestAddr })
  // })

  it('can delete policy', async () => {
    await client.policy.delete({ circuitCode: 'age', serviceCode })
  })

  it('can delete circuit', async () => {
    await client.circuit.delete({ code: 'age' })
  })

  it('can delete service provider', async () => {
    await client.service.delete({ code: serviceCode })
  })
})
