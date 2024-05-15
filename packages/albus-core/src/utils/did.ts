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
import { DEFAULT_DID } from '../credential/constants'
import { MultiBase, PrivateKey } from '../crypto'
import { VerifyType } from '../credential/types'

/**
 * Generates a DID key from the given public key.
 *
 * @param {Uint8Array} publicKey - The public key to encode.
 * @return {string} The encoded DID key.
 */
export function encodeDidKey(publicKey: Uint8Array): string {
  return `did:key:${MultiBase.encode(publicKey, MultiBase.codec.ed25519Pub)}`
}

/**
 * Decode a DID key from a string representation.
 *
 * @param {string} did - The string representation of the DID key.
 * @return {Uint8Array} The decoded DID key as a Uint8Array.
 */
export function decodeDidKey(did: string): Uint8Array {
  if (!did.startsWith('did:key:')) {
    throw new Error('did:key invalid format')
  }
  return MultiBase.decode(did.slice(8), MultiBase.codec.ed25519Pub)
}

/**
 * Generates a DID (Decentralized Identifier) document based on the given keypair and controller.
 *
 * @param {Keypair} keypair - the keypair used to generate the DID
 * @param {string} [controller] - the controller of the DID
 * @return {object} the generated DID document
 */
export function generateDid(keypair: Keypair, controller = DEFAULT_DID) {
  const publicKeyMultibase = MultiBase.encode(keypair.publicKey.toBytes(), MultiBase.codec.ed25519Pub)
  const publicKeyBJJ = new PrivateKey(keypair.secretKey).public().toBase58()

  const verificationMethod = [
    {
      id: `${controller}#${publicKeyMultibase}`,
      type: VerifyType.Ed25519VerificationKey2020,
      controller,
      publicKeyMultibase,
    },
    {
      id: `${controller}#${publicKeyBJJ}`,
      type: VerifyType.BJJVerificationKey2021,
      controller,
      publicKeyBase58: publicKeyBJJ,
    },
  ]

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
      'https://w3id.org/security/suites/x25519-2020/v1',
      // 'https://www.w3.org/ns/data-integrity/v1',
      // 'https://w3id.org/security/multikey/v1',
    ],
    'id': controller,
    'assertionMethod': verificationMethod.map(m => m.id),
    'authentication': verificationMethod.map(m => m.id),
    'keyAgreement': [
      { ...verificationMethod[0], type: 'X25519KeyAgreementKey2020' },
    ],
    'verificationMethod': verificationMethod,
    'service': [
      {
        id: `${controller}#linkeddomains`,
        type: 'LinkedDomains',
        serviceEndpoint: 'https://albus.finance/',
      },
      // {
      //   id: `${id}#eecc-registry`,
      //   type: 'CredentialRegistry',
      //   serviceEndpoint: 'https://ssi.eecc.de/api/registry/vcs/',
      // },
    ],
  }
}
