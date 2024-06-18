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
import * as WebDidResolver from 'web-did-resolver'
import jsigs from 'jsonld-signatures'
import { PublicKey as BabyJubPubkey, MultiBase, PrivateKey, Signature, XC20P, eddsa, utils } from '../crypto'
import { encodeDidKey, w3cDate } from '../utils'
import type { Proof, VerifiableCredential, VerifiablePresentation, W3CCredential, W3CPresentation } from './types'
import { CredentialType, PresentationType, ProofType, VerifyType } from './types'
import { normalizeClaims, validateCredentialPayload, validatePresentationPayload } from './utils'
import { DEFAULT_CONTEXT, DEFAULT_VC_TYPE, DEFAULT_VP_TYPE } from './constants'
import { albusDidResolver, keyDidResolver } from './did-resolver'
import { Ed25519Signature2020, Ed25519VerificationKey2020 } from './crypto'
import { securityLoader } from './documentLoader'
import { createCredentialTree } from './tree'
import type { AlbusResolverOpts } from './did-resolver/albus'

const { base58ToBytes } = utils

export { AlbusResolverOpts }
export * from './tree'
export * from './pex'

export function defaultDocumentLoader() {
  return securityLoader()
}

/**
 * Create new verifiable credential
 */
export async function createVerifiableCredential(claims: Record<string, any>, opts: CreateCredentialOpts = {}): Promise<VerifiableCredential> {
  const normalizedClaims = normalizeClaims(claims)

  let vc: W3CCredential = {
    '@context': [DEFAULT_CONTEXT, { '@vocab': 'https://schema.org/' }, ...(opts.context ?? [])],
    'type': [DEFAULT_VC_TYPE, CredentialType.AlbusCredential, ...(opts.credentialType ? [opts.credentialType] : [])],
    'issuer': opts.issuerDid,
    'issuanceDate': w3cDate(opts?.timestamp ? new Date(opts.timestamp * 1000) : undefined),
    'credentialSubject': normalizedClaims,
  }

  // TODO: Revocation
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
    vc = await encryptCredential(<VerifiableCredential>vc, { pubkey: opts.encryptionKey, esk: opts.encryptionSecretKey })
  }

  return <VerifiableCredential>vc
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
    msg: claimsTree.root,
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

/**
 * Encrypts the credential subject of a verifiable credential if it is not already encrypted.
 */
export async function encryptCredential(vc: VerifiableCredential, opts: EncryptCredentialOpts): Promise<VerifiableCredential & {
  credentialSubject: {
    encrypted?: string
  }
}> {
  // Already encrypted
  if (vc.credentialSubject?.encrypted !== undefined) {
    return vc
  }
  return {
    ...vc,
    credentialSubject: {
      encrypted: [
        await XC20P.encrypt(
          JSON.stringify(vc.credentialSubject),
          opts.pubkey.toBytes(),
          opts.esk,
        ),
        opts.pubkey.toBase58(),
      ].join('.'),
    },
  }
}

/**
 * Decrypts the credential subject if needed and returns the updated VerifiableCredential.
 *
 * @param {VerifiableCredential} vc - The VerifiableCredential to decrypt if needed.
 * @param {Uint8Array} secretKey - The secret key used for decryption.
 * @param {Uint8Array} epk - Optional ephemeral public key used for decryption.
 * @return {Promise<VerifiableCredential>} The VerifiableCredential with decrypted credential subject if needed.
 */
export async function decryptCredentialIfNeeded(vc: VerifiableCredential, secretKey: Uint8Array, epk?: Uint8Array): Promise<VerifiableCredential> {
  let credentialSubject: Record<string, any> = {}
  if (vc.credentialSubject?.encrypted !== undefined) {
    credentialSubject = JSON.parse(
      await XC20P.decrypt(String(vc.credentialSubject.encrypted).split('.')[0], secretKey, epk),
    )
    return { ...vc, credentialSubject }
  }
  return vc
}

/**
 * Decrypts a verifiable presentation with the given options.
 *
 * @param {VerifiablePresentation} vp - The verifiable presentation to decrypt.
 * @param {DecryptPresentationOpts} opts - The options for decryption.
 * @return {Promise<VerifiablePresentation>} The decrypted verifiable presentation.
 */
