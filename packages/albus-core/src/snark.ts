/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, jFactory GmbH
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
 * The developer of this program can be contacted at <info@jfactory.ch>.
 */

import log from 'loglevel'
import fetch from 'node-fetch'
import * as snarkjs from 'snarkjs'

interface GenerateProofProps {
  wasmUrl: string
  zkeyUrl: string
  input?: { [key: string]: number }
}

/**
 * Generates a proof using the `groth16` proof system.
 * @returns {Promise<SNARK>}
 */
export async function generateProof(props: GenerateProofProps) {
  return snarkjs.groth16.fullProve(props.input ?? {}, {
    type: 'mem',
    data: await fetchBytes(props.wasmUrl),
  }, {
    type: 'mem',
    data: await fetchBytes(props.zkeyUrl),
  })
}

/**
 * Fetches bytes from the specified URL using the fetch API.
 */
async function fetchBytes(url: string) {
  log.debug(`Loading file ${url}...`)
  const resp = await fetch(url)
  return new Uint8Array(await resp.arrayBuffer())
}
