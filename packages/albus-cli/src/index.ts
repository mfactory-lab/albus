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

import type { Command } from 'commander'
import { program as cli } from 'commander'
import chalk from 'chalk'
import log from 'loglevel'
import { initContext } from '@/context'
import * as actions from '@/actions'

const VERSION = import.meta.env.VERSION
const DEFAULT_LOG_LEVEL = import.meta.env.CLI_LOG_LEVEL || 'info'
const DEFAULT_CLUSTER = import.meta.env.CLI_SOLANA_CLUSTER || 'devnet'
// eslint-disable-next-line node/prefer-global/process
const DEFAULT_KEYPAIR = import.meta.env.CLI_SOLANA_KEYPAIR || `${process.env.HOME}/.config/solana/id.json`

const originFactory = log.methodFactory
log.methodFactory = function (name, lvl, logger) {
  const originMethod = originFactory(name, lvl, logger)
  const colorMap = {
    warn: chalk.hex('#FFA500'),
    error: chalk.red,
  }
  return (...msg) => colorMap[name] ? originMethod(colorMap[name](...msg)) : originMethod(...msg)
}

cli
  .name('cli')
  .version(VERSION)
  .allowExcessArguments(false)
  .option('-c, --cluster <CLUSTER>', 'solana cluster', DEFAULT_CLUSTER)
  .option('-k, --keypair <KEYPAIR>', 'filepath or URL to a keypair', DEFAULT_KEYPAIR)
  .option('-l, --log-level <LEVEL>', 'log level', (l: any) => l && log.setLevel(l), DEFAULT_LOG_LEVEL)
  .hook('preAction', async (command: Command) => {
    const opts = command.opts() as any
    log.setLevel(opts.logLevel)
    const { provider, cluster, client } = initContext(opts)
    console.log(chalk.dim(`# Version: ${VERSION}`))
    console.log(chalk.dim(`# Program Address: ${client.programId}`))
    console.log(chalk.dim(`# Keypair: ${provider.wallet.publicKey}`))
    console.log(chalk.dim(`# Cluster: ${cluster}`))
    console.log('\n')
  })
  .hook('postAction', (_c: Command) => {
    // eslint-disable-next-line node/prefer-global/process
    process.exit()
  })

const test = cli.command('test')
test.command('credential').action(actions.test.credential)

// ------------------------------------------
// DID
// ------------------------------------------

const did = cli.command('did')
  .description('DID Management')

did.command('generate', { isDefault: true })
  .description('Generate new issuer did')
  .action(actions.did.generate)

// ------------------------------------------
// Identity
// ------------------------------------------

const id = cli.command('id')
  .description('Identity Management')

id.command('new')
  .description('Create new identity')
  .action(actions.identity.create)

// ------------------------------------------
// VC Management
// ------------------------------------------

const vc = cli.command('vc')
  .description('Credential Management')

vc.command('all', { isDefault: true })
  .description('Show all user credentials')
  .option('--owner <pubkey>', '(optional) nft owner address')
  .action(actions.credential.showAll)

vc.command('find')
  .description('Find credentials')
  .action(actions.credential.find)

vc.command('issue')
  .description('Issue new VC')
  .option('--provider <string>', 'KYC provider unique code')
  .option('-e,--encrypt', '(optional) Encrypt VC with holder public key')
  .action(actions.credential.issue)

///
/// Issuer Management
///

const issuer = cli.command('issuer')
  .description('Issuer Management')

issuer.command('all', { isDefault: true })
  .description('Show all issuers')
  .action(actions.issuer.showAll)

issuer.command('show')
  .description('Show issuer data')
  .argument('<address>', 'Issuer address')
  .action(actions.issuer.show)

issuer.command('create')
  .description('Create new issuer')
  .argument('code', 'Issuer code')
  .requiredOption('--name <string>', 'Issuer name')
  .option('--keypair <string>', '(optional) Path to the signer keypair file')
  .option('--description <string>', '(optional) Short description')
  .action(actions.issuer.create)

