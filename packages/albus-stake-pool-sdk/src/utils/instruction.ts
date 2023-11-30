import { Buffer } from 'node:buffer'
import type * as BufferLayout from '@solana/buffer-layout'

/**
 * @internal
 */
export type InstructionType<T = any> = {
  /** The Instruction index (from solana upstream program) */
  index: number
  /** The BufferLayout to use to build data */
  layout: BufferLayout.Layout<T>
}

/**
 * Populate a buffer of instruction data using an InstructionType
 * @internal
 */
export function encodeData<T = any>(type: InstructionType<T>, fields?: any): Buffer {
  const allocLength = type.layout.span
  const data = Buffer.alloc(allocLength)
  const layoutFields = Object.assign({ instruction: type.index }, fields)
  type.layout.encode(layoutFields, data)

  return data
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
