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

import fs from 'node:fs'
import chalk from 'chalk'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { downloadFile } from '@/utils'
import { useContext } from '@/context'

type Opts = {
  // ...
}

/**
 * Generate circuit `zkey` and `vk` files
 */
export async function generate(circuitId: string, _opts: Opts) {
  const { config } = useContext()

  for (const ext of ['r1cs', 'wasm', 'sym']) {
    if (!fs.existsSync(`${config.circuitPath}/${circuitId}.${ext}`)) {
      log.error(chalk.red(`Invalid circuit, \`${ext}\` file not found`))
      return
    }
  }

  const r1csInfo = await snarkjs.r1cs.info(`${config.circuitPath}/${circuitId}.r1cs`)
  const zKeyFile = { type: 'mem', data: new Uint8Array() }
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

  log.info('Exporting verification Key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zKeyFile)
  fs.writeFileSync(`${config.circuitPath}/${circuitId}.vk.json`, JSON.stringify(vk))

  log.info('Done')
}
