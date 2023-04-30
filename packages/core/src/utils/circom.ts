import fs from 'node:fs'

/**
 * Read circom `sym` file
 * @param {string} path
 * @returns {{signals: any, symbols: any}}
 */
export function readSymbols(path: string) {
  const symbols: any = {}
  const signals: any = {}

  const symsStr = fs.readFileSync(path).toString()
  const lines = symsStr.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const arr = lines[i].split(',')
    if (arr.length !== 4) {
      continue
    }
    const symbol = arr[3]
    const labelIdx = Number(arr[0])
    const varIdx = Number(arr[1])
    const componentIdx = Number(arr[2])
    symbols[symbol] = {
      labelIdx,
      varIdx,
      componentIdx,
    }
    if (signals[varIdx] == null) {
      signals[varIdx] = [symbol]
    } else {
      signals[varIdx].push(symbol)
    }
  }
  return { symbols, signals }
}
