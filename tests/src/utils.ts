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

import { readFileSync } from 'node:fs'
import type { AlbusClient, Proof } from '@albus/sdk'
import type { Metaplex } from '@metaplex-foundation/js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import type { PublicKeyInitData } from '@solana/web3.js'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { assert, vi } from 'vitest'

export const payerKeypair = Keypair.fromSecretKey(Uint8Array.from([46, 183, 156, 94, 55, 128, 248, 0, 49, 70, 183, 244, 178, 0, 0, 236, 212, 131, 76, 78, 112, 48, 25, 79, 249, 33, 43, 158, 199, 2, 168, 18, 55, 174, 166, 159, 57, 67, 197, 158, 255, 142, 177, 177, 47, 39, 35, 185, 148, 253, 191, 58, 219, 119, 104, 89, 225, 26, 244, 119, 160, 6, 156, 227]))

export const provider = newProvider(payerKeypair)

export function newProvider(payerKeypair: Keypair) {
  const opts = AnchorProvider.defaultOptions()
  return new AnchorProvider(
    new Connection('http://localhost:8899', opts),
    new Wallet(payerKeypair),
    opts,
  )
}

export async function mintNFT(metaplex: Metaplex, symbol: string) {
  const { nft } = await metaplex.nfts().create({
    uri: 'http://localhost/metadata.json',
    name: 'ALBUS NFT',
    symbol,
    sellerFeeBasisPoints: 500,
  })
  return nft
}

export async function airdrop(addr: PublicKeyInitData, amount = 10) {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(new PublicKey(addr), amount * LAMPORTS_PER_SOL),
  )
}

export function assertErrorCode(error: { logs?: string[] }, code: string) {
  assert.ok(String((error?.logs ?? []).join('')).includes(`Error Code: ${code}`))
}

export function loadFixture(name: string) {
  return readFileSync(`./fixtures/${name}`)
}

export async function mockedProve(client: AlbusClient, address: PublicKey) {
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

  await client.prove({
    proofRequest: address,
    vc: PublicKey.default,
  })
}

export function getProofMock(): Proof {
  return {
    piA: ['4688465976390849813258766614874268793015562393908521426678896850698555295377', '5203302727358091972134489987774942965622107014647584381609747750500688800419', '1'],
    piB: [['19100277836905026624939775520998807986886756133116001533707896920384169794537', '20845943990358232545602432281011291671960605406348147106935789163866131884190'], ['9550979632776995462322201809577428314107186866427252237457450171793417063766', '12473350078107351578656027664820450318597805912302701634643037322816555142082'], ['1', '0']],
    piC: ['3368898346418249388382544753485388607144585282610758032560453819156280723300', '4321128949903528883011131762909256214873510011327154174450532321111046247789', '1'],
    protocol: 'groth16',
    curve: 'bn128',
    publicInputs: ['2023', '6', '13', '18', '120'],
  }
}
