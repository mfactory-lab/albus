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
import { initContext } from './context'
import * as actions from './actions'

const VERSION = import.meta.env.VERSION
const DEFAULT_LOG_LEVEL = import.meta.env.CLI_LOG_LEVEL || 'info'
const DEFAULT_CLUSTER = import.meta.env.CLI_SOLANA_CLUSTER || 'devnet' // 'https://devnet.rpcpool.com'
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
  .action(actions.vc.showAll)

vc.command('issue')
  .description('Issue new VC')
  .option('--provider <CODE>', 'KYC provider unique code')
  .option('-e,--encrypt', 'Encrypt VC with holder public key')
  .action(actions.vc.issue)

// ------------------------------------------
// Proof Requests
// ------------------------------------------

const request = cli.command('request')

request.command('create')
  .description('Create proof request')
  .requiredOption('--sp <CODE>', 'Service provider`s unique code')
  .requiredOption('--circuit <ADDR>', 'Circuit`s mint')
  .option('--expires-in <SECONDS>', 'Expires in some time duration')
  .action(actions.request.create)

request.command('remove')
  .description('Remove proof request')
  .argument('addr', 'Proof Request address')
  .action(actions.request.remove)

request.command('show')
  .description('Show proof request`s info')
  .argument('<ADDRESS>', 'Proof Request address')
  .action(actions.request.show)

request.command('find')
  .description('Find proof request')
  .requiredOption('--sp <CODE>', 'Service provider address')
  .requiredOption('--owner <ADDR>', 'Request creator')
  .requiredOption('--circuit <ADDR>', 'Circuit`s mint')
  .action(actions.request.find)

request.command('all')
  .description('Show all proof requests')
  .option('--sp <CODE>', 'Filter by Service provider')
  .option('--circuit <ADDR>', 'Filter by Circuit mint')
  .option('--proof <ADDR>', 'Filter by Proof mint')
  .action(actions.request.showAll)

request.command('prove')
  .description('Create a zkp proof for selected proof proof')
  .argument('addr', 'Proof Request address')
  .requiredOption('--vc <ADDR>', 'VC address')
  .option('--force', 'Override existing prove')
  .action(actions.request.proveRequest)

request.command('verify')
  .description('Verify Proof Request')
  .argument('addr', 'Proof Request address')
  .action(actions.request.verifyRequest)

// ------------------------------------------
// Admin Management
// ------------------------------------------

const admin = cli.command('admin')

const adminCircuit = admin.command('circuit')
  .description('Circuit Management')

adminCircuit.command('all', { isDefault: true })
  .description('Show all circuits')
  .action(actions.admin.circuit.showAll)

adminCircuit.command('create')
  .description('Create new circuit NFT')
  .argument('name', 'Circuit name')
  .action(actions.admin.circuit.create)

const adminRequest = admin.command('request')
  .description('Request Management')

adminRequest.command('find')
  .description('Find user proof requests')
  .argument('userAddr', 'User address')
  .option('--sp <SP_CODE>', 'Service provider code')
  .option('--circuit <CIRCUIT_ADDR>', 'Circuit address')
  .action(actions.admin.request.showAll)

adminRequest.command('verify')
  .description('Verify Proof Request')
  .argument('addr', 'Proof Request address')
  .action(actions.admin.request.verifyRequest)

const adminSp = admin.command('sp')
  .description('Service Provider Management')

adminSp.command('add')
  .description('Add service provider')
  .requiredOption('--code <CODE>', 'Service provider`s unique code')
  .requiredOption('--name <NAME>', 'Service provider`s name')
  .action(actions.admin.sp.add)

adminSp.command('remove')
  .description('Remove service provider')
  .argument('code', 'Service provider`s unique code')
  .action(actions.admin.sp.remove)

adminSp.command('show')
  .description('Show service provider`s info')
  .argument('addr', 'Service provider PDA`s address')
  .action(actions.admin.sp.show)

adminSp.command('all')
  .description('Show all service providers')
  .option('--authority', 'Filter by authority')
  .action(actions.admin.sp.showAll)

cli.command('*', { isDefault: true, hidden: true })
  .action(() => {
    cli.help()
  })

cli.parse()
