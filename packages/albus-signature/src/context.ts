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
    'JsonSchema2023': {
      '@id': 'https://www.w3.org/ns/credentials#JsonSchema2023',
      '@context': {
        '@version': 1.1,
        '@protected': true,
        'id': '@id',
      },
    },
  },
}
