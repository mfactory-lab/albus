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

// ------------------------------------------
// Verified stake pool program
// ------------------------------------------

const stakePool = cli.command('vrf-stake')

stakePool.command('add-validator')
  .description('Add validator to validator`s list')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-sp, --stake-pool <STAKE_POOL>', 'Stake pool address')
  .requiredOption('-s, --stake <STAKE>', 'Stake address')
  .requiredOption('-v, --validator <VALIDATOR>', 'Validator address')
  .requiredOption('-sr, --staker <STAKER>', 'Path to staker keypair file')
  .action(actions.verifiedStakePool.addValidator)

stakePool.command('deposit-sol')
  .description('Add validator to validator`s list')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-sp, --stake-pool <STAKE_POOL>', 'Stake pool address')
  .requiredOption('-r, --referrer <REFERRER>', 'Referrer address')
  .requiredOption('-d, --destination <DESTINATION>', 'Pool tokens` destination address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports to deposit')
  .action(actions.verifiedStakePool.depositSol)

stakePool.command('deposit-stake')
  .description('Add validator to validator`s list')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --stake <STAKE>', 'Stake address')
  .requiredOption('-sp, --stake-pool <STAKE_POOL>', 'Stake pool address')
  .requiredOption('-r, --referrer <REFERRER>', 'Referrer address')
  .requiredOption('-d, --destination <DESTINATION>', 'Pool tokens` destination address')
  .requiredOption('-v, --validator-stake <VALIDATOR_STAKE>', 'Validator stake address')
  .action(actions.verifiedStakePool.depositStake)

stakePool.command('withdraw-sol')
  .description('Add validator to validator`s list')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-sp, --stake-pool <STAKE_POOL>', 'Stake pool address')
  .requiredOption('-s, --source <SOURCE>', 'Pool tokens` source address')
  .requiredOption('-d, --destination <DESTINATION>', 'SOL destination address')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of lamports to withdraw')
  .action(actions.verifiedStakePool.withdrawSol)

stakePool.command('deposit-stake')
  .description('Add validator to validator`s list')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-sp, --stake-pool <STAKE_POOL>', 'Stake pool address')
  .requiredOption('-s, --source <SOURCE>', 'Pool tokens` source address')
  .requiredOption('-sr, --stake-to-receive <STAKE_TO_RECEIVE>', 'Stake to receive address')
  .requiredOption('-ss, --split-stake <SPLIT_STAKE>', 'Stake to split address')
  .requiredOption('-a, --authority <AUTHORITY>', 'User stake authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount of staked lamports to split')
  .action(actions.verifiedStakePool.withdrawStake)

// ------------------------------------------
// Verified swap program
// ------------------------------------------

const swap = cli.command('vrf-swap')

swap.command('deposit-all')
  .description('Deposit all token types')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --swap <SWAP>', 'Swap address')
  .requiredOption('-ma, --maxA <MAX_A>', 'Maximum token A amount')
  .requiredOption('-mb, --maxB <MAX_B>', 'Maximum token B amount')
  .requiredOption('-at, --authority <AUTHORITY>', 'Swap authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Pool token amount')
  .action(actions.verifiedSwap.depositAll)

swap.command('deposit-single')
  .description('Deposit single token type')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --swap <SWAP>', 'Swap address')
  .requiredOption('-mp, --minP <MIN_P>', 'Minimum pool token amount')
  .requiredOption('-t, --token <TOKEN>', 'Token type to deposit')
  .requiredOption('-at, --authority <AUTHORITY>', 'Swap authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Deposit amount')
  .action(actions.verifiedSwap.depositSingle)

swap.command('swap')
  .description('Swap tokens')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --swap <SWAP>', 'Swap address')
  .requiredOption('-m, --min <MIN>', 'Minimum amount out')
  .requiredOption('-t, --tokenIn <TOKEN_IN>', 'Input token type')
  .requiredOption('-at, --authority <AUTHORITY>', 'Swap authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Amount in')
  .action(actions.verifiedSwap.swap)

swap.command('withdraw-all')
  .description('Withdraw all token types')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --swap <SWAP>', 'Swap address')
  .requiredOption('-ma, --minA <MIN_A>', 'Minimum token A amount')
  .requiredOption('-mb, --minB <MIN_B>', 'Minimum token B amount')
  .requiredOption('-at, --authority <AUTHORITY>', 'Swap authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Pool token amount')
  .action(actions.verifiedSwap.withdrawAll)

swap.command('withdraw-single')
  .description('Withdraw single token type')
  .requiredOption('-z, --zkp <ZKP>', 'ZKP request')
  .requiredOption('-s, --swap <SWAP>', 'Swap address')
  .requiredOption('-mp, --maxP <MAX_P>', 'Maximum pool token amount')
  .requiredOption('-t, --token <TOKEN>', 'Token type to withdraw')
  .requiredOption('-at, --authority <AUTHORITY>', 'Swap authority')
  .requiredOption('-a, --amount <AMOUNT>', 'Deposit amount')
  .action(actions.verifiedSwap.withdrawSingle)

cli.parseAsync(process.argv).then(
  () => {},
  (e: unknown) => {
    throw e
  },
)
