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
import log from 'loglevel'
import { initContext } from '@/context'
import * as actions from '@/actions'

const VERSION = import.meta.env.VERSION
const DEFAULT_LOG_LEVEL = import.meta.env.CLI_LOG_LEVEL || 'info'
const DEFAULT_CLUSTER = import.meta.env.CLI_SOLANA_CLUSTER || 'devnet'
const DEFAULT_KEYPAIR = import.meta.env.CLI_SOLANA_KEYPAIR || `${process.env.HOME}/.config/solana/id.json`

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
    const { provider, cluster } = initContext(opts)
    log.info(`# Version: ${VERSION}`)
    log.info(`# Keypair: ${provider.wallet.publicKey}`)
    log.info(`# Cluster: ${cluster}\n`)
  })
  .hook('postAction', (_command: Command) => {
    process.exit()
  })

// ------------------------------------------
// DID
// ------------------------------------------

const did = cli.command('did')

did.command('generate', { isDefault: true })
  .description('Generate new issuer did')
  .action(actions.did.generate)

// ------------------------------------------
// Identity
// ------------------------------------------

const id = cli.command('identity')

id.command('new')
  .description('Create new identity')
  .action(actions.identity.create)

// ------------------------------------------
// Verifiable Credentials
// ------------------------------------------

const vc = cli.command('vc')

vc.command('all', { isDefault: true })
  .description('Show all issued VC`s')
  .option('--owner <PUBKEY>', '(optional) nft owner address')
  .action(actions.vc.showAll)

vc.command('issue')
  .description('Issue new VC')
  .option('--provider <CODE>', 'KYC provider unique code')
  .option('-e,--encrypt', '(optional) Encrypt VC with holder public key')
  .action(actions.vc.issue)

// ------------------------------------------
// Proof Requests
// ------------------------------------------

const request = cli.command('request')

request.command('create')
  .description('Create proof request')
  .requiredOption('--serviceCode <CODE>', 'Service code')
  .requiredOption('--policyCode <CODE>', 'Policy core')
  .option('--expiresIn <SECONDS>', '(optional) Expires in some time duration')
  .action(actions.request.create)

request.command('delete')
  .description('Delete proof request')
  .argument('addr', 'Proof Request address')
  .action(actions.request.remove)

request.command('show')
  .description('Show proof request`s info')
  .argument('<ADDRESS>', 'Proof Request address')
  .action(actions.request.show)

request.command('find')
  .description('Find proof request')
  .requiredOption('--service <CODE>', 'Service provider code')
  .requiredOption('--owner <ADDR>', 'Request creator')
  .requiredOption('--circuit <ADDR>', 'Circuit`s mint')
  .action(actions.request.find)

request.command('all')
  .description('Show all proof requests')
  .option('--service <CODE>', 'Filter by Service provider')
  .option('--circuit <ADDR>', 'Filter by Circuit mint')
  .option('--status <STATUS>', 'Filter by Status')
  .action(actions.request.showAll)

request.command('prove')
  .description('Create a zkp proof for selected proof proof')
  .argument('addr', 'Proof Request address')
  .requiredOption('--vc <ADDR>', 'VC address')
  .option('--force', '(optional) Override existing prove')
  .action(actions.request.proveRequest)

request.command('verify')
  .description('Verify Proof Request')
  .argument('addr', 'Proof Request address')
  .action(actions.request.verifyRequest)

// ------------------------------------------
// Admin Management
// ------------------------------------------

const admin = cli.command('admin')

admin.command('clear')
  .description('Clear all accounts')
  .action(actions.admin.clear)

///
/// Policy Management
///

const adminPolicy = admin.command('policy')
  .description('Policy Management')

adminPolicy.command('all', { isDefault: true })
  .description('Show all policies')
  .action(actions.admin.policy.showAll)

adminPolicy.command('add')
  .description('Add new policy')
  .requiredOption('--code <string>', 'policy code')
  .requiredOption('--name <string>', 'policy name')
  .requiredOption('--serviceCode <string>', 'service code')
  .requiredOption('--circuitCode <string>', 'circuit code')
  .option('-d,--description <string>', '(optional) policy short description')
  .option('-ep,--expirationPeriod <seconds>', '(optional) expiration period')
  .option('-rp,--retentionPeriod <seconds>', '(optional) retention period')
  .option('-r,--rules <rule...>', '(optional) policy rule, format: "index:group:value"')
  .action(actions.admin.policy.add)

///
/// Circuit Management
///

const adminCircuit = admin.command('circuit')
  .description('Circuit Management')

adminCircuit.command('all', { isDefault: true })
  .description('Show all circuits')
  .action(actions.admin.circuit.showAll)

adminCircuit.command('add')
  .description('Add new circuit')
  .argument('code', 'circuit code')
  .requiredOption('--name <NAME>', 'circuit name')
  .option('--description <TEXT>', '(optional) circuit short description')
  .option('--zkey <URI>', '(optional) zkey file uri')
  .option('--wasm <URI>', '(optional) wasm file uri')
  .action(actions.admin.circuit.add)

adminCircuit.command('delete')
  .description('Delete circuit')
  .argument('addr', 'circuit address')
  .action(actions.admin.circuit.remove)

///
/// Request Management
///

const adminRequest = admin.command('request')
  .description('Request Management')

adminRequest.command('find')
  .description('Find user proof requests')
  .argument('userAddr', 'User address')
  .option('--sp <SP_CODE>', '(optional) service code')
  .option('--circuit <CIRCUIT_ADDR>', '(optional) circuit address')
  .action(actions.admin.request.showAll)

adminRequest.command('verify')
  .description('Verify Proof Request')
  .argument('addr', 'Proof Request address')
  .action(actions.admin.request.verifyRequest)

///
/// Service Management
///

const adminService = admin.command('service')
  .description('Service Management')

adminService.command('add')
  .description('Add service provider')
  .requiredOption('--code <CODE>', 'service code')
  .requiredOption('--name <NAME>', 'service name')
  .option('--authority <PUBKEY>', '(optional) service manager authority')
  .action(actions.admin.service.add)

adminService.command('delete')
  .description('Delete service provider')
  .argument('code', 'Service provider`s unique code')
  .action(actions.admin.service.remove)

adminService.command('show')
  .description('Show service provider`s info')
  .argument('addr', 'Service provider PDA`s address')
  .action(actions.admin.service.show)

adminService.command('all')
  .description('Show all service providers')
  .option('--authority', '(optional) filter by authority')
  .action(actions.admin.service.showAll)

cli.command('*', { isDefault: true, hidden: true })
  .action(() => {
    cli.help()
  })

cli.parse()
