import type { Command } from 'commander'
import { program as cli } from 'commander'
import log from 'loglevel'
import pkg from '../package.json'
import { initContext } from './context'
import * as actions from './actions'

const DEFAULT_LOG_LEVEL = 'info'
const DEFAULT_CLUSTER = 'devnet' // 'https://devnet.rpcpool.com'
const DEFAULT_KEYPAIR = `${process.env.HOME}/.config/solana/id.json`

cli
  .version(pkg.version)
  .allowExcessArguments(false)
  .option('-c, --cluster <CLUSTER>', 'Solana cluster', DEFAULT_CLUSTER)
  .option('-k, --keypair <KEYPAIR>', 'Filepath or URL to a keypair', DEFAULT_KEYPAIR)
  .option('-l, --log-level <LEVEL>', 'Log level', (l: any) => l && log.setLevel(l), DEFAULT_LOG_LEVEL)
  .hook('preAction', async (command: Command) => {
    const opts = command.opts() as any
    log.setLevel(opts.logLevel)
    const { provider, cluster } = initContext(opts)
    log.info(`# CLI version: ${pkg.version}`)
    log.info(`# Keypair: ${provider.wallet.publicKey}`)
    log.info(`# Cluster: ${cluster}`)
  })

// Test

const test = cli.command('test')
test.command('e').action(actions.test.encryption)

// Identity

const id = cli.command('identity')

id.command('create')
  .description('Create new use identity')
  .action(actions.identity.create)

// Verifiable Credentials

const vc = cli.command('vc')

vc.command('test')
  .action(actions.vc.test)

// Issuer

const kyc = cli.command('issuer')

kyc.command('generate')
  .description('Issue new Verifiable Credential')
  .action(actions.issuance.issueVerifiableCredential)

// ZKP

cli.command('create')
  .description('Create new circuit NFT')
  .requiredOption('--name <NAME>', 'Circuit name')
  .action(actions.circuit.create)

cli.command('prove')
  .description('Generate new proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .option('--input <PATH>', 'Input file path')
  .action(actions.prove.generateProof)

cli.command('verify')
  .description('Verify proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .requiredOption('--proof <PROOF_MINT>', 'Proof mint address')
  .action(actions.verify.verifyProof)

cli.parseAsync(process.argv).then(
  () => {},
  (e: unknown) => {
    throw e
  },
)
