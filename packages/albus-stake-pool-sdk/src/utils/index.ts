export * from './layout'
export * from './math'
export * from './program-address'
export * from './stake'
export * from './instruction'

export function arrayChunk<T = any>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}
