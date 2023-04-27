import fs from 'node:fs'
import { toBigNumber, toMetaplexFile } from '@metaplex-foundation/js'
import chalk from 'chalk'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

/**
 * Generate new circuit NFT
 */
export async function create(opts: any) {
  const circuitName = opts.name

  const { metaplex, config } = useContext()

  if (!fs.existsSync(`${config.circuitPath}/${circuitName}.r1cs`)
    || !fs.existsSync(`${config.circuitPath}/${circuitName}.wasm`)) {
    log.error(chalk.red('Unknown circuit'))
    return
  }

  const r1csInfo = await snarkjs.r1cs.info(`${config.circuitPath}/${circuitName}.r1cs`)
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
    `${config.circuitPath}/${circuitName}.r1cs`,
    `${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
    `${config.circuitPath}/${circuitName}.zkey`,
  )

  // log.info('Exporting verification Key...')
  // const vk = await snarkjs.zKey.exportVerificationKey(`${CIRCUITS_PATH}/${circuitName}.zkey`)
  // fs.writeFileSync(`${CIRCUITS_PATH}/vk.json`, JSON.stringify(vk))
  // log.info('Done')

  // NFT generation
  log.info('Uploading zKey file...')
  const zkeyUri = await metaplex.storage().upload(
    toMetaplexFile(fs.readFileSync(`${config.circuitPath}/${circuitName}.zkey`), 'circuit.zkey'),
  )
  log.info('Done')
  log.info(`Uri: ${zkeyUri}`)

  // const verification_key = await metaplex.storage().uploadJson(
  //   toMetaplexFile(Buffer.from(JSON.stringify(vk)), 'vk.json'),
  // )

  log.info('Uploading wasm file...')
  const wasmUri = await metaplex.storage().upload(
    toMetaplexFile(fs.readFileSync(`${config.circuitPath}/${circuitName}.wasm`), 'circuit.wasm'),
  )
  log.info('Done')
  log.info(`Uri: ${wasmUri}`)

  // NFT generation

  const name = 'Age circuit'

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name,
      zkey_url: zkeyUri,
      wasm_url: wasmUri,
      external_url: config.nftExternalUrl,
    })
  log.info('Done')
  log.info(`Metadata uri: ${metadataUri}`)

  log.info('Minting new NFT...')
  const { nft } = await metaplex
    .nfts()
    .create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 0,
      symbol: config.nftSymbol,
      creators: config.nftCreators,
      isMutable: true,
      maxSupply: toBigNumber(1),
    })

  log.info('Done')
  log.info(`Mint: ${nft.address}`)

  process.exit(0)
}
