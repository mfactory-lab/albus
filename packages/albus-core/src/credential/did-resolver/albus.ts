import type { DIDDocument, DIDResolutionResult, DIDResolver, ParsedDID } from 'did-resolver'
import type { AccountInfo, Cluster } from '@solana/web3.js'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { PublicKey as BJJPubkey, MultiBase } from '../../crypto'
import { bytesToBigInt } from '../../crypto/utils'
import { VerifyType } from '../types'

const SERVICE_ENDPOINT = 'https://albus.finance/'
const DEFAULT_CLUSTER = 'mainnet-beta'

enum AccountType {
  Issuer = 'issuer',
}

/**
 * Albus DID resolver.
 */
export function getResolver(): Record<string, DIDResolver> {
  async function resolve(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {
    const params = new URLSearchParams(parsed.query)

    const connection = new Connection(
      clusterApiUrl((params.get('cluster') ?? DEFAULT_CLUSTER) as Cluster),
      'confirmed',
    )

    let err = null
    const didDocumentMetadata = {}
    let didDocument: DIDDocument | null = null

    try {
      const id = parsed.id.split(':')
      if (id.length < 2) {
        throw new Error('Invalid DID')
      }
      switch (id[0]) {
        case AccountType.Issuer: {
          const accountInfo = await connection.getAccountInfo(new PublicKey(id[1]))
          if (!accountInfo) {
            throw new Error('Invalid issuer account')
          }
          didDocument = generateDidDocument({ ...parseIssuer(accountInfo), controller: did })
          break
        }
        default:
          throw new Error(`Unsupported account type ${id[0]}`)
      }
    } catch (error: any) {
      err = `resolver_error: ${error}`
    }

    const contentType
      = typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'

    return {
      didDocument,
      didDocumentMetadata,
      didResolutionMetadata: err
        ? {
            error: 'notFound',
            message: err,
          }
        : { contentType },
    }
  }

  return { albus: resolve }
}

/**
 * Parses the issuer information from the provided account info.
 *
 * @param {AccountInfo<Buffer>} accountInfo - The account information containing issuer data.
 * @return {object} An object containing the parsed pubkey and zkPubkey.
 */
function parseIssuer(accountInfo: AccountInfo<Buffer>) {
  const discriminator = accountInfo.data.subarray(0, 8)
  if (!discriminator.equals(Buffer.from([216, 19, 83, 230, 108, 53, 80, 14]))) {
    throw new Error('Invalid issuer discriminator')
  }
  const pubkey = Uint8Array.from(accountInfo.data.subarray(8, 40))
  const zkPubkey = Uint8Array.from(accountInfo.data.subarray(40, 104))
  return { pubkey, zkPubkey }
}

/**
 * Generates a DID (Decentralized Identifier) document based on the provided public key,
 * BJJ public key, and controller.
 *
 * @param {object} opts
 * @param {Uint8Array} opts.pubkey - The public key used in the DID document generation.
 * @param {Uint8Array} opts.zkPubkey - The BJJ public key used in the DID document generation.
 * @param {string} opts.controller - The controller of the DID.
 * @return {DIDDocument} The generated DID document.
 */
function generateDidDocument(opts: { pubkey: Uint8Array, zkPubkey: Uint8Array, controller: string }): DIDDocument {
  const { pubkey, zkPubkey, controller } = opts
  const publicKeyMultibase = MultiBase.encode(pubkey, MultiBase.codec.ed25519Pub)

  const publicKeyBJJ = new BJJPubkey([
    bytesToBigInt(zkPubkey.slice(0, 32)),
    bytesToBigInt(zkPubkey.slice(32, 64)),
  ]).toBase58()

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
        serviceEndpoint: SERVICE_ENDPOINT,
      },
    ],
  }
}
