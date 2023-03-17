import type { Command } from 'commander'
import { program as cli } from 'commander'
import log from 'loglevel'
import { version } from '../package.json'
import * as actions from './actions'
import { initContext } from './context'

const DEFAULT_LOG_LEVEL = 'info'
const DEFAULT_CLUSTER = 'devnet' // 'https://devnet.rpcpool.com'
const DEFAULT_KEYPAIR = `${process.env.HOME}/.config/solana/id.json`

cli
  .version(version)
  .allowExcessArguments(false)
  .option('-c, --cluster <CLUSTER>', 'Solana cluster', DEFAULT_CLUSTER)
  .option('-k, --keypair <KEYPAIR>', 'Filepath or URL to a keypair', DEFAULT_KEYPAIR)
  .option('-l, --log-level <LEVEL>', 'Log level', (l: any) => l && log.setLevel(l), DEFAULT_LOG_LEVEL)
  .hook('preAction', async (command: Command) => {
    const opts = command.opts() as any
    log.setLevel(opts.logLevel)
    const { provider, cluster } = initContext(opts)
    log.info(`# CLI version: ${version}`)
    log.info(`# Keypair: ${provider.wallet.publicKey}`)
    log.info(`# Cluster: ${cluster}`)
  })

cli.command('create')
  .description('Create new circuit NFT')
  .requiredOption('--name <NAME>', 'Circuit name')
  .action(actions.createCircuit)

cli.command('prove')
  .description('Generate new proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .option('--input <PATH>', 'Input file path')
  .action(actions.generateProof)

cli.command('verify')
  .description('Verify proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .requiredOption('--proof <PROOF_MINT>', 'Proof mint address')
  .action(actions.verifyProof)

cli.parseAsync(process.argv).then(
  () => {},
  (e: unknown) => {
    throw e
  },
)
