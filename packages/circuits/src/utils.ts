import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Circomkit } from 'circomkit'

export class CircuitHelper {
  private circomkit: Circomkit

  constructor(readonly circuit: string) {
    this.circomkit = new Circomkit({
      protocol: 'groth16',
      circuits: resolve(__dirname, '../circuits.json'),
      dirCircuits: resolve(__dirname, '../circuits'),
      dirBuild: resolve(__dirname, '../circuits/build'),
      dirPtau: resolve(__dirname, '../circuits/ptau'),
      include: [resolve(__dirname, '../node_modules')],
      inspect: false,
    })
  }

  /**
   * Try to set up the given circuit.
   */
  async setup() {
    const circuitPath = `${this.circomkit.config.dirBuild}/${this.circuit}`
    const alreadySetup = existsSync(`${circuitPath}/groth16_vkey.json`) && existsSync(`${circuitPath}/groth16_pkey.zkey`)

    if (!alreadySetup) {
      return this.circomkit.setup(this.circuit)
    }
  }

  /**
   * Load zkey for a given circuit.
   */
  async zkey() {
    return readFileSync(`${this.circomkit.config.dirBuild}/${this.circuit}/groth16_pkey.zkey`)
  }

  /**
   * Load verifying key for a given circuit.
   */
  async vkey() {
    return JSON.parse(readFileSync(`${this.circomkit.config.dirBuild}/${this.circuit}/groth16_vkey.json`).toString())
  }

  /**
   * Load WASM file for the given circuit.
   */
  async wasm() {
    return readFileSync(`${this.circomkit.config.dirBuild}/${this.circuit}/${this.circuit}_js/${this.circuit}.wasm`)
  }

  /**
   * Load signals for a given circuit.
   */
  async info() {
    const info = await this.circomkit.info(this.circuit)
    const symData = readFileSync(`${this.circomkit.config.dirBuild}/${this.circuit}/${this.circuit}.sym`)
    return {
      ...info,
      signals: loadSignals(symData.toString(), info.outputs, info.publicInputs, info.privateInputs),
    }
  }
}

/**
 * Load symbols from {@link symData} and categorize them based on the number
 * of outputs, public inputs, and private inputs.
 */
function loadSignals(symData: string, nOutputs: number, nPubInputs: number, nPrvInputs: number) {
  const signals = loadSymbols(symData, (acc, { idx, name }) => {
    const sig = { ...parseSignal(name.replace('main.', '')), type: '' }
    if (!sig?.name) {
      return
    }
    if (idx <= nOutputs) {
      sig.type = 'output'
    } else if (idx <= nOutputs + nPubInputs) {
      sig.type = 'public'
    } else {
      sig.type = 'private'
    }
    acc[sig.name] = sig
  }, nOutputs + nPubInputs + nPrvInputs)

  return Object.keys(signals)
    .reduce((acc, name) => {
      const sig = signals[name]
      let input = name
      if (sig.size > 0) {
        input += `[${sig.size + 1}]`
        if (sig.next && sig.next.size > 0) {
          input += `[${sig.next.size + 1}]`
        }
      }
      acc[sig.type].push(input)
      return acc
    }, {
      output: [] as string[],
      public: [] as string[],
      private: [] as string[],
    })
}

/**
 * Loads symbols from a string representation into an object.
 */
function loadSymbols<T>(symData: string, apply: (acc: { [key: string]: any }, any: any) => T, limit?: number) {
  return symData.split('\n').slice(0, limit).reduce((acc, line) => {
    const arr = line.split(',')
    if (arr.length >= 4) {
      apply(acc, {
        idx: Number(arr[0]),
        varIdx: Number(arr[1]),
        componentIdx: Number(arr[2]),
        name: String(arr[3]),
      })
    }
    return acc
  }, {})
}

/**
 * Parses a signal string into its name, size, and next signal.
 *
 * @param {string} signal - The signal string to parse.
 * @returns {ParseSignalResult | null} An object containing the name, size, and next signal, or null if the signal is invalid.
 */
function parseSignal(signal: string): ParseSignalResult {
  const open = signal.indexOf('[')
  const close = signal.indexOf(']')
  if (open !== -1 && close !== -1 && open < close) {
    const name = signal.slice(0, open)
    const numberStr = signal.slice(open + 1, close)
    const size = Number.parseInt(numberStr, 10)
    if (!Number.isNaN(size)) {
      const remaining = signal.slice(close + 1)
      return { name, size, next: parseSignal(remaining) }
    }
    return { name, size: 0, next: null }
  }
  return { name: signal, size: 0, next: null }
}

export type ParseSignalResult = {
  name: string
  size: number
  next: ParseSignalResult | null
}

/**
 * Converts ISO 3166-1 alpha-2 country codes to bytes.
 */
export function countryLookup(iso2Codes: string[]) {
  const encoder = new TextEncoder()

  if (iso2Codes.length > 16) {
    throw new Error('countryLookup cannot have more than 16 codes')
  }
  return iso2Codes.reduce((acc, code) => {
    acc.push(...encoder.encode(code))
    return acc
  }, [] as number[])
}
