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

use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake;

declare_id!("8NHcjkbgyuZzcwryaGJ9zf7JRqKfsHipuNDQdhtk9giR");

#[program]
pub mod verified_stake {
    use albus_verifier::check_compliant;
    use anchor_lang::solana_program::program::invoke;

    use super::*;

    pub fn initialize(
        ctx: Context<VerifiedInitialize>,
        authorized: stake::state::Authorized,
        lockup: stake::state::Lockup,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authority.key()),
        )?;

        let ix = stake::instruction::initialize(
            &ctx.accounts.stake.key(),
            &authorized,
            &lockup,
        );

        let account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn initialize_checked(
        ctx: Context<VerifiedInitializeChecked>,
        authorized: stake::state::Authorized,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.withdrawer.key()),
        )?;

        let ix = stake::instruction::initialize_checked(
            &ctx.accounts.stake.key(),
            &authorized,
        );

        let account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            ctx.accounts.staker.to_account_info(),
            ctx.accounts.withdrawer.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn split(
        ctx: Context<VerifiedSplit>,
        lamports: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authorized.key()),
        )?;

        let ixs = stake::instruction::split(
            &ctx.accounts.stake.key(),
            &ctx.accounts.authorized.key(),
            lamports,
            &ctx.accounts.split_stake.key(),
        );

        assert_eq!(ixs.len(), 3);

        let allocate_account_infos = vec![ctx.accounts.split_stake.to_account_info()];

        let assign_account_infos = vec![ctx.accounts.split_stake.to_account_info()];

        let split_account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.split_stake.to_account_info(),
            ctx.accounts.authorized.to_account_info(),
        ];

        let (allocate_ix, assign_ix, split_ix) = (&ixs[0], &ixs[1], &ixs[2]);

        invoke(&allocate_ix, &allocate_account_infos)?;
        invoke(&assign_ix, &assign_account_infos)?;
        invoke(&split_ix, &split_account_infos)?;

        Ok(())
    }

    pub fn merge(
        ctx: Context<VerifiedMerge>,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authorized.key()),
        )?;

        let ixs = stake::instruction::merge(
            &ctx.accounts.destination_stake.key(),
            &ctx.accounts.source_stake.key(),
            &ctx.accounts.authorized.key(),
        );

        assert_eq!(ixs.len(), 1);

        let account_infos = vec![
            ctx.accounts.destination_stake.to_account_info(),
            ctx.accounts.source_stake.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.stake_history.to_account_info(),
            ctx.accounts.authorized.to_account_info(),
        ];

        invoke(&ixs[0], &account_infos)?;

        Ok(())
    }

    pub fn withdraw<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifiedWithdraw<'info>>,
        lamports: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.withdrawer.key()),
        )?;

        let mut account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.stake_history.to_account_info(),
            ctx.accounts.withdrawer.to_account_info(),
        ];

        let mut custodian_pubkey = None;

        if let Some(custodian) = ctx.remaining_accounts.get(0) {
            custodian_pubkey = Some(custodian.key());
            account_infos.push(custodian.to_account_info());
        };

        let ix = stake::instruction::withdraw(
            &ctx.accounts.stake.key(),
            &ctx.accounts.withdrawer.key(),
            &ctx.accounts.destination.key(),
            lamports,
            custodian_pubkey.as_ref(),
        );

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn deactivate(
        ctx: Context<VerifiedDeactivate>,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authorized.key()),
        )?;

        let ix = stake::instruction::deactivate_stake(
            &ctx.accounts.stake.key(),
            &ctx.accounts.authorized.key(),
        );

        let account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.authorized.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn delegate(
        ctx: Context<VerifiedDelegate>,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authorized.key()),
        )?;

        let ix = stake::instruction::delegate_stake(
            &ctx.accounts.stake.key(),
            &ctx.accounts.authorized.key(),
            &ctx.accounts.vote.key(),
        );

        let account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.vote.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.stake_history.to_account_info(),
            ctx.accounts.stake_config.to_account_info(),
            ctx.accounts.authorized.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn redelegate(
        ctx: Context<VerifiedRedelegate>,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.authorized.key()),
        )?;

        let ixs = stake::instruction::redelegate(
            &ctx.accounts.stake.key(),
            &ctx.accounts.authorized.key(),
            &ctx.accounts.vote.key(),
            &ctx.accounts.uninitialized_stake.key(),
        );

        assert_eq!(ixs.len(), 3);

        let allocate_account_infos = vec![ctx.accounts.uninitialized_stake.to_account_info()];

        let assign_account_infos = vec![ctx.accounts.uninitialized_stake.to_account_info()];

        let redelegate_account_infos = vec![
            ctx.accounts.stake.to_account_info(),
            ctx.accounts.uninitialized_stake.to_account_info(),
            ctx.accounts.vote.to_account_info(),
            ctx.accounts.stake_config.to_account_info(),
            ctx.accounts.authorized.to_account_info(),
        ];

        let (allocate_ix, assign_ix, redelegate_ix) = (&ixs[0], &ixs[1], &ixs[2]);

        invoke(&allocate_ix, &allocate_account_infos)?;
        invoke(&assign_ix, &assign_account_infos)?;
        invoke(&redelegate_ix, &redelegate_account_infos)?;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct VerifiedInitialize<'info> {
        /// CHECK:
        pub authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub rent: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedInitializeChecked<'info> {
        /// CHECK:
        pub staker: AccountInfo<'info>,

        /// CHECK:
        pub withdrawer: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub rent: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedSplit<'info> {
        /// CHECK:
        #[account(signer)]
        pub split_stake: AccountInfo<'info>,

        /// CHECK:
        pub authorized: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct VerifiedMerge<'info> {
        /// CHECK:
        #[account(mut)]
        pub destination_stake: AccountInfo<'info>,

        /// CHECK:
        pub authorized: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub source_stake: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub clock: Sysvar<'info, Clock>,
        pub stake_history: Sysvar<'info, StakeHistory>,
    }

    #[derive(Accounts)]
    pub struct VerifiedWithdraw<'info> {
        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub withdrawer: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub clock: Sysvar<'info, Clock>,
        pub stake_history: Sysvar<'info, StakeHistory>,
    }

    #[derive(Accounts)]
    pub struct VerifiedDeactivate<'info> {
        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub authorized: Signer<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub clock: Sysvar<'info, Clock>,
    }

    #[derive(Accounts)]
    pub struct VerifiedDelegate<'info> {
        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub vote: AccountInfo<'info>,

        /// CHECK:
        pub authorized: Signer<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub clock: Sysvar<'info, Clock>,
        pub stake_history: Sysvar<'info, StakeHistory>,

        /// CHECK:
        pub stake_config: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedRedelegate<'info> {
        /// CHECK:
        #[account(mut, signer)]
        pub uninitialized_stake: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub stake: AccountInfo<'info>,

        /// CHECK:
        pub vote: AccountInfo<'info>,

        /// CHECK:
        pub authorized: Signer<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub stake_program: AccountInfo<'info>,
        pub system_program: Program<'info, System>,

        /// CHECK:
        pub stake_config: AccountInfo<'info>,
    }
}
