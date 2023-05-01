import fs from 'node:fs'
import { Keypair } from '@solana/web3.js'
import { toBigNumber, toMetaplexFile } from '@metaplex-foundation/js'
import chalk from 'chalk'
import log from 'loglevel'
import * as snarkjs from 'snarkjs'
import { useContext } from '../context'
import { downloadFile } from '../utils'

interface Opts {
  // Circuit identifier
  id: string
}

/**
 * Generate new circuit NFT
 */
export async function create(opts: Opts) {
  const circuitId = opts.id

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

  const zKeyFile = `${config.circuitPath}/${circuitId}.zkey`

  await snarkjs.zKey.newZKey(
    `${config.circuitPath}/${circuitId}.r1cs`,
    `${config.circuitPath}/powersOfTau28_hez_final_${power}.ptau`,
    zKeyFile,
  )

  log.info('Exporting verification Key...')
  const vk = await snarkjs.zKey.exportVerificationKey(zKeyFile)
  // fs.writeFileSync(`${CIRCUITS_PATH}/vk.json`, JSON.stringify(vk))
  // log.info('Done')

  // NFT generation

  log.info('Uploading zKey file...')
  const zkeyUrl = await metaplex.storage().upload(
    toMetaplexFile(fs.readFileSync(`${config.circuitPath}/${circuitId}.zkey`), 'circuit.zkey'),
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
  await mintNft({ name: 'ALBUS Circuit', id: circuitId, vk, zkeyUrl, wasmUrl })

  process.exit(0)
}

/**
 * Mint new Circuit NFT
 */
async function mintNft(props: { id: string; name: string; vk: snarkjs.VK; zkeyUrl: string; wasmUrl: string }) {
  const { metaplex, config } = useContext()

  const updateAuthority = Keypair.fromSecretKey(Uint8Array.from(config.issuerSecretKey))

  log.info('Uploading NFT metadata...')
  const { uri: metadataUri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: props.name,
      image: config.logoUrl,
      external_url: config.nftExternalUrl,
      circuit_id: props.id,
      wasm_url: props.wasmUrl,
      zkey_url: props.zkeyUrl,
      vk: props.vk,
      attributes: [
        { trait_type: 'id', value: props.id },
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
