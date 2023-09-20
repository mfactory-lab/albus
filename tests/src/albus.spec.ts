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

import { Keypair, PublicKey } from '@solana/web3.js'
import { assert, beforeAll, describe, it, vi } from 'vitest'
import * as Albus from '../../packages/albus-core/src'
import { AlbusClient, InvestigationStatus, ProofRequestStatus } from '../../packages/albus-sdk/src'
import { airdrop, assertErrorCode, loadFixture, newProvider, payerKeypair, provider } from './utils'

describe('albus', () => {
  const client = new AlbusClient(provider)
  // const metaplex = Metaplex.make(provider.connection).use(keypairIdentity(payerKeypair))

  const serviceCode = 'acme'
  const circuitCode = 'age'
  const policyCode = 'age'

  const investigator = Keypair.generate()
  const trustees = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ]

  const credential = {
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
  }

  const circuitData = {
    code: circuitCode,
    name: 'Age policy',
    wasmUri: 'mock:wasmUri',
    zkeyUri: 'mock:zkeyUri',
    outputs: [
      'encryptedData[4]',
      'encryptedShare[3][4]',
      'userPublicKey[2]',
    ],
    privateSignals: [
      'birthDate',
      'userPrivateKey',
    ],
    publicSignals: [
      'currentDate',
      'minAge',
      'maxAge',
      'credentialRoot',
      'birthDateProof[6]',
      'birthDateKey',
      'issuerPk[2]',
      'issuerSignature[3]',
      'trusteePublicKey[3][2]',
    ],
  }

  const policyData = {
    code: policyCode,
    serviceCode,
    circuitCode: circuitData.code,
    name: 'Age policy 18+',
    description: 'Test policy',
    expirationPeriod: 0,
    retentionPeriod: 0,
    rules: [
      { key: 'minAge', value: 18 },
      { key: 'maxAge', value: 100 },
    ],
  }

  beforeAll(async () => {
    vi.spyOn(client.credential, 'load').mockReturnValue(Promise.resolve(credential))

    // airdrops
    await airdrop(payerKeypair.publicKey)
    await airdrop(investigator.publicKey)
    for (const trusteeKeypair of trustees) {
      await airdrop(trusteeKeypair.publicKey)
    }
  })

  it('can create circuit', async () => {
    try {
      const { signature, address } = await client.circuit.create(circuitData)
      assert.ok(!!signature)
      assert.ok(!!address)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can update circuit vk', async () => {
    const vk = JSON.parse(loadFixture('agePolicy.vk.json').toString())
    try {
      const data = { code: circuitCode, vk }
      const { signatures } = await client.circuit.updateVk(data)
      const circuit = await client.circuit.loadById(data.code)
      assert.ok(signatures.length > 0)
      assert.equal(circuit.vk.alpha.length, 64)
      assert.equal(circuit.vk.beta.length, 128)
      assert.equal(circuit.vk.gamma.length, 128)
      assert.equal(circuit.vk.delta.length, 128)
      assert.equal(circuit.vk.ic.length, data.vk.IC.length)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it(`can create ${trustees.length} trustees`, async () => {
    try {
      for (let i = 0; i < trustees.length; i++) {
        const trusteeKeypair = trustees[i]!
        const newClient = new AlbusClient(newProvider(trusteeKeypair))
        const { key } = Albus.zkp.generateEncryptionKey(trusteeKeypair)
        const data = {
          name: `trustee${i}`,
          email: `trustee${i}@albus.finance`,
          website: `https://trustee${i}.albus.finance`,
          key: Array.from(key),
        }
        const { address, signature } = await newClient.trustee.create(data)
        assert.ok(!!signature)

        // console.log(`trustee #${i}`, address.toString())

        const trustee = await newClient.trustee.load(address)

        const pk = Albus.zkp.unpackPubkey(Uint8Array.from(trustee.key))
        assert.equal(pk?.length, 2)

        // console.log(`trustee${i}`, pk, key)

        assert.deepEqual(trustee.key, data.key)
        assert.equal(trustee.name, data.name)
        assert.equal(trustee.email, data.email)
        assert.equal(trustee.website, data.website)
        assert.equal(trustee.isVerified, false)
      }
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can verify all trustees', async () => {
    try {
      const trustees = await client.trustee.find({ noData: true })
      for (const { pubkey } of trustees) {
        await client.trustee.verify(pubkey)
      }
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can update a trustee', async () => {
    try {
      const trusteeKeypair = trustees[0]!
      const newClient = new AlbusClient(newProvider(trusteeKeypair))
      const { key } = Albus.zkp.generateEncryptionKey(trusteeKeypair)
      const data = {
        key: Array.from(key),
        name: 'trustee123',
        email: 'trustee123@albus.finance',
        website: 'https://trustee123.albus.finance',
      }
      const { address } = await newClient.trustee.update(data)
      const trustee = await newClient.trustee.load(address)
      assert.deepEqual(address, client.pda.trustee(key)[0])
      assert.deepEqual(trustee.key, data.key)
      assert.equal(trustee.name, data.name)
      assert.equal(trustee.email, data.email)
      assert.equal(trustee.website, data.website)
      assert.equal(trustee.isVerified, true)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create a service', async () => {
    try {
      const data = { code: serviceCode, name: 'acme', website: 'https://example.com' }
      const { address } = await client.service.create(data)
      const service = await client.service.load(address)
      assert.equal(service.authority.toString(), payerKeypair.publicKey.toString())
      assert.equal(service.code, data.code)
      assert.equal(service.name, data.name)
      assert.equal(service.website, data.website)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can service select a trustee', async () => {
    try {
      const [serviceProvider] = client.pda.serviceProvider(serviceCode)
      const data = {
        trustees: trustees.map(kp => client.pda.trustee(
          Albus.zkp.generateEncryptionKey(kp).key,
        )[0]).slice(0, 3),
        serviceProvider,
      }
      const { signature } = await client.service.update(data)
      assert.ok(!!signature)
      const service = await client.service.load(serviceProvider)
      assert.deepEqual(service.trustees, data.trustees)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create a policy', async () => {
    try {
      const { address } = await client.policy.create(policyData)
      const policy = await client.policy.load(address)
      assert.equal(policy.serviceProvider.toString(), client.pda.serviceProvider(policyData.serviceCode)[0].toString())
      assert.equal(policy.circuit.toString(), client.pda.circuit(policyData.circuitCode)[0].toString())
      assert.equal(policy.code, policyData.code)
      assert.equal(policy.name, policyData.name)
      assert.equal(policy.description, policyData.description)
      assert.equal(policy.expirationPeriod, policyData.expirationPeriod)
      assert.equal(policy.retentionPeriod, policyData.retentionPeriod)
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can create a proof request', async () => {
    const { address } = await client.proofRequest.create({ serviceCode, policyCode })
    const proofRequest = await client.proofRequest.load(address)

    const [serviceProvider] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(serviceProvider, policyCode)
    const [circuit] = client.pda.circuit(circuitCode)

    assert.equal(proofRequest.serviceProvider.toString(), serviceProvider.toString())
    assert.equal(proofRequest.policy.toString(), policy.toString())
    assert.equal(proofRequest.circuit.toString(), circuit.toString())
    assert.equal(proofRequest.owner.toString(), provider.publicKey.toString())
    assert.equal(proofRequest.status, ProofRequestStatus.Pending)
  })

  it('can prove a proof request', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, policyCode)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)

    vi.spyOn(client.proofRequest, 'loadFull')
      .mockImplementationOnce(async (addr, props) => {
        const res = await client.proofRequest.loadFull(addr, props)
        return {
          ...res,
          circuit: {
            ...res.circuit,
            wasmUri: loadFixture('agePolicy.wasm'),
            zkeyUri: loadFixture('agePolicy.zkey'),
          },
        } as any
      })

    const { signatures } = await client.proofRequest.fullProve({
      proofRequest,
      vc: PublicKey.default, // mocked
      userPrivateKey: payerKeypair.secretKey,
    })

    assert.ok(signatures.length > 0)

    const data = await client.proofRequest.load(proofRequest)
    assert.include([ProofRequestStatus.Proved, ProofRequestStatus.Verified], data.status)
    assert.ok(!!data.proof)
    assert.ok(!!data.provedAt)
    assert.ok(data.publicInputs.length > 0)
  })

  it('can change proof request status', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, policyCode)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    await client.proofRequest.changeStatus({ proofRequest, status: ProofRequestStatus.Rejected })
  })

  it('can not change proof request status with unauthorized authority', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, policyCode)
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
    const [policy] = client.pda.policy(service, policyCode)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    const res = await client.proofRequest.verify({ proofRequest })
    assert.ok(res)
  })

  let investigationAddress: PublicKey

  it('can create investigation request', async () => {
    const newClient = new AlbusClient(newProvider(investigator))

    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, policyCode)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)

    try {
      const { address, selectedTrustees } = await newClient.investigation.create({
        proofRequest,
        // encryptionKey: ...
      })
      investigationAddress = address
      const investigation = await newClient.investigation.load(address)
      assert.equal(investigation.authority.toString(), investigator.publicKey.toString())
      assert.equal(investigation.encryptionKey.toString(), investigator.publicKey.toString())
      assert.equal(investigation.proofRequest.toString(), proofRequest.toString())
      // assert.equal(investigation.proofRequestOwner.toString(), proofRequest.toString())
      assert.equal(investigation.serviceProvider.toString(), service.toString())
      assert.equal(investigation.requiredShareCount, 2)
      assert.equal(investigation.status, InvestigationStatus.Pending)

      let idx = 1
      for (const selectedTrustee of selectedTrustees) {
        const [shareAddr] = client.pda.investigationRequestShare(address, selectedTrustee)
        const share = await newClient.investigation.loadShare(shareAddr)
        assert.deepEqual(share.investigationRequest, address)
        assert.deepEqual(share.proofRequestOwner, investigation.proofRequestOwner)
        assert.equal(share.index, idx)
        assert.equal(share.status, 0)
        assert.ok(Array.from(share.share).length === 0)
        idx++
      }
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can reveal secret key', async () => {
    if (!investigationAddress) {
      throw new Error('No investigation request found')
    }
    try {
      for (let i = 0; i < 2; i++) {
        const { secretShare } = await client.investigation.revealShare({
          investigationRequest: investigationAddress,
          encryptionKey: trustees[i]!.secretKey,
          index: i + 1,
        })
        console.log('secretShare', secretShare)
      }
    } catch (e) {
      console.log(e)
      assert.ok(false)
    }
  })

  it('can reconstruct secret key and decrypt data', async () => {
    const result = await client.investigation.decryptData({
      investigationRequest: investigationAddress,
      encryptionKey: investigator.secretKey,
    })
    assert.equal(String(result.claims.birthDate.value), credential.credentialSubject.birthDate)
    console.log(result)
  })

  it('can delete proof request', async () => {
    const [service] = client.pda.serviceProvider(serviceCode)
    const [policy] = client.pda.policy(service, policyCode)
    const [proofRequest] = client.pda.proofRequest(policy, provider.publicKey)
    await client.proofRequest.delete({ proofRequest })
  })

  it('can delete policy', async () => {
    await client.policy.delete({ serviceCode, code: policyCode })
  })

  it('can delete circuit', async () => {
    await client.circuit.delete({ code: circuitCode })
  })

  it('can delete service provider', async () => {
    await client.service.delete({ code: serviceCode })
  })

  // it('can delete investigation request', async () => {
  // })

  it('can delete all trustees', async () => {
    for (const trustee of trustees) {
      const { key } = Albus.zkp.generateEncryptionKey(trustee)
      try {
        await client.trustee.deleteByKey(key)
      } catch (e) {
        console.log(e)
        assert.ok(false)
      }
    }
  })
})