issuer.command('delete')
  .description('Delete issuer')
  .argument('code', 'issuer code')
  .action(actions.issuer.remove)

///
/// Circuit Management
///

const circuit = cli.command('circuit')
  .description('Circuit Management')

circuit.command('all', { isDefault: true })
  .description('Show all circuits')
  .action(actions.circuit.showAll)

circuit.command('show')
  .description('Show circuit data')
  .argument('<address>', 'Circuit address')
  .action(actions.circuit.show)

circuit.command('generate')
  .description('Generate circuit zkey and vk files')
  .argument('code', 'circuit code')
  .action(actions.circuit.generate)

circuit.command('create')
  .description('Create new circuit')
  .argument('code', 'circuit code')
  .requiredOption('--name <string>', 'circuit name')
  .option('--description <string>', '(optional) circuit short description')
  .option('--zkey <uri>', '(optional) zkey file uri')
  .option('--wasm <uri>', '(optional) wasm file uri')
  .action(actions.circuit.create)

circuit.command('delete')
  .description('Delete circuit')
  .argument('addr', 'circuit address')
  .action(actions.circuit.remove)

///
/// Service Management
///

const service = cli.command('service')
  .description('Service Management')

service.command('create')
  .description('Create new service')
  .requiredOption('--code <string>', 'service code')
  .requiredOption('--name <string>', 'service name')
  .option('--website <string>', '(optional) service website')
  .option('--authority <pubkey>', '(optional) service manager authority')
  .option('-t, --trustee <trustee...>', '(optional) selected trustees')
  .action(actions.service.create)

service.command('update')
  .description('Update service')
  .argument('addr', 'service address')
  .option('--name <string>', 'service name')
  .option('--website <string>', 'service website')
  .option('--secretShareThreshold <pubkey>', 'new Secret Share Threshold')
  .option('--newAuthority <pubkey>', 'new authority')
  .option('-t, --trustees <trustees...>', 'selected trustees')
  .action(actions.service.update)

service.command('delete')
  .description('Delete service provider')
  .argument('code', 'Service provider`s unique code')
  .action(actions.service.remove)

service.command('show')
  .description('Show service provider`s info')
  .argument('addr', 'Service provider PDA`s address')
  .action(actions.service.show)

service.command('all')
  .description('Show all service providers')
  .option('--authority', '(optional) filter by authority')
  .action(actions.service.showAll)

// ------------------------------------------
// Policy Management
// ------------------------------------------

const policy = cli.command('policy')
  .description('Policy Management')

policy.command('all', { isDefault: true })
  .description('Show all policies')
  .option('-s, --serviceCode <string>', 'Filter by service code')
  .option('-s, --circuitCode <string>', 'Filter by circuit code')
  .action(actions.policy.showAll)

policy.command('create')
  .description('Create new policy')
  .requiredOption('--code <string>', 'policy code')
  .requiredOption('--name <string>', 'policy name')
  .requiredOption('--serviceCode <string>', 'service code')
  .requiredOption('--circuitCode <string>', 'circuit code')
  .option('-d,--description <string>', '(optional) policy short description')
  .option('-ep,--expirationPeriod <seconds>', '(optional) expiration period')
  .option('-rp,--retentionPeriod <seconds>', '(optional) retention period')
  .option('-r,--rules <rules...>', '(optional) policy rule, format: "key:value"')
  .action(actions.policy.create)

policy.command('update')
  .description('Update a policy')
  .argument('code', 'policy code')
  .option('-n,--name <string>', 'policy name')
  .option('-d,--description <string>', '(optional) policy short description')
  .option('-ep,--expirationPeriod <seconds>', '(optional) expiration period')
  .option('-rp,--retentionPeriod <seconds>', '(optional) retention period')
  .option('-r,--rules <rules...>', '(optional) policy rule, format: "key:value"')
  .action(actions.policy.update)

