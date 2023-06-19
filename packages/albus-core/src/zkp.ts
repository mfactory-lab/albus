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

import { Buffer } from 'node:buffer'
import axios from 'axios'
import type { PublicSignals, SnarkjsProof, VK } from 'snarkjs'
import { groth16 } from 'snarkjs'

type Input = Parameters<typeof groth16.fullProve>[0]

interface GenerateProofProps {
  wasmFile: string | Buffer
  zkeyFile: string | Buffer
  input?: Input
  logger?: unknown
}

/**
 * Generates a proof using the `groth16` proof system.
 * @returns {Promise<SNARK>}
 */
export async function generateProof(props: GenerateProofProps) {
  const wasmFile = Buffer.isBuffer(props.wasmFile) ? Uint8Array.from(props.wasmFile) : await fetchBytes(props.wasmFile)
  const zkeyFile = Buffer.isBuffer(props.zkeyFile) ? Uint8Array.from(props.zkeyFile) : await fetchBytes(props.zkeyFile)
  return groth16.fullProve(
    props.input ?? {},
    { type: 'mem', data: wasmFile },
    { type: 'mem', data: zkeyFile },
    props.logger,
  )
}

interface VerifyProofProps {
  vk: VK
  publicInput?: PublicSignals
  proof: SnarkjsProof
  logger?: unknown
}

/**
 * Verify ZKP Proof
 */
export async function verifyProof(props: VerifyProofProps) {
  return groth16.verify(props.vk, props.publicInput ?? [], props.proof, props.logger)
}

/**
 * Fetches bytes from the specified URL using the fetch API.
 */
async function fetchBytes(url: string) {
  const { data } = await axios<ArrayBuffer>({ method: 'get', url, responseType: 'arraybuffer' })
  return new Uint8Array(data)
}
