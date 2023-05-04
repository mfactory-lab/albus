import type { Signer } from 'did-jwt'
import { bytesToBase64url, stringToBytes } from './utils'
import { edBabyJubJub } from './zkp'

export function EdDSAPoseidonSigner(secretKey: Uint8Array): Signer {
  const privateKeyBytes: Uint8Array = secretKey
  if (privateKeyBytes.length !== 64) {
    throw new Error(`bad_key: Invalid private key format. Expecting 64 bytes, but got ${privateKeyBytes.length}`)
  }
  return async (data: string | Uint8Array): Promise<any> => {
    const dataBytes: Uint8Array = typeof data === 'string' ? stringToBytes(data) : data
    const signature = await edBabyJubJub.signPoseidon(
      privateKeyBytes.slice(0, 32),
      dataBytes,
    )
    return bytesToBase64url(Uint8Array.from([
      ...signature.s,
      ...signature.r8[0],
      ...signature.r8[1],
    ]))
  }
}