policy.command('delete')
  .description('Delete policy')
  .argument('code', 'policy code')
  .action(actions.policy.remove)

// ------------------------------------------
// Trustee Management
// ------------------------------------------

const trustee = cli.command('trustee')
  .description('Trustee Management')

trustee.command('create')
  .description('Create new Trustee')
  .argument('name', 'The name of the trustee')
  .option('--email <string>', '(optional) Email')
  .option('--website <string>', '(optional) Website')
  .option('--keypair <string>', '(optional) Encryption keypair')
  .action(actions.trustee.create)

trustee.command('verify')
  .description('Verify a trustee')
  .argument('addr', 'Trustee address')
  .action(actions.trustee.verify)

trustee.command('show')
  .description('Show all trustees')
  .argument('addr', 'Trustee address')
  .action(actions.trustee.show)

trustee.command('all', { isDefault: true })
  .description('Show all trustees')
  .option('--authority <string>', 'Filter by authority')
  .option('--email <string>', 'Filter by email')
  .option('--name <string>', 'Filter by name')
  .option('--verified', 'Filter by verified')
  .action(actions.trustee.showAll)

// ------------------------------------------
// ProofRequest Management
// ------------------------------------------

const request = cli.command('request')
  .description('Proof Request Management')

request.command('create')
  .description('Create proof request')
  .argument('policy', 'Policy ID. Example: acme_p1')
  .option('-e, --expiresIn <seconds>', '(optional) Expires in some time duration')
  .action(actions.request.create)

request.command('delete')
  .description('Delete proof request')
  .argument('addr', 'Proof Request address')
  .action(actions.request.remove)

request.command('show')
  .description('Show proof request')
  .argument('<address>', 'Proof Request address')
  .action(actions.request.show)

request.command('find', { isDefault: true })
  .description('Find proof requests')
  .option('--serviceCode <string>', '(optional) service code')
  .option('--circuit <pubkey>', '(optional) circuit address')
  .option('--circuitCode <string>', '(optional) circuit code')
  .option('--policy <pubkey>', '(optional) policy address')
  .option('--policyId <string>', '(optional) policy id. Example: acme_age')
  .option('--status <string>', '(optional) status')
  .option('--user <pubkey>', '(optional) user address. Default: current user')
  .action(actions.request.showAll)

request.command('prove')
  .description('Create a zkp proof for selected proof proof')
  .argument('addr', 'Proof Request address')
  .requiredOption('--vc <pubkey>', 'VC address')
  .option('-d, --decryptionKey <keypath>', 'Path to the decryption key')
  .action(actions.request.proveRequest)

request.command('verify')
  .description('Verify Proof Request')
  .argument('<pubkey>', 'Proof Request address')
  .action(actions.request.verifyRequest)

// ------------------------------------------
// Asset Management
// ------------------------------------------

const asset = cli.command('asset')
  .description('Assets')

asset.command('upload')
  .argument('<PATH>', 'Path to the file')
  .description('Upload file')
  .action(actions.asset.uploadFile)

// ------------------------------------------
// Admin Management
// ------------------------------------------

const admin = cli.command('admin')
  .description('Admin Management')

admin.command('fund')
  .description('Fund albus authority balance')
  .action(actions.admin.fund)

admin.command('clear')
  .description('Clear all accounts')
  .option('-at, --accountType <string>', 'Account type: proofRequest,policy,trustee')
  .option('-dr, --dryRun', 'Dry-run mode')
  .action(actions.admin.clear)

admin.command('close')
  .argument('<pubkey>', 'Account address')
  .description('Close and account')
  .action(actions.admin.close)

// ------------------------------------------

cli.command('*', { isDefault: true, hidden: true })
  .action(() => {
    cli.help()
  })

cli.parseAsync().catch((e) => {
  log.error(e)
  if (e.logs) {
    log.error(JSON.stringify(e.logs, null, 2))
  }
  // eslint-disable-next-line node/prefer-global/process
  process.exit()
})
