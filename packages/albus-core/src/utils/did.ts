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

import type { Keypair } from '@solana/web3.js'
import { babyJub, eddsa } from '@iden3/js-crypto'
import * as u8a from 'uint8arrays'
import { bytesToBase58 } from '../crypto/utils'

const ALBUS_DID = 'did:web:albus.finance'

export function encodeDidKey(publicKey: Uint8Array): string {
  const bytes = new Uint8Array(publicKey.length + 2)
  bytes[0] = 0xED // ed25519 multicodec
  // The multicodec is encoded as a varint, so we need to add this.
  // See js-multicodec for a general implementation
  bytes[1] = 0x01
  bytes.set(publicKey, 2)
  return `did:key:z${u8a.toString(bytes, 'base58btc')}`
}

export function decodeDidKey(did: string): Uint8Array {
  if (!did.startsWith('did:key:z')) {
    throw new Error('did:key invalid format')
  }
  const bytes = u8a.fromString(did.slice(9), 'base58btc')
  if (bytes[0] !== 0xED || bytes[1] !== 0x01) {
    throw new Error('did:key is not valid ed25519 key')
  }
  return bytes.slice(2)
}

export function generateDid(keypair: Keypair) {
  const id = ALBUS_DID
  const pubkey = babyJub.packPoint(eddsa.prv2pub(keypair.secretKey))

  const verificationMethod = [
    {
      id: '#keys-0',
      type: 'EddsaBJJVerificationKey',
      controller: id,
      publicKeyBase58: bytesToBase58(pubkey),
    },
    {
      id: '#keys-1',
      type: 'Ed25519VerificationKey2018',
      controller: id,
      publicKeyBase58: keypair.publicKey.toBase58(),
    },
    {
      id: '#keys-2',
      type: 'Ed25519VerificationKey2018',
      controller: encodeDidKey(keypair.publicKey.toBytes()),
      publicKeyBase58: keypair.publicKey.toBase58(),
    },
  ]

  return {
    '@context': 'https://www.w3.org/ns/did/v1',
    'id': id,
    'verificationMethod': verificationMethod,
    'authentication': verificationMethod.map(m => m.id),
    'assertionMethod': verificationMethod.map(m => m.id),
    'service': [
      {
        id: '#linkeddomains',
        type: 'LinkedDomains',
        serviceEndpoint: {
          origins: [
            'https://albus.finance/',
          ],
        },
      },
    ],
  }
}
