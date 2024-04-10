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

import type { Resolvable, ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as WebDidResolver from 'web-did-resolver'
import {
  PublicKey as BabyJubPubkey,
  MultiBase,
  PrivateKey,
  SMT,
  Signature,
  XC20P,
  eddsa,
  poseidon,
  utils,
} from './crypto'
import { CredentialType, PresentationType, ProofType, VerifyType } from './types'
import type { Proof, VerifiableCredential, VerifiablePresentation, W3CCredential, W3CPresentation } from './types'
import { encodeDidKey, validateCredentialPayload, validatePresentationPayload, w3cDate, w3cDateToUnixTs } from './utils'

const { bigintToBytes, base58ToBytes, bytesToBigInt, bytesToString } = utils

// const {
//   suites: { LinkedDataSignature },
//   purposes: { AssertionProofPurpose },
// } = jsigs

type Claims = Record<string, any>

// https://www.w3.org/TR/vc-data-model-2.0
// export const DEFAULT_CONTEXT = 'https://www.w3.org/ns/credentials/v2'
export const DEFAULT_CONTEXT = 'https://www.w3.org/2018/credentials/v1'
export const DEFAULT_VC_TYPE = 'VerifiableCredential'
export const DEFAULT_VP_TYPE = 'VerifiablePresentation'
export const DEFAULT_DID = 'did:web:albus.finance'
export const DEFAULT_CLAIM_TREE_DEPTH = 5 // 2^5-1 = 16 elements

/**
 * Create metadata info from the credential
 * used for generate a claims tree
 */
export function getCredentialMeta(credential: W3CCredential) {
  const meta: Record<string, any> = {
    issuer: encodeClaimValue(typeof credential.issuer === 'string' ? credential.issuer : credential.issuer?.id),
    issuanceDate: w3cDateToUnixTs(credential.issuanceDate),
    validUntil: credential.validUntil ? w3cDateToUnixTs(credential.validUntil) : 0,
    validFrom: credential.validFrom ? w3cDateToUnixTs(credential.validFrom) : 0,
  }
  // the last credential type is used
  const type = credential.type.slice(-1)[0]
  if (![DEFAULT_VC_TYPE, CredentialType.AlbusCredential].includes(type)) {
    meta.type = type
  }
  return meta
}

export type CreateCredentialOpts = {
  issuerDid?: string
  // Signer secret key.
  issuerSecretKey?: number[] | Uint8Array
  verificationMethod?: string
  encrypt?: boolean
  encryptionKey?: PublicKey
  // Optional secret key. Ephemeral secret key used by default
  encryptionSecretKey?: number[] | Uint8Array
  // unix timestamp
  validFrom?: number
  // unix timestamp
  validUntil?: number
  // custom issuance date
  timestamp?: number
  credentialType?: CredentialType
  // suite: typeof LinkedDataSignature
  // documentLoader: any
  // purpose?: any
}

/**
 * Create new verifiable credential
 */
export async function createVerifiableCredential(claims: Claims, opts: CreateCredentialOpts = {}): Promise<VerifiableCredential> {
  const vcType = [DEFAULT_VC_TYPE, CredentialType.AlbusCredential]

  if (opts.credentialType) {
    vcType.push(opts.credentialType)
  }

  const normalizedClaims = normalizeClaims(claims)

  let vc: VerifiableCredential = {
    '@context': [DEFAULT_CONTEXT],
    'type': vcType,
    'issuer': opts.issuerDid ?? DEFAULT_DID,
    'issuanceDate': w3cDate(opts?.timestamp ? new Date(opts.timestamp * 1000) : undefined),
    'credentialSubject': normalizedClaims,
    'proof': undefined,
  }

  // Revocation
  // vc.credentialStatus = {
  //   id: 'did:albus:abc111222333',
  //   type: 'AlbusRevocationStatusV1',
  // }

  if (opts?.validFrom) {
    vc.validFrom = w3cDate(new Date(opts.validFrom * 1000))
  }

  if (opts?.validUntil) {
    vc.validUntil = w3cDate(new Date(opts.validUntil * 1000))
  }

  if (opts.issuerSecretKey) {
    vc = await signCredential(vc, {
      signerSecretKey: Uint8Array.from(opts.issuerSecretKey),
      verificationMethod: opts.verificationMethod,
      controller: String(vc.issuer),
    })
  }

  // TODO: implement jsonld-signatures
  // const { purpose, documentLoader, suite } = opts
  // vc = jsigs.sign(vc, { purpose: purpose ?? new AssertionProofPurpose(), documentLoader, suite })

  if (opts.encrypt) {
    if (!opts.encryptionKey) {
      throw new Error('encryption key is required')
    }
    vc = await encryptCredential(vc, { pubkey: opts.encryptionKey, esk: opts.encryptionSecretKey })
  }

  return vc
}

export type SingCredentialOpts = {
  signerSecretKey: Uint8Array
  verificationMethod: string
  controller?: string
  purpose?: string
  date?: Date
}

/**
 * Sign a verifiable credential with the provided options.
 *
 * @param {W3CCredential} vc - The verifiable credential to sign.
 * @param {SingCredentialOpts} opts - The options for signing the credential.
 * @return {Promise<VerifiableCredential>} The signed verifiable credential.
 */
export async function signCredential(vc: W3CCredential, opts: SingCredentialOpts): Promise<VerifiableCredential> {
  const claimsTree = await createCredentialTree(vc)
  const proof = createCredentialProof({
    msg: claimsTree.root(),
    signerSecretKey: opts.signerSecretKey,
    verificationMethod: opts.verificationMethod,
    controller: opts.controller,
    purpose: opts.purpose,
    date: opts.date,
  })
  return {
    ...vc,
    proof,
  }
}

export type EncryptCredentialOpts = {
  pubkey: PublicKey
  esk?: number[] | Uint8Array
}

/**
 * Encrypts the credential subject of a verifiable credential if it is not already encrypted.
 */
export async function encryptCredential(vc: VerifiableCredential, opts: EncryptCredentialOpts): Promise<VerifiableCredential & {
  credentialSubject: {
    encrypted?: { data: string, key: string }
  }
}> {
  if (vc.credentialSubject?.encrypted !== undefined) {
    return vc
  }
  return {
    ...vc,
    credentialSubject: {
      encrypted: {
        data: await XC20P.encrypt(
          JSON.stringify(vc.credentialSubject),
          opts.pubkey,
          opts.esk,
        ),
        key: opts.pubkey.toBase58(),
      },
    },
  }
}

/**
 * Decrypts the credential subject if needed and returns the updated VerifiableCredential.
 *
 * @param {VerifiableCredential} vc - The VerifiableCredential to decrypt if needed.
 * @param {Uint8Array} secretKey - The secret key used for decryption.
 * @return {Promise<VerifiableCredential>} The VerifiableCredential with decrypted credential subject if needed.
 */
export async function decryptCredentialIfNeeded(vc: VerifiableCredential, secretKey: Uint8Array): Promise<VerifiableCredential> {
  let credentialSubject: Record<string, any> = {}
  if (vc.credentialSubject?.encrypted?.data !== undefined) {
    credentialSubject = JSON.parse(
      await XC20P.decrypt(vc.credentialSubject.encrypted.data, secretKey),
    )
    return { ...vc, credentialSubject }
  }
  return vc
}

export type CreatePresentationOpts = {
  holderSecretKey: ArrayLike<number>
  holderDid?: string
  credentials: VerifiableCredential[]
  challenge: bigint
  date?: string | Date
  presentationType?: string | string[]
}

/**
 * Create new verifiable presentation
 */
export async function createVerifiablePresentation(opts: CreatePresentationOpts) {
  const holderKeypair = Keypair.fromSecretKey(Uint8Array.from(opts.holderSecretKey))
  const holderDid = opts.holderDid ?? encodeDidKey(holderKeypair.publicKey.toBytes())

  if (opts.credentials.length === 0) {
    throw new Error('no credentials provided')
  }

  const vp: W3CPresentation = {
    '@context': [DEFAULT_CONTEXT],
    'type': [
      DEFAULT_VP_TYPE,
      PresentationType.AlbusPresentation,
      ...(opts.presentationType ? [].concat(opts.presentationType) : []),
    ],
    'issuanceDate': w3cDate(opts.date),
    'holder': holderDid,
    'verifiableCredential': opts.credentials,
  }

  return signPresentation(vp, {
    controller: holderDid,
    challenge: opts.challenge,
    signerSecretKey: Uint8Array.from(opts.holderSecretKey),
  })
}

export async function signPresentation(vp: W3CPresentation, opts: {
  verificationMethod?: string
  controller?: string
  challenge: bigint
  signerSecretKey: Uint8Array
}): Promise<VerifiablePresentation> {
  const signer = Keypair.fromSecretKey(opts.signerSecretKey)

  const proof = createCredentialProof({
    controller: opts.controller,
    msg: opts.challenge,
    purpose: 'authentication',
    signerSecretKey: signer.secretKey,
    verificationMethod: opts.verificationMethod,
  })

  return {
    ...vp,
    proof: {
      ...proof,
      challenge: String(opts.challenge),
    },
  }
}

/**
 * Encrypts the verifiable presentation with the given options.
 */
export async function encryptPresentation(vp: VerifiablePresentation, opts: EncryptCredentialOpts) {
  const verifiableCredential = [].concat(vp.verifiableCredential)
  for (let i = 0; i < verifiableCredential.length; i++) {
    verifiableCredential[i] = await encryptCredential(verifiableCredential[i], opts)
  }
  return { ...vp, verifiableCredential }
}

export type VerifyCredentialOpts = {
  decryptionKey?: ArrayLike<number>
  resolver?: Resolvable
}

/**
 * Verifies a verifiable credential by resolving the issuer, decrypting the subject if needed, and validating the proof.
 *
 * @param {VerifiableCredential} vc - The verifiable credential to be verified.
 * @param {VerifyCredentialOpts} opts - Additional options for verifying the credential. Default is an empty object.
 * @return {Promise<VerifiableCredential>} The verified and decrypted verifiable credential.
 */
export async function verifyCredential(vc: VerifiableCredential, opts: VerifyCredentialOpts = {}): Promise<VerifiableCredential> {
  const resolver = opts.resolver ?? new Resolver({
    ...WebDidResolver.getResolver(),
    ...KeyDidResolver.getResolver(),
  } as ResolverRegistry)

  validateCredentialPayload(vc)

  const cred = await decryptCredentialIfNeeded(vc, Uint8Array.from(opts.decryptionKey ?? []))

  // @ts-expect-error ...
  const issuerDid = cred.issuer?.id ?? cred.issuer

  const result = await resolver.resolve(issuerDid, { accept: 'application/did+json' })
  if (!result.didDocument?.verificationMethod) {
    throw new Error('Invalid issuer, no verification methods found')
  }

  let issuerPubkey: Uint8Array | undefined
  for (const vm of result.didDocument.verificationMethod) {
    if (vm.type === VerifyType.BJJVerificationKey2021) {
      if (vm.publicKeyBase58) {
        issuerPubkey = base58ToBytes(vm.publicKeyBase58)
      }
    }
  }

  if (!issuerPubkey) {
    throw new Error(`Unable to find \`${VerifyType.BJJVerificationKey2021}\` verification key`)
  }

  const proof: CredentialProof = [].concat(cred.proof).find(p => p.type === ProofType.BJJSignature2021)

  if (!proof) {
    throw new Error(`Invalid credential proof, only \`${ProofType.BJJSignature2021}\` is supported`)
  }

  if (proof.proofValue[0] !== 'z') {
    throw new Error('Only base58btc multibase encoding is supported.')
  }
  const signatureBytes = base58ToBytes(proof.proofValue.substring(1))
  const signature = Signature.newFromCompressed(signatureBytes.slice(0, 64))

  const claimsTree = await createCredentialTree(cred)

  proof.credentialRoot = claimsTree.root()
  proof.issuerPubkey = BabyJubPubkey.newFromCompressed(issuerPubkey).p
  proof.signature = [...signature.R8, signature.S]

  if (!eddsa.verifyPoseidon(proof.credentialRoot, signature, proof.issuerPubkey)) {
    throw new Error('Proof verification failed')
  }

  return cred
}

export type VerifyPresentationOpts = {
  // Used to decrypt verifiable credential subject
  decryptionKey?: number[] | Uint8Array
  decryptionRethrow?: boolean
  // By default, the challenge is the holder's public key.
  challenge?: Uint8Array
  resolver?: Resolvable
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

  const vm = (result.didDocument?.verificationMethod ?? [])
    .find(vm => vm.type === VerifyType.BJJVerificationKey2021)

  if (!vm) {
    throw new Error(`unable to find ${VerifyType.BJJVerificationKey2021} verification method`)
  }

  if (!(verifyPresentationProof(vp.proof as PresentationProof, base58ToBytes(vm.publicKeyBase58)))) {
    throw new Error('proof verification failed')
  }

  const verifiableCredential: VerifiableCredential[] = []

  // TODO: remove ?
  for (const vc of [].concat(vp.verifiableCredential)) {
    try {
      verifiableCredential.push(await decryptCredentialIfNeeded(vc, Uint8Array.from(opts.decryptionKey)))
    } catch (e) {
      if (opts.decryptionRethrow) {
        throw e
      }
      console.log(`Error: unable to decrypt credential (${e})`)
    }
  }

  return { ...vp, verifiableCredential }
}

type CredentialProof = {
  created: string
  verificationMethod?: string
  proofValue: string
  proofPurpose?: string
} & Proof

type PresentationProof = {
  challenge: string
} & CredentialProof

export type CreateCredentialProof = {
  msg: bigint
  signerSecretKey: Uint8Array
  verificationMethod: string
  controller?: string
  purpose?: string
  date?: Date
}

/**
 * Create credential proof
 */
export function createCredentialProof(opts: CreateCredentialProof): CredentialProof {
  const signer = Keypair.fromSecretKey(opts.signerSecretKey)
  const signerPubkey = new PrivateKey(signer.secretKey).public()

  const { R8, S } = eddsa.signPoseidon(signer.secretKey, opts.msg)
  const signature = new Signature(R8, S)

  if (!eddsa.verifyPoseidon(opts.msg, signature, signerPubkey.p)) {
    throw new Error('Self check on EdDSA signature failed')
  }

  const proofValue = MultiBase.encode(Uint8Array.from([
    ...signature.compress(),
    ...signerPubkey.compress(),
    ...bigintToBytes(opts.msg, 32),
  ]))

  if (!opts.verificationMethod && !opts.controller) {
    throw new Error('Either `verificationMethod` or `controller` must be provided')
  }

  return {
    type: ProofType.BJJSignature2021,
    created: w3cDate(opts.date),
    verificationMethod: opts.verificationMethod ?? `${opts.controller}#${signerPubkey.toBase58()}`,
    proofPurpose: opts.purpose ?? 'assertionMethod',
    proofValue,
  }
}

/**
 * Verifies the credential proof based on the provided credential hash,
 * proof, and public key.
 */
export function verifyCredentialProof(msg: bigint, proof: string, pubKey?: Uint8Array) {
  if (proof[0] !== 'z') {
    throw new Error('Only base58btc multibase encoding is supported.')
  }
  const signatureBytes = base58ToBytes(proof.substring(1))
  const signature = Signature.newFromCompressed(signatureBytes.slice(0, 64))
  const _pubkey = pubKey ?? signatureBytes.slice(64, 96)
  return eddsa.verifyPoseidon(msg, signature, BabyJubPubkey.newFromCompressed(_pubkey).p)
}

/**
 * Verify the presentation proof.
 */
export function verifyPresentationProof(proof: PresentationProof, pubKey?: Uint8Array) {
  switch (proof.type) {
    case ProofType.BJJSignature2021: {
      return verifyCredentialProof(BigInt(proof.challenge), proof.proofValue, pubKey)
    }
    default:
      throw new Error(`unsupported credential proof type ${proof.type}`)
  }
}

/**
 * Creates a credential tree based on the given W3C credential and optional depth.
 */
export async function createCredentialTree(credential: W3CCredential, depth?: number) {
  return createClaimsTree({
    meta: getCredentialMeta(credential),
    ...credential.credentialSubject,
  }, depth)
}

/**
 * Creates a claims tree based on the provided claims object and optional depth.
 *
 * @param {Claims} claims - The claims object to create the tree from.
 * @param {number} [depth] - The optional depth of the tree. If not provided, the default depth will be used.
 * @return An object representing the claims tree with various methods for interacting with it.
 */
export async function createClaimsTree(claims: Claims, depth?: number) {
  const tree = new SMT()
  const flattenClaims = flattenObject(claims)
  const flattenClaimKeys = Object.keys(flattenClaims)
  const encodeKey = (k: string) => BigInt(flattenClaimKeys.indexOf(k))
  const treeDepth = depth ?? DEFAULT_CLAIM_TREE_DEPTH

  const res = {
    root: () => tree.root,
    /**
     * Retrieves a value from the tree based on the provided key.
     */
    get: async (key: string) => {
      const proof = await tree.get(encodeKey(key))
      const siblings = proof.siblings
      while (siblings.length < treeDepth) {
        siblings.push(tree.F.zero)
      }
      return {
        found: proof.found,
        key: proof.key,
        value: proof.value,
        siblings,
      }
    },
    /**
     * Deletes a key from the tree.
     */
    delete: (key: string) => tree.delete(encodeKey(key)),
    /**
     * Adds a key-value pair to the tree.
     */
    add: (key: string, val: any) => tree.add(encodeKey(key), encodeClaimValue(val)),
    /**
     * Updates the value associated with the given key in the tree.
     */
    update: (key: string, val: any) => tree.update(encodeKey(key), encodeClaimValue(val)),
    /**
     * Retrieve ZK information from the given keys.
     */
    zkInfo: async (keys: string[]) => {
      const claimsKey: number[] = []
      const claimsProof: bigint[][] = []
      for (const key of keys) {
        const proof = await res.get(key)
        claimsKey.push(Number(proof.key))
        claimsProof.push(proof.siblings)
      }
      return {
        key: utils.bytesToBigInt(claimsKey.reverse()),
        proof: claimsProof,
      }
    },
  }

  for (const key of flattenClaimKeys) {
    await res.add(key, flattenClaims[key])
  }

  return res
}

/**
 * Encodes a claim value to a BigInt.
 *
 * @param {string | number | bigint} s - The value to encode.
 * @param hash
 * @return {bigint} - The encoded BigInt value.
 */
export function encodeClaimValue(s: string | number | bigint, hash = false): bigint {
  const bytes = new TextEncoder().encode(String(s))
  if (hash) {
    return poseidon.hashBytes(bytes)
  }
  if (bytes.length > 32) {
    // TODO: fixme
    return bytesToBigInt(bytes.slice(0, 32))
    // throw new Error('The maximum size for a claim is limited to 32 bytes.')
  }
  return bytesToBigInt(bytes)
}

/**
 * Decodes a claim value from a BigInt.
 *
 * @param {bigint} s - The bigint to decode.
 * @return {string} The decoded claim value.
 */
export function decodeClaimValue(s: bigint): string {
  return bytesToString(bigintToBytes(s))
}

/**
 * Recursively flattens an object by converting nested properties into a flat structure.
 *
 * @param {Record<string, any>} obj - The object to flatten.
 * @param {string} [parentKey] - The parent key for the nested properties.
 * @return {Record<string, any>} The flattened object.
 */
function flattenObject(obj: Record<string, any>, parentKey?: string): Record<string, any> {
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

// /**
//  * Unflattens an object with dot-separated keys into a nested object.
//  *
//  * @param {Record<string, any>} obj - The flattened object to unflatten
//  * @return {Record<string, any>} The unflattened nested object
//  */
// function unflattenObject(obj: Record<string, any>): Record<string, any> {
//   return Object.keys(obj).reduce((res, k) => {
//     k.split('.').reduce(
//       (acc, e, i, keys) => acc[e] || (acc[e] = Number.isNaN(Number(keys[i + 1]))
//         ? keys.length - 1 === i
//           ? obj[k]
//           : {}
//         : []),
//       res,
//     )
//     return res
//   }, {} as any)
// }

/**
 * Recursively normalizes the claims object by trimming string values and returning a new object with normalized values.
 *
 * @param {Claims} claims - the object containing claims to be normalized
 * @return {Record<string, any>} a new object with normalized claim values
 */
function normalizeClaims(claims: Claims): Record<string, any> {
  const normalizedClaims: Record<string, any> = {}

  for (const key in claims) {
    let value = claims[key]
    if (typeof value === 'object') {
      value = normalizeClaims(value)
    } else {
      value = String(value).trim()
    }
    normalizedClaims[key] = value
  }

  return normalizedClaims
}
