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

import { InMemoryDB, Merkletree, ZERO_HASH, str2Bytes } from '@iden3/js-merkletree'
import type { PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import { Signature, XC20P, babyJub, eddsa, ffUtils, poseidon, utils } from './crypto'
import { CredentialType, PresentationType, ProofType, VerifyType } from './types'
import type { Claims, Proof, VerifiableCredential, VerifiablePresentation, W3CCredential, W3CPresentation } from './types'
import { encodeDidKey, validateCredentialPayload, validatePresentationPayload } from './utils'

const { bytesToBigInt, base58ToBytes } = utils

export const DEFAULT_CONTEXT = 'https://www.w3.org/2018/credentials/v1'
export const DEFAULT_VC_TYPE = 'VerifiableCredential'
export const DEFAULT_VP_TYPE = 'VerifiablePresentation'
export const DEFAULT_DID = 'did:web:albus.finance'
export const DEFAULT_CLAIM_TREE_DEPTH = 6 // 2**6 = 64

export interface CreateCredentialOpts {
  userPublicKey: PublicKey
  issuerSecretKey: number[] | Uint8Array
  issuerDid?: string
  verificationMethod?: string
  encrypt?: boolean
  // Ephemeral Secret Key
  esk?: number[] | Uint8Array
  nbf?: number
  exp?: number
  aud?: string[]
}

function normalizeClaims(claims: Claims) {
  for (const key in claims) {
    let value = String(claims[key]).trim()

    // normalize date to integer format (2000-01-01 > 20000101)
    if (key.toLowerCase().endsWith('date') && value.match(/\d{4}-\d{2}-\d{2}/)) {
      value = value.split('-').join('')
    }

    claims[key] = value
  }
  return claims
}

/**
 * Create new verifiable credential
 */
export async function createVerifiableCredential(claims: Claims, opts: CreateCredentialOpts) {
  claims = normalizeClaims(claims)

  let credentialSubject: Claims = {}

  if (opts.encrypt) {
    credentialSubject.encrypted = await XC20P.encrypt(JSON.stringify(claims), opts.userPublicKey, opts.esk)
  } else {
    credentialSubject = { ...claims }
  }

  const claimsTree = await createClaimsTree(claims)

  const issuerDid = opts.issuerDid ?? DEFAULT_DID
  const verificationMethod = opts.verificationMethod ?? `${issuerDid}#eddsa-bjj`

  const vc: W3CCredential = {
    '@context': [DEFAULT_CONTEXT],
    'type': [DEFAULT_VC_TYPE, CredentialType.AlbusCredential],
    'issuer': issuerDid,
    'issuanceDate': new Date().toISOString(),
    'credentialSubject': credentialSubject,
  }

  // vc.credentialStatus = {
  //   id: 'https://example.edu/status/24',
  //   type: 'CredentialStatusList2017',
  // }

  if (opts?.exp) {
    vc.expirationDate = new Date(opts.exp * 1000).toISOString()
  }

  vc.proof = createCredentialProof({
    rootHash: claimsTree.root,
    signerSecretKey: Uint8Array.from(opts.issuerSecretKey),
    verificationMethod,
  })

  return vc as VerifiableCredential
}

export interface CreatePresentationOpts {
  holderSecretKey: number[] | Uint8Array
  credentials: VerifiableCredential[]
  // By default, all credential fields will be exposed
  exposedFields?: string[]
  // Used for credential decryption
  decryptionKey?: number[] | Uint8Array
  // By default, the challenge is the holder's public key.
  challenge?: Uint8Array
}

/**
 * Create new verifiable presentation
 * @param opts
 */
export async function createVerifiablePresentation(opts: CreatePresentationOpts) {
  const holderKeypair = Keypair.fromSecretKey(Uint8Array.from(opts.holderSecretKey))
  const holderDid = encodeDidKey(holderKeypair.publicKey.toBytes())
  const decryptionKey = opts.decryptionKey ?? holderKeypair.secretKey
  const creds: VerifiableCredential[] = []

  for (const credential of opts.credentials) {
    if (credential.proof.type !== ProofType.BJJSignature2021) {
      console.log(`unsupported signature ${credential.proof.type}`)
      continue
    }

    // decrypt claims if needed
    let claims: Claims = {}
    if ('encrypted' in credential.credentialSubject) {
      try {
        claims = JSON.parse(await XC20P.decrypt(credential.credentialSubject.encrypted, decryptionKey))
      } catch (e) {
        console.log(`Error: unable to decrypt credential (${e})`)
      }
    } else {
      claims = { ...credential.credentialSubject }
    }

    const flattenClaims = flattenObject(claims)
    const claimsTree = await createClaimsTree(claims)
    const exposedClaims: Claims = {}
    const credentialProof: Claims = {}

    for (const field of opts.exposedFields ?? Object.keys(flattenClaims)) {
      if (exposedClaims[field] !== undefined) {
        // skip if already added
        continue
      }
      if (flattenClaims[field] !== undefined) {
        exposedClaims[field] = flattenClaims[field]
        credentialProof[field] = await claimsTree.proof(field)
      }
    }

    // no exposed fields, just skip this credential
    if (Object.keys(exposedClaims).length === 0) {
      continue
    }

    exposedClaims['@proof'] = unflattenObject(credentialProof)

    const cred = {
      ...credential,
      credentialSubject: unflattenObject(exposedClaims),
    }

    creds.push(cred)
  }

  if (creds.length === 0) {
    throw new Error('Not credentials found')
  }

  const vp: W3CPresentation = {
    '@context': [DEFAULT_CONTEXT],
    'type': [DEFAULT_VP_TYPE, PresentationType.AlbusPresentation],
    'issuanceDate': new Date().toISOString(),
    'holder': holderDid,
    'verifiableCredential': creds,
  }

  vp.proof = createPresentationProof({
    signerSecret: holderKeypair.secretKey,
    challenge: opts.challenge,
  })

  return vp as VerifiablePresentation
}

export interface EncryptPresentationOpts {
  pubkey: PublicKey
  esk?: number[] | Uint8Array
}

export async function encryptVerifiablePresentation(vp: VerifiablePresentation, opts: EncryptPresentationOpts) {
  const verifiableCredential = vp.verifiableCredential ?? []
  for (let i = 0; i < verifiableCredential.length; i++) {
    const cred = verifiableCredential[i]!
    if (!('encrypted' in cred.credentialSubject)) {
      try {
        verifiableCredential[i] = {
          ...cred,
          credentialSubject: {
            encrypted: await XC20P.encrypt(
              JSON.stringify(cred.credentialSubject),
              opts.pubkey,
              opts.esk,
            ),
          },
        }
      } catch (e) {
        console.log(`failed to encrypt credential #${i}`)
      }
    } else {
      console.log(`credential #${i} already encrypted`)
    }
  }
  return { ...vp, verifiableCredential }
}

export interface VerifyCredentialOpts {
  decryptionKey?: number[] | Uint8Array
  resolver?: Resolver
}

/**
 * Verify credential
 */
export async function verifyCredential(vc: VerifiableCredential, opts: VerifyCredentialOpts = {}): Promise<VerifiableCredential> {
  const resolver = opts.resolver ?? new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  validateCredentialPayload(vc)

  // decrypt subject if needed
  let credentialSubject = vc.credentialSubject
  if (vc.credentialSubject.encrypted && opts.decryptionKey) {
    try {
      credentialSubject = JSON.parse(await XC20P.decrypt(credentialSubject.encrypted, opts.decryptionKey))
    } catch (e) {
      console.log('failed to decrypt credential subject')
    }
  }

  // @ts-expect-error ...
  const issuerDid = vc.issuer?.id ?? vc.issuer
  const result = await resolver.resolve(issuerDid, { accept: 'application/did+json' })
  if (!result.didDocument?.verificationMethod) {
    throw new Error('invalid issuer verification method')
  }

  let issuerPubkey: Uint8Array | undefined
  for (const vm of result.didDocument.verificationMethod) {
    if (vm.type === VerifyType.EddsaBJJVerificationKey) {
      if (vm.publicKeyBase58) {
        issuerPubkey = base58ToBytes(vm.publicKeyBase58)
      }
    }
  }

  if (!issuerPubkey) {
    throw new Error(`unable to find \`${VerifyType.EddsaBJJVerificationKey}\` verification key`)
  }

  if (!(verifyCredentialProof(vc.proof as CredentialProof, issuerPubkey))) {
    throw new Error('proof verification failed')
  }

  return {
    ...vc,
    credentialSubject,
  }
}

export interface VerifyPresentationOpts {
  // Used to decrypt verifiable credential subject
  decryptionKey?: number[] | Uint8Array
  decryptionRethrow?: boolean
  // By default, the challenge is the holder's public key.
  challenge?: Uint8Array
  resolver?: Resolver
}

/**
 * Verify presentation
 */
export async function verifyPresentation(vp: VerifiablePresentation, opts: VerifyPresentationOpts = {}): Promise<VerifiablePresentation> {
  const resolver = opts.resolver ?? new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  validatePresentationPayload(vp as any)

  // @ts-expect-error ...
  const holderDid = vp.holder?.id ?? vp.holder
  const result = await resolver.resolve(holderDid, { accept: 'application/did+json' })

  let pubKey: Uint8Array | undefined
  for (const vm of result.didDocument?.verificationMethod ?? []) {
    if (vm.type === 'Ed25519VerificationKey2018') {
      if (vm.publicKeyBase58) {
        pubKey = base58ToBytes(vm.publicKeyBase58)
      }
    }
  }

  if (!pubKey) {
    throw new Error('unable to find `Ed25519VerificationKey2018` verification key')
  }

  if (!(verifyPresentationProof(vp.proof as PresentationProof, opts.challenge ?? pubKey))) {
    throw new Error('proof verification failed')
  }

  const verifiableCredential: VerifiableCredential[] = []
  for (const vc of vp.verifiableCredential ?? []) {
    if ('encrypted' in vc.credentialSubject && opts.decryptionKey) {
      try {
        const credentialSubject = JSON.parse(await XC20P.decrypt(vc.credentialSubject.encrypted, opts.decryptionKey))
        verifiableCredential.push({ ...vc, credentialSubject })
      } catch (e) {
        if (opts.decryptionRethrow) {
          throw e
        }
        console.log(`Error: unable to decrypt credential (${e})`)
      }
    } else {
      verifiableCredential.push(vc)
    }
  }

  return { ...vp, verifiableCredential }
}

interface BJJProof extends Proof {
  type: ProofType.BJJSignature2021
  created: number
  verificationMethod?: string
  proofValue: { r8y: string; r8x: string; s: string; ax?: string; ay?: string }
  proofPurpose?: string
}

interface CredentialProof extends BJJProof {
  rootHash: string
}

interface PresentationProof extends BJJProof {
  challenge: string
}

export interface CreateCredentialProof {
  rootHash: bigint
  signerSecretKey: Uint8Array
  verificationMethod: string
  proofPurpose?: string
  extra?: { [key: string]: any }
}

/**
 * Generate BabyJubJub proof for provided credential root hash
 */
export function createCredentialProof(opts: CreateCredentialProof): CredentialProof {
  const signer = Keypair.fromSecretKey(opts.signerSecretKey)
  const signerPubkey = eddsa.prv2pub(signer.secretKey)

  const { R8, S } = eddsa.signPoseidon(signer.secretKey, opts.rootHash)

  if (!eddsa.verifyPoseidon(opts.rootHash, new Signature(R8, S), signerPubkey)) {
    throw new Error('self check on EdDSA signature failed')
  }

  return {
    type: ProofType.BJJSignature2021,
    created: createProofDate(),
    verificationMethod: opts.verificationMethod,
    rootHash: String(opts.rootHash),
    proofValue: {
      ax: String(signerPubkey[0]),
      ay: String(signerPubkey[1]),
      r8x: String(R8[0]),
      r8y: String(R8[1]),
      s: String(S),
    },
    proofPurpose: opts.proofPurpose ?? 'assertionMethod',
    ...opts.extra,
  }
}

export function verifyCredentialProof(proof: CredentialProof, pubKey: Uint8Array) {
  switch (proof.type) {
    case ProofType.BJJSignature2021: {
      // const babyJub = await babyJubPromise
      // const eddsa = await eddsaPromise
      // const a = [babyJub.F.e(proof.proofValue.ax), babyJub.F.e(proof.proofValue.ay)]
      return eddsa.verifyPoseidon(
        BigInt(proof.rootHash),
        new Signature(
          [BigInt(proof.proofValue.r8x), BigInt(proof.proofValue.r8y)],
          BigInt(proof.proofValue.s),
        ),
        babyJub.unpackPoint(pubKey)!,
      )
    }
    default:
      throw new Error(`unsupported credential proof type ${proof.type}`)
  }
}

export interface CreatePresentationProof {
  signerSecret: Uint8Array
  challenge?: Uint8Array
  extra?: { [key: string]: any }
}

export function createPresentationProof(opts: CreatePresentationProof): PresentationProof {
  const signer = Keypair.fromSecretKey(opts.signerSecret)
  const signerPubkey = eddsa.prv2pub(signer.secretKey)

  const challenge = poseidon.hash([
    ffUtils.leBuff2int(opts.challenge ?? signer.publicKey.toBytes()),
  ])
  const { R8, S } = eddsa.signPoseidon(signer.secretKey, challenge)

  if (!eddsa.verifyPoseidon(challenge, new Signature(R8, S), signerPubkey)) {
    throw new Error('self check on EdDSA signature failed')
  }

  return {
    type: ProofType.BJJSignature2021,
    created: createProofDate(),
    challenge: babyJub.F.toString(challenge),
    proofValue: {
      ax: String(signerPubkey[0]),
      ay: String(signerPubkey[1]),
      r8x: String(R8[0]),
      r8y: String(R8[1]),
      s: String(S),
    },
    ...opts.extra,
  }
}

export function verifyPresentationProof(proof: PresentationProof, challenge: Uint8Array) {
  switch (proof.type) {
    case ProofType.BJJSignature2021: {
      // const babyJub = await babyJubPromise
      // const eddsa = await eddsaPromise
      // const poseidon = await poseidonPromise

      if (proof.challenge !== babyJub.F.toString(poseidon.hash([ffUtils.leBuff2int(challenge)]))) {
        throw new Error('presentation verification failed, invalid challenge')
      }

      if (!proof.proofValue.ax || !proof.proofValue.ay) {
        throw new Error('invalid proof')
      }

      return eddsa.verifyPoseidon(babyJub.F.e(proof.challenge), new Signature(
        [
          BigInt(proof.proofValue.r8x),
          BigInt(proof.proofValue.r8y),
        ],
        BigInt(proof.proofValue.s),
      ), [
        BigInt(proof.proofValue.ax),
        BigInt(proof.proofValue.ay),
      ])
    }
    default:
      throw new Error(`unsupported credential proof type ${proof.type}`)
  }
}

export async function createClaimsTree(claims: Claims, nLevels = DEFAULT_CLAIM_TREE_DEPTH) {
  const sto = new InMemoryDB(str2Bytes('albus'))
  const tree = new Merkletree(sto, true, nLevels)

  const flattenClaims = flattenObject(claims)
  const encodeKey = (k: string) => BigInt(Object.keys(flattenClaims).indexOf(k))
  const encodeVal = (s: any) => {
    try {
      return BigInt(s)
    } catch (e) {
      return bytesToBigInt(new TextEncoder().encode(String(s)))
    }
  }

  for (const [key, val] of Object.entries(flattenClaims)) {
    await tree.add(encodeKey(key), encodeVal(val))
  }

  return {
    encodeKey,
    encodeVal,
    root: await tree.root().then(r => r.bigInt()),
    // root: () => tree.root().then(r => r.bigInt()),
    proof: async (key: string) => {
      const encodedKey = encodeKey(key)
      const res = await tree.generateCircomVerifierProof(encodedKey, ZERO_HASH)

      console.log(res)

      return [
        encodedKey,
        ...res.siblings.map(s => s.bigInt()),
      ]
    },
    get: (key: string) => tree.get(encodeKey(key)),
    delete: (key: string) => tree.delete(encodeKey(key)),
    add: (key: string, val: any) => tree.add(encodeKey(key), encodeVal(val)),
    update: (key: string, val: any) => tree.update(encodeKey(key), encodeVal(val)),
  }
}

// Helpers

function flattenObject(obj: Record<string, any>, parentKey?: string) {
  let res: Record<string, any> = {}
  Object.entries(obj).forEach(([key, value]) => {
    const k = parentKey ? `${parentKey}.${key}` : key
    if (typeof value === 'object') {
      res = { ...res, ...flattenObject(value, k) }
    } else {
      res[k] = value
    }
  })
  return res
}

function unflattenObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce((res, k) => {
    k.split('.').reduce(
      (acc, e, i, keys) =>
        acc[e] || (acc[e] = Number.isNaN(Number(keys[i + 1]))
          ? keys.length - 1 === i
            ? obj[k]
            : {}
          : []),
      res,
    )
    return res
  }, {} as any)
}

function createProofDate() {
  // TODO: use utc ?
  return Number(new Date())
}
