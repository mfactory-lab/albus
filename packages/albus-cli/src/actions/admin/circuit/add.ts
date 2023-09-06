/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

import type { Buffer } from 'node:buffer'
import fs from 'node:fs'
import axios from 'axios'
import chalk from 'chalk'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { downloadFile } from '@/utils'
import { useContext } from '@/context'

interface Opts {
  name: string
  description?: string
  wasm?: string
  zkey?: string
}

/**
 * Create new Circuit
 */
export async function add(circuitId: string, opts: Opts) {
  const { metaplex, client, config } = useContext()

  for (const ext of ['r1cs', 'wasm', 'sym']) {
    if (!fs.existsSync(`${config.circuitPath}/${circuitId}.${ext}`)) {
      log.error(chalk.red(`Invalid circuit, \`${ext}\` file not found`))
      return
    }
  }

  const r1csInfo = await snarkjs.r1cs.info(`${config.circuitPath}/${circuitId}.r1cs`)
  const zKeyFile = { type: 'mem', data: new Uint8Array() }

  let zkeyUri: string
  if (!opts.zkey) {
    const power = Math.ceil(Math.log2(r1csInfo.nVars)).toString().padStart(2, '0')

    // Download PowersOfTau from Hermez
    if (!fs.existsSync(`${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`)) {
      log.info(`Downloading powersOfTau with power ${power} from Hermez`)
      await downloadFile(
        `https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${power}.ptau`,
        `${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
      )
    }

    log.info('Generating keys...')

    await snarkjs.zKey.newZKey(
      `${config.circuitPath}/${circuitId}.r1cs`,
      `${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
      zKeyFile,
    )

    fs.writeFileSync(`${config.circuitPath}/${circuitId}.zkey`, zKeyFile.data)
    // return

    // log.info('Uploading zKey file...')
    // zkeyUri = await metaplex.storage().upload(toMetaplexFile(zKeyFile.data, 'circuit.zkey'))
    // log.info('Done')
    // log.info(`Uri: ${zkeyUri}`)
  } else {
    zkeyUri = opts.zkey
    zKeyFile.data = await fetchBytes(opts.zkey)
  }

  // let wasmUri: string
  // if (!opts.wasm) {
  //   const wasmFile = fs.readFileSync(`${config.circuitPath}/${circuitId}.wasm`)
  //   log.info('Uploading wasm file...')
  //   wasmUri = await metaplex.storage().upload(toMetaplexFile(wasmFile, 'circuit.wasm'))
  //   log.info('Done')
  //   log.info(`Uri: ${wasmUri}`)
  // } else {
  //   wasmUri = opts.wasm
  // }

  log.info('Exporting verification Key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zKeyFile)
  fs.writeFileSync(`${config.circuitPath}/${circuitId}.vk.json`, JSON.stringify(vk))

  // log.info('Loading signals...')
  // const symFile = fs.readFileSync(`${config.circuitPath}/${circuitId}.sym`)
  // const signals = loadSignals(symFile.toString(), r1csInfo.nPubInputs, r1csInfo.nPrvInputs)
  //
  // log.info('Creating circuit...')
  // const { signature } = await client.circuit.create({
  //   code: circuitId,
  //   name: opts.name,
  //   description: opts.description,
  //   privateSignals: signals.private,
  //   publicSignals: signals.public,
  //   wasmUri,
  //   zkeyUri,
  // })
  //
  // log.info('Done')
  // log.info(`Signature: ${signature}`)
  //
  // log.info('Updating VK...')
  // const { signatures } = await client.circuit.updateVk({ code: circuitId, vk })
  // log.info('Done')
  // log.info(signatures)
}

/**
 * Fetches bytes from the specified {@link url}
 */
async function fetchBytes(url: string | Buffer | Uint8Array) {
  if (typeof url === 'string') {
    const { data } = await axios<ArrayBuffer>({ method: 'get', url, responseType: 'arraybuffer' })
    return new Uint8Array(data)
  }
  return Uint8Array.from(url)
}

function loadSignals(symData: string, nPubInputs: number, nPrvInputs: number) {
  const signals = loadSymbols(symData, (acc, { idx, name }) => {
    const m = name.match(/^main\.(\w+)(?:\[(\d+)\])?$/)
    const signal = m[1]
    if (!acc[signal]) {
      acc[signal] = { private: idx > nPubInputs, size: 1 }
    } else {
      acc[signal].size += 1
    }
  }, nPubInputs + nPrvInputs)

  return Object.keys(signals).reduce((acc, name) => {
    const sig = signals[name]
    acc[sig.private ? 'private' : 'public'].push(sig.size > 1 ? `${name}[${sig.size}]` : name)
    return acc
  }, { public: [] as string[], private: [] as string[] })
}

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
