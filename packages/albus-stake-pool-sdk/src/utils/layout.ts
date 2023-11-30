import type { Buffer } from 'node:buffer'
import * as BufferLayout from '@solana/buffer-layout'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export class SignedNumberLayout extends BufferLayout.Layout<BN> {
  constructor(span: number, property?: string) {
    super(span, property)
  }

  decode(b: Uint8Array, offset?: number): BN {
    const start = offset ?? 0
    const data = b.slice(start, start + this.span)
    return new BN(data, undefined, 'le').fromTwos(this.span * 8)
  }

  encode(src: BN, b: Uint8Array, offset?: number): number {
    const start = offset ?? 0
    b.set(src.toTwos(this.span * 8).toArray('le'), start)

    return this.span
  }
}

export function u64(property?: string): BufferLayout.Layout<BN> {
  return new SignedNumberLayout(8, property)
}

class WrappedLayout<T, U> extends BufferLayout.Layout<U> {
  private readonly layout: BufferLayout.Layout<T>
  private readonly decoder: (data: T) => U
  private readonly encoder: (src: U) => T

  constructor(
    layout: BufferLayout.Layout<T>,
    decoder: (data: T) => U,
    encoder: (src: U) => T,
    property?: string,
  ) {
    super(layout.span, property)
    this.layout = layout
    this.decoder = decoder
    this.encoder = encoder
  }

  decode(b: Buffer, offset?: number): U {
    return this.decoder(this.layout.decode(b, offset))
  }

  encode(src: U, b: Buffer, offset?: number): number {
    return this.layout.encode(this.encoder(src), b, offset)
  }

  getSpan(b: Buffer, offset?: number): number {
    return this.layout.getSpan(b, offset)
  }
}

export function publicKey(property?: string): BufferLayout.Layout<PublicKey> {
  return new WrappedLayout(
    BufferLayout.blob(32) as any,
    (b: Buffer) => new PublicKey(b),
    (key: PublicKey) => key.toBuffer(),
    property,
  )
}

export function vec<T>(
  elementLayout: BufferLayout.Layout<T>,
  property?: string,
): BufferLayout.Layout<T[]> {
  const length = BufferLayout.u32('length')
  const layout: BufferLayout.Layout<{ values: T[] }> = BufferLayout.struct<any>([
    length,
    BufferLayout.seq(elementLayout, BufferLayout.offset(length, -length.span), 'values'),
  ])
  return new WrappedLayout(
    layout,
    ({ values }) => values,
    values => ({ values }),
    property,
  )
}

export class OptionLayout<T> extends BufferLayout.Layout<T | undefined> {
  private readonly layout: BufferLayout.Layout<T>
  private readonly discriminator: BufferLayout.Layout<number>

  constructor(layout: BufferLayout.Layout<T>) {
    super(layout.span + 1, layout.property)
    this.layout = layout
    this.discriminator = BufferLayout.u8()
  }

  public encode(src: T, b: Uint8Array, offset?: number): number {
    if (src === null || src === undefined) {
      return this.layout.encode(0 as never as T, b, offset)
    }
    this.discriminator.encode(1, b, offset)
    return this.layout.encode(src, b, (offset ?? 0) + 1) + 1
  }

  public decode(b: Uint8Array, offset?: number): T | undefined {
    const discriminator = this.discriminator.decode(b, offset)
    if (!discriminator) {
      return undefined
    }
    return this.layout.decode(b, (offset ?? 0) + 1)
  }
}

export function option<T>(layout: BufferLayout.Layout<T>) {
  return new OptionLayout<T>(layout)
}
