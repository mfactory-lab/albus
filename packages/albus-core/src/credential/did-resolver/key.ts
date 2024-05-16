import { toString } from 'uint8arrays'
import { edwardsToMontgomeryPub } from '@noble/curves/ed25519'
import type { DIDResolutionOptions, DIDResolutionResult, ParsedDID, Resolvable, ResolverRegistry } from 'did-resolver'
import { MultiBase } from '../../crypto'

const DID_LD_JSON = 'application/did+ld+json'
const DID_JSON = 'application/did+json'

// supported drivers
const prefixToDriverMap = {
  0xED: { keyToDidDoc: ed25519Doc },
  // TODO: other types if needed
  // 0xE7: secp256k1Doc,
  // 0x1200: secp256r1Doc,
  // 0x1201: secp384r1Doc,
  // 0x1202: secp521r1Doc,
}

export function getResolver(): ResolverRegistry {
  return {
    key: async (
      _did: string,
      parsed: ParsedDID,
      _resolver: Resolvable,
      options: DIDResolutionOptions,
    ): Promise<DIDResolutionResult> => {
      const contentType = options.accept || DID_JSON

      const response: DIDResolutionResult = {
        didResolutionMetadata: { contentType },
        didDocument: null,
        didDocumentMetadata: {},
      }

      try {
        const multicodecPubKey = MultiBase.decode(parsed.id)
        const keyType = multicodecPubKey[0]
        const pubKeyBytes = multicodecPubKey.slice(2)
        const doc = await prefixToDriverMap[keyType]?.keyToDidDoc(pubKeyBytes, parsed.id)
        if (!doc) {
          throw new Error('unsupported key type')
        }
        if (contentType === DID_LD_JSON) {
          doc['@context'] = [
            // 'https://w3id.org/did/v1', // doesnt work
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/ed25519-2018/v1',
            'https://w3id.org/security/suites/ed25519-2020/v1',
          ]
          response.didDocument = doc
        } else if (contentType === DID_JSON) {
          response.didDocument = doc
        } else {
          delete response.didResolutionMetadata.contentType
          response.didResolutionMetadata.error = 'representationNotSupported'
        }
      } catch (e) {
        response.didResolutionMetadata.error = 'invalidDid'
        response.didResolutionMetadata.message = e.toString()
      }
      return response
    },
  }
}

export default { getResolver }

/**
 * Constructs the document based on the method key
 */
export function ed25519Doc(pubKeyBytes: Uint8Array, fingerprint: string): any {
  const did = `did:key:${fingerprint}`
  const keyId = `${did}#${fingerprint}`
  const x25519PubBytes = edwardsToMontgomeryPub(pubKeyBytes)
  const x25519KeyId = `${did}#${MultiBase.encode(x25519PubBytes, MultiBase.codec.x25519Pub)}`
  return {
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: 'Ed25519VerificationKey2018',
        controller: did,
        publicKeyBase58: toString(pubKeyBytes, 'base58btc'),
      },
      {
        id: keyId,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: MultiBase.encode(pubKeyBytes, MultiBase.codec.ed25519Pub),
      },
    ],
    authentication: [keyId],
    assertionMethod: [keyId],
    capabilityDelegation: [keyId],
    capabilityInvocation: [keyId],
    keyAgreement: [
      {
        id: x25519KeyId,
        type: 'X25519KeyAgreementKey2019',
        controller: did,
        publicKeyBase58: toString(x25519PubBytes, 'base58btc'),
      },
    ],
  }
}
