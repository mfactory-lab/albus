// import vc from '@digitalbazaar/vc'
//
// export async function createVC(opts: any) {
//   // Generate a new DID and keypair
//   const didKey = new Ed25519KeyPair()
//
//   // Sample unsigned credential
//   const credential = {
//     '@context': [
//       'https://www.w3.org/2018/credentials/v1',
//       'https://www.w3.org/2018/credentials/examples/v1',
//     ],
//     'id': 'https://example.com/credentials/1872',
//     'type': ['VerifiableCredential', 'AlumniCredential'],
//     'issuer': 'https://example.edu/issuers/565049',
//     'issuanceDate': '2010-01-01T19:23:24Z',
//     'credentialSubject': {
//       id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
//       alumniOf: 'Example University',
//     },
//   }
//
//   // Sign the credential using the DID keypair
//   const signedCredential = await vc.issue({
//     credential,
//     suite: new Ed25519Signature2018({
//       key: didKey,
//       date: '2022-03-30T09:00:00Z',
//     }),
//     documentLoader: customLoader, // Optional document loader function
//   })
//
//   // Verify the credential using the DID public key
//   const verificationResult = await vc.verify({
//     credential: signedCredential,
//     suite: new Ed25519Signature2018(),
//     documentLoader: customLoader, // Optional document loader function
//   })
//
//   console.log(verificationResult)
//
//   process.exit(0)
// }
