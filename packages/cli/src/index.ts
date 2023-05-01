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

// Identity

const id = cli.command('identity')

id.command('new')
  .description('Create new identity')
  .action(actions.identity.create)

// Verifiable Credentials

const vc = cli.command('vc')

vc.command('all')
  .description('Show all VCs')
  .action(actions.vc.showAll)

vc.command('issue')
  .description('Issue new VC')
  .option('--provider <CODE>', 'KYC provider unique code')
  .option('-e,--encrypt', 'Encrypt VC with holder public key')
  .action(actions.vc.issue)

vc.command('test')
  .action(actions.vc.test)

// Circuit

const circuit = cli.command('circuit')

circuit.command('create')
  .description('Create new circuit NFT')
  .requiredOption('--name <NAME>', 'Circuit name')
  .action(actions.circuit.create)

// Proving

const prove = cli.command('prove')

prove.command('create')
  .description('Create new proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .option('--input <PATH>', 'Input file path')
  .action(actions.prove.create)

prove.command('request')
  .description('Create prove for ZKP Request')
  .argument('req', 'ZKP Request address')
  .requiredOption('--vc <VC_ADDR>', 'VC address')
  .option('--force', 'Override existing prove')
  .action(actions.prove.createForRequest)

// Verification

const verify = cli.command('verify')

verify.command('proof')
  .description('Verify proof')
  .requiredOption('--circuit <CIRCUIT_MINT>', 'Circuit mint address')
  .requiredOption('--proof <PROOF_MINT>', 'Proof mint address')
  .action(actions.verify.verifyProof)

verify.command('request')
  .description('Verify ZKP Request')
  .argument('req', 'ZKP Request address')
  .action(actions.verify.verifyRequest)

cli.parseAsync(process.argv).then(
  () => {},
  (e: unknown) => {
    throw e
  },
)
