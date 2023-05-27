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
import { EdDSASigner } from 'did-jwt'
import { createVerifiableCredentialJwt, verifyCredential } from 'did-jwt-vc'
import type { Issuer, JwtCredentialPayload } from 'did-jwt-vc'
import type { JWTVerifyOptions } from 'did-jwt/src/JWT'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import { encodeDidKey } from './utils'
import { xc20p } from './crypto'

export type CredentialSubject = Record<string, any>

export interface IssueOpts {
  encrypt?: boolean
  nbf?: number
  exp?: number
  aud?: string[]
  holder: PublicKey
  issuerSecretKey: number[]
}

/**
 * Issue new verifiable credential
 */
export async function create(credentialSubject: CredentialSubject, opts: IssueOpts) {
  if (opts?.encrypt) {
    credentialSubject = {
      encrypted: await xc20p.encrypt(JSON.stringify(credentialSubject), opts.holder),
    }
  }

  const signerKeypair = Keypair.fromSecretKey(Uint8Array.from(opts.issuerSecretKey))
  const signer = EdDSASigner(signerKeypair.secretKey)

  const issuer: Issuer = {
    // did: 'did:web:albus.finance',
    did: encodeDidKey(signerKeypair.publicKey.toBytes()),
    signer,
    alg: 'EdDSA',
  }

  const vcPayload: JwtCredentialPayload = {
    sub: encodeDidKey(opts.holder.toBytes()),
    aud: opts?.aud,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'type': ['VerifiableCredential'],
      'credentialSubject': credentialSubject,
    },
  }

  if (opts?.exp) {
    vcPayload.exp = opts.exp
  }

  if (opts?.nbf) {
    vcPayload.nbf = opts.nbf
  }

  return await createVerifiableCredentialJwt(vcPayload, issuer)
}

export interface VerifyOpts extends JWTVerifyOptions {
  decryptionKey?: xc20p.PrivateKey
}

/**
 * Verify credential
 */
export async function verify(payload: string, opts: VerifyOpts) {
  const resolver = new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  const vc = await verifyCredential(payload, resolver, opts)

  let data = vc.verifiableCredential.credentialSubject as CredentialSubject

  if (data.encrypted && opts.decryptionKey) {
    data = JSON.parse(await xc20p.decrypt(data.encrypted, opts.decryptionKey))
  }

  return {
    ...vc,
    data,
  }
}