export async function decryptPresentation(vp: VerifiablePresentation, opts: DecryptPresentationOpts): Promise<VerifiablePresentation> {
  const verifiableCredential: VerifiableCredential[] = []
  for (const vc of [].concat(vp.verifiableCredential)) {
    try {
      verifiableCredential.push(await decryptCredentialIfNeeded(vc, Uint8Array.from(opts.decryptionKey), opts.epk))
    } catch (e) {
      if (opts.throwOnError) {
        throw e
      }
    }
  }
  return { ...vp, verifiableCredential }
}

/**
 * Creates a verifiable presentation.
 */
export async function createVerifiablePresentation(opts: CreatePresentationOpts) {
  const holderKeypair = Keypair.fromSecretKey(Uint8Array.from(opts.holderSecretKey))
  const holderDid = opts.holderDid ?? encodeDidKey(holderKeypair.publicKey.toBytes())

  if (opts.credentials.length === 0) {
    throw new Error('no credentials provided')
  }

  let vp: W3CPresentation = {
    '@context': [
      DEFAULT_CONTEXT,
      {
        AlbusPresentation: 'albus:AlbusPresentation',
      },
    ],
    'type': [
      DEFAULT_VP_TYPE,
      PresentationType.AlbusPresentation,
      ...(opts.type ? [].concat(opts.type) : []),
    ],
    'holder': holderDid,
    'verifiableCredential': opts.credentials,
  }

  vp = await signPresentation(vp, {
    controller: holderDid,
    challenge: opts.challenge ?? holderKeypair.publicKey.toBase58(),
    signerSecretKey: Uint8Array.from(opts.holderSecretKey),
  })

  if (opts.encrypt) {
    if (!opts.encryptionKey) {
      throw new Error('encryption key is required')
    }
    vp = await encryptPresentation(vp, {
      pubkey: opts.encryptionKey,
      esk: opts.encryptionSecretKey,
    })
  }

  return <VerifiablePresentation>vp
}

/**
 * Signs a verifiable presentation.
 */
export async function signPresentation(vp: W3CPresentation, opts: SignPresentationOpts): Promise<VerifiablePresentation> {
  const signer = Keypair.fromSecretKey(opts.signerSecretKey)
  const publicKeyMultibase = MultiBase.encode(signer.publicKey.toBytes(), MultiBase.codec.ed25519Pub)
  const privateKeyMultibase = MultiBase.encode(signer.secretKey, MultiBase.codec.ed25519Priv)

  const documentLoader = opts.documentLoader ?? defaultDocumentLoader().build()

  const purpose = new jsigs.purposes.AuthenticationProofPurpose({
    challenge: opts.challenge,
  })

  const suite = new Ed25519Signature2020({
    key: await Ed25519VerificationKey2020.from({
      controller: opts.controller,
      publicKeyMultibase,
      privateKeyMultibase,
    }),
  })

  return jsigs.sign(vp, { documentLoader, purpose, suite })
}

/**
 * Encrypts the verifiable presentation with the given options.
 */
export async function encryptPresentation(vp: W3CPresentation, opts: EncryptCredentialOpts) {
  const verifiableCredential = [].concat(vp.verifiableCredential)
  for (let i = 0; i < verifiableCredential.length; i++) {
    verifiableCredential[i] = await encryptCredential(verifiableCredential[i], opts)
  }
  return { ...vp, verifiableCredential }
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
    ...keyDidResolver(),
    ...albusDidResolver(opts.albusResolver),
  } as ResolverRegistry)

  validateCredentialPayload(vc)

  const cred = await decryptCredentialIfNeeded(vc, Uint8Array.from(opts.decryptionKey ?? []))

  // @ts-expect-error this is a valid syntax
  const issuerDid = cred.issuer?.id ?? cred.issuer

  const result = await resolver.resolve(issuerDid, { accept: 'application/did+json' })

  if (result?.didResolutionMetadata?.error !== undefined) {
    throw new Error(`${result.didResolutionMetadata.error}. ${result.didResolutionMetadata.message}`)
  }

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
  const pubKey = BabyJubPubkey.newFromCompressed(issuerPubkey).p

  const claimsTree = await createCredentialTree(cred)

  if (!eddsa.verifyPoseidon(claimsTree.root, signature, pubKey)) {
    throw new Error('Proof verification failed')
  }

  proof.issuerPubkey = pubKey.map(String)
  proof.signature = [...signature.R8, signature.S].map(String)

  return cred
}

