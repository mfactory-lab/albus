import fs from 'node:fs'
import log from 'loglevel'
import snarkjs from 'snarkjs'
import { downloadFile } from './utils'

type CircuitId = string

interface Circuit {
  id: CircuitId
  inputSignals: string[]
}

export class CircuitManager {
  circuitPath: string
  registry: Map<CircuitId, Circuit> = new Map()

  constructor(readonly opts: any) {
    this.circuitPath = opts.circuitPath
  }

  addCircuit(circuit: Circuit) {
    this.registry.set(circuit.id, circuit)
  }

  deleteCircuit(id: CircuitId) {
    this.registry.delete(id)
  }

  private checkCircuit(id: CircuitId) {
    const circuit = this.registry.get(id)
    if (!circuit) {
      throw new Error(`Unknown circuit ${id}`)
    }
  }

  /**
   * Get r1cs info
   */
  async r1csInfo(id: CircuitId) {
    this.checkCircuit(id)
    return snarkjs.r1cs.info(`${this.circuitPath}/${id}.r1cs`)
  }

  /**
   * Get ptau file path
   */
  async getPtauFile(nVars: number) {
    const power = Math.ceil(Math.log2(nVars)).toString().padStart(2, '0')
    const file = `${this.circuitPath}/powersOfTau28_hez_final_${power}.ptau`

    if (!fs.existsSync(file)) {
      log.info(`Downloading powersOfTau with power ${power} from Hermez`)
      await downloadFile(
        `https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${power}.ptau`,
        `${this.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
      )
    }

    return file
  }

  async newZKey(id: CircuitId, ptauName: string) {
    this.checkCircuit(id)
    const zKeyFile = `${this.circuitPath}/${id}.zkey`
    return snarkjs.zKey.newZKey(
      `${this.circuitPath}/${id}.r1cs`,
      ptauName,
      zKeyFile,
    )
  }

  async exportVerificationKey(zKeyFile: string) {
    return snarkjs.zKey.exportVerificationKey(zKeyFile)
  }
}
