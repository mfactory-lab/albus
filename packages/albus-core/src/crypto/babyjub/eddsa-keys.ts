import { base58ToBytes, bytesToBase58, bytesToHex, hexToBytes } from '../utils'
import { babyJub } from './babyjub'
import { eddsa } from './eddsa'

export class Signature {
  R8: [bigint, bigint]
  S: bigint

  constructor(r8: [bigint, bigint], s: bigint) {
    this.R8 = r8
    this.S = s
  }

  static newFromCompressed(buf: Uint8Array): Signature {
    if (buf.length !== 64) {
      throw new Error('buf must be 64 bytes')
    }
    const sig = eddsa.unpackSignature(buf)
    if (sig.R8 == null) {
      throw new Error('unpackSignature failed')
    }
    return new Signature(sig.R8, sig.S as bigint)
  }

  compress(): Uint8Array {
    return eddsa.packSignature(this)
  }

  toString(): string {
    return this.compress().toString()
  }

  toBase58(): string {
    return bytesToBase58(this.compress())
  }

  toHex(): string {
    return bytesToHex(this.compress())
  }
}

export class PublicKey {
  p: [bigint, bigint]

  constructor(p: [bigint, bigint]) {
    this.p = p
  }

  static newFromCompressed(buf: Uint8Array): PublicKey {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes')
    }
    // const bufLE = utils.swapEndianness(buf);
    const p = babyJub.unpackPoint(Uint8Array.from(buf))
    if (p == null) {
      throw new Error('unpackPoint failed')
    }
    return new PublicKey(p)
  }

  static newFromHex(hexStr: string): PublicKey {
    const buff = hexToBytes(hexStr)
    return PublicKey.newFromCompressed(buff)
  }

  static newFromBase58(str: string): PublicKey {
    return PublicKey.newFromCompressed(base58ToBytes(str))
  }

  compress(): Uint8Array {
    // return utils.swapEndianness(babyJub.packPoint(this.p));
    return babyJub.packPoint(this.p)
  }

  toString(): string {
    return this.compress().toString()
  }

  toBase58(): string {
    return bytesToBase58(this.compress())
  }

  toHex(): string {
    return bytesToHex(this.compress())
  }

  verifyPoseidon(msg: bigint, sig: Signature): boolean {
    return eddsa.verifyPoseidon(msg, sig, this.p)
  }
}

export class PrivateKey {
  sk: Uint8Array

  constructor(buf: Uint8Array) {
    // if (buf.length !== 32) {
    //   throw new Error('buf must be 32 bytes')
    // }
    this.sk = buf
  }

  static newFromHex(str: string): PrivateKey {
    return new PrivateKey(hexToBytes(str))
  }

  static newFromBase58(str: string): PrivateKey {
    return new PrivateKey(base58ToBytes(str))
  }

  toString(): string {
    return this.sk.toString()
  }

  toBase58(): string {
    return bytesToBase58(this.sk)
  }

  toHex(): string {
    return bytesToHex(this.sk)
  }

  public(): PublicKey {
    return new PublicKey(eddsa.prv2pub(this.sk))
  }

  signPoseidon(msg: bigint): Signature {
    const s = eddsa.signPoseidon(this.sk, msg)
    return new Signature(s.R8, s.S)
  }
}