/**
 * Verify presentation
 */
export async function verifyPresentation(vp: VerifiablePresentation, opts: VerifyPresentationOpts = {}) {
  validatePresentationPayload(vp as any)

  let challenge = opts.challenge
  if (!challenge) {
    const proofs: Proof[] = [].concat(vp.proof)
    challenge = proofs[0].challenge
  }

  const documentLoader = opts.documentLoader ?? defaultDocumentLoader().build()
  const purpose = new jsigs.purposes.AuthenticationProofPurpose({ challenge })
  const suite = new Ed25519Signature2020()

  return jsigs.verify(vp, { purpose, documentLoader, suite })
}

/**
 * Parse credential proof.
 */
export function parseCredentialProof(proofValue: string) {
  if (proofValue[0] !== 'z') {
    throw new Error('Only base58btc multibase encoding is supported.')
  }

  const bytes = base58ToBytes(proofValue.substring(1))
  const signature = Signature.newFromCompressed(bytes.slice(0, 64))
  const issuerPubkey = BabyJubPubkey.newFromCompressed(bytes.slice(64, 96))

  return {
    signature: [...signature.R8, signature.S],
    issuerPubkey: issuerPubkey.p,
  }
}

/**
 * Create credential proof.
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

export type IDocumentLoader = (url: string) => Promise<{
  contextUrl?: string
  documentUrl?: string
  document: any
}>

export type CreateCredentialOpts = {
  issuerDid?: string
  // Signer secret key.
  issuerSecretKey?: number[] | Uint8Array
  verificationMethod?: string
  encrypt?: boolean
  encryptionKey?: PublicKey
  // Optional secret key. Ephemeral secret key used by default
  encryptionSecretKey?: Uint8Array
  // unix timestamp
  validFrom?: number
  // unix timestamp
  validUntil?: number
  // custom issuance date
  timestamp?: number
  credentialType?: CredentialType | string
  context?: string[] | object[]
  // suite: typeof LinkedDataSignature
  // documentLoader: any
  // purpose?: any
}

export type SingCredentialOpts = {
  signerSecretKey: Uint8Array
  verificationMethod: string
  controller?: string
  purpose?: string
  date?: Date
}

export type EncryptCredentialOpts = {
  // Public key used for encryption
  pubkey: PublicKey
  // Optional secret key. Ephemeral secret key used by default
  esk?: Uint8Array
}

export type CreatePresentationOpts = {
  holderSecretKey: ArrayLike<number>
  credentials: VerifiableCredential[]
  // Optional DID of the holder, default did:key
  holderDid?: string
  encrypt?: boolean
  encryptionKey?: PublicKey
  // Optional secret key. Ephemeral secret key used by default
  encryptionSecretKey?: Uint8Array
  challenge?: string
  date?: string | Date
  type?: string | string[]
}

export type VerifyCredentialOpts = {
  decryptionKey?: ArrayLike<number>
  resolver?: Resolvable
  albusResolver?: AlbusResolverOpts
}

export type SignPresentationOpts = {
  challenge: string
  signerSecretKey: Uint8Array
  verificationMethod?: string
  controller?: string
  documentLoader?: IDocumentLoader
}

export type DecryptPresentationOpts = {
  decryptionKey?: number[] | Uint8Array
  throwOnError?: boolean
  // Optional public key. Ephemeral public key used by default
  epk?: Uint8Array
}

export type VerifyPresentationOpts = {
  // By default, the challenge is the holder's public key.
  challenge?: string
  documentLoader?: IDocumentLoader
}

type CredentialProof = {
  created: string
  verificationMethod?: string
  proofValue: string
  proofPurpose?: string
} & Proof

export type CreateCredentialProof = {
  msg: bigint
  signerSecretKey: Uint8Array
  verificationMethod: string
  controller?: string
  purpose?: string
  date?: Date
}
