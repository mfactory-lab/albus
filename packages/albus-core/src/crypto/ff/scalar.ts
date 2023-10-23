const hexLen = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]

export const e = fromString
export const zero = BigInt(0)
export const one = BigInt(1)

export function fromString(s: string, radix?: number): bigint {
  if (!radix || radix === 10) {
    return BigInt(s)
  } else if (radix === 16) {
    if (s.slice(0, 2) === '0x') {
      return BigInt(s)
    } else {
      return BigInt(`0x${s}`)
    }
  }

  throw new Error('Unsupported radix')
}

export function fromArray(a: Uint8Array, r: number) {
  let acc = BigInt(0)
  const radix = BigInt(r)
  for (let i = 0; i < a.length; i++) {
    acc = acc * radix + BigInt(a[i])
  }
  return acc
}

export function bitLength(a: bigint): number {
  const aS = a.toString(16)
  return (aS.length - 1) * 4 + hexLen[Number.parseInt(aS[0], 16)]
}

export function isNegative(a: bigint): boolean {
  return BigInt(a) < BigInt(0)
}

export function isZero(a: bigint) {
  return a === zero
}

export function shiftLeft(a: bigint, n: bigint): bigint {
  return a << n
}

export function shiftRight(a: bigint, n: bigint): bigint {
  return a >> n
}

export const shl = shiftLeft
export const shr = shiftRight

export function isOdd(a: bigint): boolean {
  return (a & one) === one
}

export function naf(n: bigint): number[] {
  let E = n
  const res = []
  while (E) {
    if (E & one) {
      const z = 2 - Number(E % BigInt(4))
      res.push(z)
      E = E - BigInt(z)
    } else {
      res.push(0)
    }
    E = E >> one
  }
  return res
}

export function bits(n: bigint): number[] {
  let E = n
  const res = []
  while (E) {
    if (E & one) {
      res.push(1)
    } else {
      res.push(0)
    }
    E = E >> one
  }
  return res
}

export function toNumber(s: bigint): number {
  if (s > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Number too big')
  }
  return Number(s)
}

export function toArray(s: bigint, r: bigint): number[] {
  const res = []
  let rem = s
  const radix = r
  while (rem) {
    res.unshift(Number(rem % radix))
    rem = rem / radix
  }
  return res
}

export function add(a: bigint, b: bigint): bigint {
  return a + b
}

export function sub(a: bigint, b: bigint): bigint {
  return a - b
}

export function neg(a: bigint): bigint {
  return -a
}

export function mul(a: bigint, b: bigint): bigint {
  return a * b
}

export function square(a: bigint): bigint {
  return a * a
}

export function pow(a: bigint, b: bigint): bigint {
  return a ** b
}

export function exp(a: bigint, b: bigint): bigint {
  return a ** b
}

export function abs(a: bigint): bigint {
  return a >= 0 ? a : -a
}

export function div(a: bigint, b: bigint): bigint {
  return a / b
}

export function mod(a: bigint, b: bigint): bigint {
  return a % b
}

export function eq(a: bigint, b: bigint): boolean {
  return a === b
}

export function neq(a: bigint, b: bigint): boolean {
  return a !== b
}

export function lt(a: bigint, b: bigint): boolean {
  return a < b
}

export function gt(a: bigint, b: bigint): boolean {
  return a > b
}

export function leq(a: bigint, b: bigint): boolean {
  return a <= b
}

export function geq(a: bigint, b: bigint): boolean {
  return a >= b
}

export function band(a: bigint, b: bigint): bigint {
  return a & b
}

export function bor(a: bigint, b: bigint): bigint {
  return a | b
}

export function bxor(a: bigint, b: bigint): bigint {
  return a ^ b
}

export function land(a: bigint, b: bigint): bigint {
  return a && b
}

export function lor(a: bigint, b: bigint): bigint {
  return a || b
}

// Returns a buffer with Little Endian Representation
export function toRprLE(buff: Uint8Array, o: number, e: bigint, n8: number): void {
  const s = `0000000${e.toString(16)}`
  const v = new Uint32Array(buff.buffer, buff.byteOffset + o, n8 / 4)
  const l = (((s.length - 7) * 4 - 1) >> 5) + 1 // Number of 32bit words;
  for (let i = 0; i < l; i++) {
    v[i] = Number.parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16)
  }
  for (let i = l; i < v.length; i++) {
    v[i] = 0
  }
  for (let i = v.length * 4; i < n8; i++) {
    buff[i] = toNumber(band(shiftRight(e, BigInt(i * 8)), BigInt(0xFF)))
  }
}

// Returns a buffer with Big Endian Representation
export function toRprBE(buff: Uint8Array, o: number, e: bigint, n8: number): void {
  const s = `0000000${e.toString(16)}`
  const v = new DataView(buff.buffer, buff.byteOffset + o, n8)
  const l = (((s.length - 7) * 4 - 1) >> 5) + 1 // Number of 32bit words;
  for (let i = 0; i < l; i++) {
    v.setUint32(
      n8 - i * 4 - 4,
      Number.parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16),
      false,
    )
  }

  // todo: check this
  for (let i = 0; i < n8 / 4 - l; i++) {
    v.setInt32(0, 0, false)
  }
}

// Passes a buffer with Little Endian Representation
export function fromRprLE(buff: Uint8Array, o: number, n8?: number): bigint {
  n8 = n8 || buff.byteLength
  o = o || 0
  const v = new Uint32Array(buff.buffer, buff.byteOffset + o, n8 / 4)
  const a = Array.from({ length: n8 / 4 })
  v.forEach((ch, i) => (a[a.length - i - 1] = ch.toString(16).padStart(8, '0')))
  return fromString(a.join(''), 16)
}

// Passes a buffer with Big Endian Representation
export function fromRprBE(buff: Uint8Array, o: number, n8: number): bigint {
  n8 = n8 || buff.byteLength
  o = o || 0
  const v = new DataView(buff.buffer, buff.byteOffset + o, n8)
  const a = Array.from({ length: n8 / 4 })
  for (let i = 0; i < n8 / 4; i++) {
    a[i] = v
      .getUint32(i * 4, false)
      .toString(16)
      .padStart(8, '0')
  }
  return fromString(a.join(''), 16)
}

export function toString(a: bigint, radix = 10): string {
  return a.toString(radix)
}

export function toLEBuff(a: bigint): Uint8Array {
  const buff = new Uint8Array(Math.floor((bitLength(a) - 1) / 8) + 1)
  toRprLE(buff, 0, a, buff.byteLength)
  return buff
}
