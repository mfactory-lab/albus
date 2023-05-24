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
    log.info(`# Cluster: ${cluster}\n`)
  })

// ------------------------------------------
// Verified transfer program
// ------------------------------------------

const transfer = cli.command('vrf-transfer')

transfer.command('transfer')
  .description('Transfer SOL')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .action(actions.verifiedTransfer.transfer)

transfer.command('spl-transfer')
  .description('Transfer spl tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

// ------------------------------------------
// Verified stake program
// ------------------------------------------

const stake = cli.command('vrf-stake')

stake.command('authorize')
  .description('Authorize stake')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --stake <STAKE>', 'Stake address')
  .requiredOption('-n, --new-authorized <NEW_AUTHORIZED>', 'New authorized address')
  .requiredOption('-a, --authorized <AUTHORIZED>', '`w` for withdrawer authority, default - staker authority')
  .action(actions.verifiedTransfer.transfer)

stake.command('authorize-checked')
  .description('Authorize stake checked')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

stake.command('transfer')
  .description('Transfer SOL')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .action(actions.verifiedTransfer.transfer)

stake.command('spl-transfer')
  .description('Transfer spl tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

stake.command('transfer')
  .description('Transfer SOL')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .action(actions.verifiedTransfer.transfer)

stake.command('spl-transfer')
  .description('Transfer spl tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

stake.command('transfer')
  .description('Transfer SOL')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .action(actions.verifiedTransfer.transfer)

stake.command('spl-transfer')
  .description('Transfer spl tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

stake.command('spl-transfer')
  .description('Transfer spl tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-r, --receiver <RECEIVER>', 'Receiver address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports')
  .requiredOption('-m, --mint <MINT>', 'Token mint address')
  .action(actions.verifiedTransfer.splTransfer)

cli.parseAsync(process.argv).then(
  () => {},
  (e: unknown) => {
    throw e
  },
)
