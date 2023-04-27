import type { Issuer, JwtCredentialPayload } from 'did-jwt-vc'
import { createVerifiableCredentialJwt, verifyCredential } from 'did-jwt-vc'
import type { ResolverRegistry } from 'did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver } from 'web-did-resolver'
import { ES256KSigner, hexToBytes } from 'did-jwt'
import { useContext } from '../context'

export async function test() {
  const { keypair } = useContext()

  const vcPayload: JwtCredentialPayload = {
    sub: 'did:web:skounis.github.io',
    nbf: 1562950282,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      'type': ['VerifiableCredential'],
      'credentialSubject': {
        givenName: 'Vladyslav',
      },
    },
  }

  // Create a singer by using a private key.
  // const key = '8eb63d435de4d634bc5f3df79c361e9233f55c9c2fca097758eefb018c4c61df'
  const key = 'd43935a06a9f549cb5c0a138170f972ae855610a5a5bb211f6c7e75a5cfc8c73'
  const signer = ES256KSigner(hexToBytes(key))

  const issuer: Issuer = {
    did: 'did:web:albus.finance',
    signer,
    // signer: EdDSASigner(keypair.secretKey),
    // signer: EdDSAPoseidonSigner(keypair.secretKey),
    // alg: 'EdDSA',
  }

  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
  console.log(vcJwt)
  // validateJwtCredentialPayload(vcJwt)
  // Resolve and Verify

  const resolver = new Resolver({
    // Prepare the did:web resolver
    ...getResolver(),
  } as ResolverRegistry)

  // Verify the Credential
  const verifiedVC = await verifyCredential(vcJwt, resolver)
  console.log('//// Verified Credentials:\n', verifiedVC)
}
