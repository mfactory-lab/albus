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

import { createAdminCloseAccountInstruction } from '@mfactory-lab/albus-sdk'
import type { CreatePolicyProps } from '@mfactory-lab/albus-sdk/dist/policyManager'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { assert, beforeAll, describe, it, vi } from 'vitest'
import { AlbusClient, ProofRequestStatus } from '../../packages/albus-sdk/src'
import { airdrop, assertErrorCode, loadFixture, newProvider, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  // const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  const serviceCode = 'acme'
  let circuitAddress: PublicKey

  const minAgeIndex = 8
  const maxAgeIndex = 9
  const circuitData = {
    privateSignals: [
      'birthDate',
    ],
    publicSignals: [
      'birthDateProof[6]', 'birthDateKey',
      'currentDate', 'minAge', 'maxAge',
      'credentialRoot', 'issuerPk[2]', 'issuerSignature[3]',
    ],
    wasmUri: 'mock:wasmUri',
    zkeyUri: 'mock:zkeyUri',
    code: 'age',
    name: 'Age policy',
  }

  beforeAll(async () => {
    await airdrop(payerKeypair.publicKey)
  })

  it('can create circuit', async () => {
    try {
      const { signature, address } = await client.circuit.create(circuitData)
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
      const data: CreatePolicyProps = {
        code: 'age',
        serviceCode,
        circuitCode: 'age',
        name: 'Age policy 18+',
        description: 'Test policy',
        expirationPeriod: 0,
        retentionPeriod: 0,
        rules: [
          { index: minAgeIndex, group: 0, value: 18 },
          { index: maxAgeIndex, group: 0, value: 100 },
        ],
      }
      const { signature } = await client.policy.create(data)
      console.log('signature', signature)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create proof request', async () => {
    const { address } = await client.proofRequest.create({ serviceCode, policyCode: 'age' })
    const proofRequest = await client.proofRequest.load(address)
    assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
    assert.equal(proofRequest.status, ProofRequestStatus.Pending)
  })

  it('can prove a proof request', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, 'age')
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)

    const mockedVpUri = 'http://localhost/mock.json'

    vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
      ],
      'type': [
        'VerifiableCredential',
        'AlbusCredential',
      ],
      'issuer': 'did:web:albus.finance',
      'issuanceDate': '2023-07-27T00:12:43.635Z',
      'credentialSubject': {
        birthDate: '19890101',
        firstName: 'Alex',
        country: 'US',
      },
      'proof': {
        type: 'BJJSignature2021',
        created: 1690416764498,
        verificationMethod: 'did:web:albus.finance#keys-0',
        rootHash: '11077866633106981791340789987944870806147307639065753995447310137530607758623',
        proofValue: {
          ax: '20841523997579262969290434121704327723902935194219264790567899027938554056663',
          ay: '20678780156819015018034618985253893352998041677807437760911245092739191906558',
          r8x: '21153906701456715004295579276500758430977318622340395655171725984189489403836',
          r8y: '15484492519285437260388749074045005694239822857741052851485555393361224949130',
          s: '1662767948258934355069791443487100820038153707701411290986741440889424297316',
        },
        proofPurpose: 'assertionMethod',
      },
    } as any))

    vi.spyOn(client.proofRequest, 'loadFull').mockImplementation(async (addr) => {
      const proofRequest = await client.proofRequest.load(addr)
      const policy = await client.policy.load(proofRequest.policy)
      const circuit = await client.circuit.load(proofRequest.circuit)

      return {
        proofRequest,
        circuit: {
          ...circuit,
          wasmUri: loadFixture('agePolicy.wasm'),
          zkeyUri: loadFixture('agePolicy.zkey'),
        },
        policy,
      } as any
    })

    vi.spyOn(client.storage, 'uploadData').mockReturnValue(Promise.resolve(mockedVpUri))

    const { signature } = await client.proofRequest.fullProve({
      holderSecretKey: payerKeypair.secretKey,
      exposedFields: circuitData.privateSignals,
      proofRequest,
      vc: PublicKey.default, // mocked
    })

    assert.ok(!!signature)

    const data = await client.proofRequest.load(proofRequest)

    assert.equal(data.vpUri, mockedVpUri)
    assert.equal(data.owner.toString(), provider.publicKey.toString())
    assert.ok(data.proof)
    assert.deepEqual(data.publicInputs, [
      [
        0, 199, 214, 240, 123, 172, 248,
        120, 228, 226, 80, 170, 126, 30,
        175, 137, 146, 226, 184, 21, 10,
        234, 158, 225, 179, 97, 99, 42,
        178, 165, 78, 197,
      ],
      [
        1, 24, 137, 177, 30, 45, 57, 167,
        210, 172, 227, 148, 76, 91, 156, 16,
        58, 67, 90, 245, 67, 148, 118, 22,
        242, 95, 231, 130, 15, 199, 245, 218,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 52, 178, 166,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 18,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 100,
      ],
      [
        24, 125, 217, 174, 133, 40, 203,
        118, 245, 106, 154, 122, 19, 50,
        71, 225, 18, 147, 174, 184, 246,
        177, 138, 220, 37, 203, 36, 131,
        167, 224, 109, 31,
      ],
      [
        46, 19, 226, 114, 3, 228, 121, 0,
        203, 132, 50, 204, 165, 145, 251, 3,
        242, 141, 38, 88, 124, 50, 248, 61,
        218, 182, 181, 189, 88, 230, 143, 215,
      ],
      [
        45, 183, 198, 89, 118, 191, 150,
        159, 106, 184, 128, 72, 245, 119,
        147, 210, 107, 183, 226, 219, 241,
        216, 158, 67, 9, 92, 26, 98,
        61, 107, 160, 254,
      ],
      [
        46, 196, 175, 216, 123, 42, 24, 178,
        16, 98, 164, 254, 143, 46, 79, 106,
        229, 141, 49, 13, 188, 75, 245, 196,
        75, 161, 118, 58, 149, 60, 215, 188,
      ],
      [
        34, 59, 233, 132, 237, 149, 239, 141,
        62, 114, 113, 160, 135, 11, 50, 26,
        18, 8, 164, 169, 71, 229, 111, 227,
        32, 231, 29, 61, 112, 192, 93, 138,
      ],
      [
        3, 173, 23, 227, 2, 43, 181, 73,
        139, 193, 142, 183, 238, 255, 98, 64,
        170, 184, 200, 150, 126, 198, 90, 126,
        220, 16, 104, 57, 239, 125, 189, 100,
      ],
    ])

    assert.equal(data.status, ProofRequestStatus.Proved)
  })

  it('can change proof request status', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, 'age')
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    await client.proofRequest.changeStatus({ proofRequest, status: ProofRequestStatus.Rejected })
  })

  it('can not change proof request status with unauthorized authority', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, 'age')
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)

    const newPayerKeypair = Keypair.generate()
    const newClient = new AlbusClient(newProvider(newPayerKeypair))
    await airdrop(newPayerKeypair.publicKey)

    try {
      await newClient.proofRequest.changeStatus({ proofRequest, status: ProofRequestStatus.Verified })
      assert.ok(false)
    } catch (e: any) {
      assertErrorCode(e, 'Unauthorized')
    }
  })

  it('can verify proof request', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, 'age')
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    const res = await client.proofRequest.verify({ proofRequest })
    assert.ok(res)
  })

  it('can delete proof request', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, 'age')
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    await client.proofRequest.delete({ proofRequest })
  })

  it('can delete policy', async () => {
    await client.policy.delete({ serviceCode, code: 'age' })
  })

  it('can delete circuit', async () => {
    await client.circuit.delete({ code: 'age' })
  })

  it('can delete service provider', async () => {
    await client.service.delete({ code: serviceCode })
  })

  describe('admin', () => {
    it('can delete program accounts', async () => {
      const s = await client.service.create({ code: serviceCode, name: serviceCode })
      const c = await client.circuit.create(circuitData)
      const p = await client.policy.create({ serviceCode, circuitCode: circuitData.code, code: 'x', name: 'x' })
      const r = await client.proofRequest.create({ serviceCode, policyCode: 'x' })

      for (const account of [r.address, p.address, c.address, s.address]) {
        const ix = createAdminCloseAccountInstruction({
          authority: provider.publicKey,
          account,
        })
        await provider.sendAndConfirm(new Transaction().add(ix))
      }

      try {
        await client.service.load(s.address)
        assert.ok(false)
      } catch (e) {}
    })
  })
})
