import { Buffer } from 'node:buffer'
import type { Layout } from '@coral-xyz/borsh'

// import { option } from './layout'

/**
 * @internal
 */
export type InstructionType<T = any> = {
  /** The Instruction index (from solana upstream program) */
  index: number
  /** The BufferLayout to use to build data */
  layout: Layout<T>
}

/**
 * Populate a buffer of instruction data using an InstructionType
 * @internal
 */
export function encodeData<T = any>(type: InstructionType<T>, fields?: any): Buffer {
  const allocLength = type.layout.span
  const data = Buffer.alloc(allocLength < 0 ? 1024 : allocLength)
  const layoutFields = Object.assign({ instruction: type.index }, fields)
  const offset = type.layout.encode(layoutFields, data)
  return Buffer.from(new Uint8Array(data.buffer).slice(0, offset))
}

/**
 * Decode instruction data buffer using an InstructionType
 * @internal
 */
export function decodeData<T = any>(type: InstructionType<T>, buffer: Buffer): any {
  let data: any
  try {
    data = type.layout.decode(buffer)
  } catch (err) {
    throw new Error(`invalid instruction; ${err}`)
  }

  if (data.instruction !== type.index) {
    throw new Error(
      `invalid instruction; instruction index mismatch ${data.instruction} != ${type.index}`,
    )
  }

  return data
}
