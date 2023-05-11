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

import fs from 'node:fs'
import { Keypair } from '@solana/web3.js'
import { toBigNumber, toMetaplexFile } from '@metaplex-foundation/js'
import chalk from 'chalk'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../../context'
import { downloadFile } from '../../utils'

interface Opts {}

/**
 * Generate new circuit NFT
 */
export async function create(circuitId: string, _opts: Opts) {
  const { metaplex, config } = useContext()

  if (!fs.existsSync(`${config.circuitPath}/${circuitId}.r1cs`)
    || !fs.existsSync(`${config.circuitPath}/${circuitId}.wasm`)) {
    log.error(chalk.red('Unknown circuit, `r1cs` or `wasm` not exists'))
    return
  }

  const r1csInfo = await snarkjs.r1cs.info(`${config.circuitPath}/${circuitId}.r1cs`)
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

  const zKeyFile = { type: 'mem', data: new Uint8Array() }

  await snarkjs.zKey.newZKey(
    `${config.circuitPath}/${circuitId}.r1cs`,
    `${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
    zKeyFile,
  )

  log.info('Exporting verification Key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zKeyFile)

  // NFT generation

  log.info('Uploading zKey file...')
  const zkeyUrl = await metaplex.storage().upload(
    toMetaplexFile(zKeyFile.data, 'circuit.zkey'),
  )
  log.info('Done')
  log.info(`Uri: ${zkeyUrl}`)

  log.info('Uploading wasm file...')
  const wasmUrl = await metaplex.storage().upload(
    toMetaplexFile(fs.readFileSync(`${config.circuitPath}/${circuitId}.wasm`), 'circuit.wasm'),
  )
  log.info('Done')
  log.info(`Uri: ${wasmUrl}`)

  // Mint new Circuit NFT
  await mintNft({ name: 'ALBUS Circuit', code: circuitId, vk, zkeyUrl, wasmUrl })

  process.exit(0)
}

interface MintProps {
  code: string
  name: string
  zkeyUrl: string
  wasmUrl: string
  vk: snarkjs.VK
}

/**
 * Mint new Circuit NFT
 */
async function mintNft(props: MintProps) {
  const { metaplex, config } = useContext()

  const updateAuthority = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: props.name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      circuit_id: props.code,
      wasm_url: props.wasmUrl,
      zkey_url: props.zkeyUrl,
      vk: props.vk,
      attributes: [
        { trait_type: 'code', value: props.code },
      ],
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name: props.name,
      sellerFeeBasisPoints: 0,
      symbol: `${config.nftSymbol}-C`,
      creators: config.nftCreators,
      isMutable: true,
      updateAuthority,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)
}
