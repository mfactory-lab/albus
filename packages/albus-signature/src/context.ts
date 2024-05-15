import { CONTEXT_URL } from './index'

export default {
  '@context': {
    '@version': 1.1,
    '@protected': true,

    'albus': `${CONTEXT_URL}#`,
    'cred': 'https://www.w3.org/2018/credentials#',
    'sec': 'https://w3id.org/security#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',

    'AlbusCredentialV1': {
      '@id': 'albus:AlbusCredentialV1',
      '@context': {
        '@version': 1.1,
        '@protected': true,
      },
    },

    'AlbusCredentialProofV1': {
      '@id': 'albus:AlbusCredentialProofV1',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        'id': '@id',
        'type': '@type',
      },
    },

    'AlbusRevocationStatusV1': {
      '@id': 'albus:AlbusRevocationStatusV1',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        'id': '@id',
        'type': '@type',
      },
    },

    'BJJSignature2021': {
      '@id': 'albus:BJJSignature2021',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        'id': '@id',
        'type': '@type',
      },
    },

    'Ed25519VerificationKey2020': {
      '@id': 'https://w3id.org/security#Ed25519VerificationKey2020',
      '@context': {
        '@protected': true,
        'id': '@id',
        'type': '@type',
        'controller': {
          '@id': 'https://w3id.org/security#controller',
          '@type': '@id',
        },
        'revoked': {
          '@id': 'https://w3id.org/security#revoked',
          '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        },
        'publicKeyMultibase': {
          '@id': 'https://w3id.org/security#publicKeyMultibase',
          '@type': 'https://w3id.org/security#multibase',
        },
        'blockchainAccountId': {
          '@id': 'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.jsonld#blockchainAccountId',
          '@type': 'https://w3id.org/security#blockchainAccountId',
        },
      },
    },

    'Ed25519Signature2020': {
      '@id': 'https://w3id.org/security#Ed25519Signature2020',
      '@context': {
        '@protected': true,
        'id': '@id',
        'type': '@type',
        'challenge': 'https://w3id.org/security#challenge',
        'created': {
          '@id': 'http://purl.org/dc/terms/created',
          '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        },
        'domain': 'https://w3id.org/security#domain',
        'expires': {
          '@id': 'https://w3id.org/security#expiration',
          '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        },
        'nonce': 'https://w3id.org/security#nonce',
        'proofPurpose': {
          '@id': 'https://w3id.org/security#proofPurpose',
          '@type': '@vocab',
          '@context': {
            '@protected': true,
            'id': '@id',
            'type': '@type',
            'assertionMethod': {
              '@id': 'https://w3id.org/security#assertionMethod',
              '@type': '@id',
              '@container': '@set',
            },
            'authentication': {
              '@id': 'https://w3id.org/security#authenticationMethod',
              '@type': '@id',
              '@container': '@set',
            },
            'capabilityInvocation': {
              '@id': 'https://w3id.org/security#capabilityInvocationMethod',
              '@type': '@id',
              '@container': '@set',
            },
            'capabilityDelegation': {
              '@id': 'https://w3id.org/security#capabilityDelegationMethod',
              '@type': '@id',
              '@container': '@set',
            },
            'keyAgreement': {
              '@id': 'https://w3id.org/security#keyAgreementMethod',
              '@type': '@id',
              '@container': '@set',
            },
          },
        },
        'proofValue': {
          '@id': 'https://w3id.org/security#proofValue',
          '@type': 'https://w3id.org/security#multibase',
        },
        'verificationMethod': {
          '@id': 'https://w3id.org/security#verificationMethod',
          '@type': '@id',
        },
      },
    },

    // end context
  },
}
