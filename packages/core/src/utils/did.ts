import * as u8a from 'uint8arrays'

export function encodeDidKey(publicKey: Uint8Array): string {
  const bytes = new Uint8Array(publicKey.length + 2)
  bytes[0] = 0xED // ed25519 multicodec
  // The multicodec is encoded as a varint, so we need to add this.
  // See js-multicodec for a general implementation
  bytes[1] = 0x01
  bytes.set(publicKey, 2)
  return `did:key:z${u8a.toString(bytes, 'base58btc')}`
}
