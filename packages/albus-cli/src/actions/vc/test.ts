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

import { encodeDidKey } from '@albus/core/src/utils'
import { Keypair } from '@solana/web3.js'
import type { Issuer, JwtCredentialPayload } from 'did-jwt-vc'
import { createVerifiableCredentialJwt, verifyCredential } from 'did-jwt-vc'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import { EdDSASigner } from 'did-jwt'
import { useContext } from '../../context'

export async function test() {
  const { keypair, config } = useContext()

  const vcPayload: JwtCredentialPayload = {
    sub: 'did:web:skounis.github.io',
    nbf: 1562950282,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'type': ['VerifiableCredential'],
      'credentialSubject': {
        givenName: 'Vladyslav',
      },
    },
  }

  // Create a singer by using a private key.
  // const key = '8eb63d435de4d634bc5f3df79c361e9233f55c9c2fca097758eefb018c4c61df'
  // const key = 'd43935a06a9f549cb5c0a138170f972ae855610a5a5bb211f6c7e75a5cfc8c73'
  // const signer = ES256KSigner(hexToBytes(key))
  const issuerKey = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))
  const signer = EdDSASigner(issuerKey.secretKey)

  const issuer: Issuer = {
    // did: 'did:web:albus.finance',
    did: encodeDidKey(issuerKey.publicKey.toBytes()),
    signer,
    // signer: EdDSASigner(keypair.secretKey),
    // signer: EdDSAPoseidonSigner(keypair.secretKey),
    alg: 'EdDSA',
  }

  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
  console.log(vcJwt)
  // validateJwtCredentialPayload(vcJwt)
  // Resolve and Verify

  const resolver = new Resolver({
    // ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  // Verify the Credential
  const verifiedVC = await verifyCredential(vcJwt, resolver)
  console.log('//// Verified Credentials:\n', verifiedVC)
}
