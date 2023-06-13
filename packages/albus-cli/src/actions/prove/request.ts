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

import { PublicKey } from '@solana/web3.js'
import log from 'loglevel'
import * as albus from '@albus/core'
import { useContext } from '../../context'
import { exploreAddress } from '../../utils'
import { mintProofNFT } from './utils'

const { generateProof } = albus.zkp
const { verifyCredential } = albus.vc

interface Opts {
  // Verifiable Credential Address
  vc: string
  // Override if exists
  force?: boolean
}

/**
 * Create proof for ZKP request
 */
export async function createForRequest(addr: string, opts: Opts) {
  const { keypair, client, config } = useContext()

  const reqAddr = new PublicKey(addr)
  const req = await client.loadZKPRequest(reqAddr)

  if (req.proof && opts.force !== true) {
    throw new Error('Proof already exists')
  }

  log.debug('Loading circuit info...')
  const circuit = await client.loadCircuit(req.circuit)

  log.debug(`Loading credential ${opts.vc}...`)
  const cred = await client.loadCredential(opts.vc)

  log.debug('Verifying credential...')
  const { verifiableCredential } = await verifyCredential(cred.payload, {
    decryptionKey: keypair.secretKey,
    audience: config.issuerDid,
  })

  log.debug('Generating proof...')
  const { proof, publicSignals } = await generateProof({
    wasmUrl: circuit.wasmUrl,
    zkeyUrl: circuit.zkeyUrl,
    input: prepareCircuitInput(circuit.id, verifiableCredential.credentialSubject),
  })

  log.debug('Done')
  log.info({ publicSignals })

  log.debug('Minting nft...')
  const nft = await mintProofNFT(req.circuit, proof, publicSignals)

  log.debug('Done')
  log.info(`Mint: ${nft.address}`)
  log.info(exploreAddress(nft.address))

  // Mark zkp-request as proved
  await client.prove({ zkpRequest: reqAddr, proofMint: nft.mint })
}

/**
 * Generate input signals for selected circuit
 * TODO: refactory
 */
function prepareCircuitInput(circuitId: string, payload: Record<string, any>): Record<string, any> {
  switch (circuitId) {
    case 'age': {
      const birthDate = String(payload.birthDate).split('-')
      if (birthDate.length !== 3) {
        throw new Error('Invalid `birthDate` attribute')
      }
      const date = new Date()
      return {
        birthDate,
        currentDate: [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()],
        minAge: 18,
        maxAge: 120,
      }
    }
    case 'europe':
      if (payload.country) {
        throw new Error('Invalid `country` attribute')
      }
      // TODO: convert `payload.country` to country number code
      return {
        country: 123,
      }
  }
  throw new Error(`Invalid circuit ${circuitId}`)
}
