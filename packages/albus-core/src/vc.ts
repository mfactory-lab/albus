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
import { buildPoseidonOpt, newMemEmptyTrie } from 'circomlibjs'
import { EdDSASigner } from 'did-jwt'
import {
  createVerifiableCredentialJwt, createVerifiablePresentationJwt,
  verifyCredential as verifyCredentialBase,
} from 'did-jwt-vc'
import type {
  CreatePresentationOptions,
  Issuer,
  JwtCredentialPayload,
  JwtPresentationPayload,
  VerifiableCredential,

  VerifiedCredential as VerifiedCredentialBase,
} from 'did-jwt-vc'
import type { JWTVerifyOptions } from 'did-jwt'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import { arrayToHexString, stringToBytes } from './crypto/utils'
import { encodeDidKey } from './utils'
import { xc20p } from './crypto'

export const DEFAULT_CONTEXT = 'https://www.w3.org/2018/credentials/v1'
export const DEFAULT_VC_TYPE = 'VerifiableCredential'
export const DEFAULT_VP_TYPE = 'VerifiablePresentation'

export type VerifiedCredential = VerifiedCredentialBase
export type Claims = Record<string, any>

export interface CreateCredentialOpts {
  holder: PublicKey
  signerSecretKey: number[] | Uint8Array
  encryptionKey?: xc20p.PrivateKey
  encrypt?: boolean
  nbf?: number
  exp?: number
  aud?: string[]
}

/**
 * Create new verifiable credential
 */
export async function createVerifiableCredential(claims: Claims, opts: CreateCredentialOpts) {
  let credentialSubject: Claims = {}

  if (opts?.encrypt) {
    // credentialSubject.encrypted = true
    // for (const key of Object.keys(claims)) {
    //   const value = claims[key]
    //   credentialSubject[key] = await xc20p.encrypt(JSON.stringify(value), opts.holder, opts.encryptionKey)
    // }
    credentialSubject.encrypted = await xc20p.encrypt(JSON.stringify(claims), opts.holder, opts.encryptionKey)
  } else {
    credentialSubject = { ...claims }
  }

  const signerKeypair = Keypair.fromSecretKey(Uint8Array.from(opts.signerSecretKey))
  const signer = EdDSASigner(signerKeypair.secretKey)

  const issuer: Issuer = {
    // did: 'did:web:albus.finance',
    did: encodeDidKey(signerKeypair.publicKey.toBytes()),
    signer,
    alg: 'EdDSA',
  }

  const payload: JwtCredentialPayload = {
    sub: encodeDidKey(opts.holder.toBytes()),
    aud: opts?.aud,
    vc: {
      '@context': [DEFAULT_CONTEXT],
      'type': [DEFAULT_VC_TYPE],
      'credentialSubject': credentialSubject,
    },
  }

  if (opts?.exp) {
    payload.exp = opts.exp
  }

  if (opts?.nbf) {
    payload.nbf = opts.nbf
  }

  const tree = await claimsTree(claims)

  return {
    payload: await createVerifiableCredentialJwt(payload, issuer),
    credentialRoot: arrayToHexString(tree.root),
  }
}

export async function createVerifiablePresentation(credentials: VerifiableCredential[], opts?: CreatePresentationOptions) {
  const signerKeypair = Keypair.generate()
  const signer = EdDSASigner(signerKeypair.secretKey)

  const holder: Issuer = {
    did: encodeDidKey(signerKeypair.publicKey.toBytes()),
    signer,
    alg: 'EdDSA',
  }

  const payload: JwtPresentationPayload = {
    vp: {
      '@context': [DEFAULT_CONTEXT],
      'type': [DEFAULT_VP_TYPE],
      'verifiableCredential': credentials,
    },
  }

  return createVerifiablePresentationJwt(payload, holder, opts)
}

export interface VerifyCredentialOpts extends JWTVerifyOptions {
  decryptionKey?: xc20p.PrivateKey
}

/**
 * Verify credential
 */
export async function verifyCredential(payload: string, opts: VerifyCredentialOpts): Promise<VerifiedCredential> {
  const resolver = new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  const vc = await verifyCredentialBase(payload, resolver, opts)

  let data = vc.verifiableCredential.credentialSubject

  if (data.encrypted && opts.decryptionKey) {
    try {
      data = JSON.parse(await xc20p.decrypt(data.encrypted, opts.decryptionKey))
    } catch (e) {
      //
    }
  }

  vc.verifiableCredential = {
    ...vc.verifiableCredential,
    credentialSubject: data,
  }

  return vc
}

const poseidonPromise = buildPoseidonOpt()

export async function claimsTree(claims: Claims) {
  const tree = await newMemEmptyTrie()
  const poseidon = await poseidonPromise
  const encode = (s: any) => poseidon([stringToBytes(s)])
  for (const [key, val] of Object.entries(claims)) {
    await tree.insert(encode(key), encode(val))
  }
  return {
    root: tree.root as Uint8Array,
    find: (key: string) => tree.find(encode(key)),
    insert: (key: string, val: any) => tree.insert(encode(key), encode(val)),
    update: (key: string, val: any) => tree.update(encode(key), encode(val)),
    delete: (key: string) => tree.delete(encode(key)),
  }
}
