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

declare_id!("8NHcjkbgyuZzcwryaGJ9zf7JRqKfsHipuNDQdhtk9giR");

#[program]
pub mod verified_swap {
    use albus_verifier::check_compliant;
    use anchor_lang::solana_program::program::invoke;

    use super::*;

    pub fn swap<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifiedSwap<'info>>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.user_transfer_authority.key()),
        )?;

        let mut account_infos = vec![
            ctx.accounts.swap.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.user_transfer_authority.to_account_info(),
            ctx.accounts.source.to_account_info(),
            ctx.accounts.swap_source.to_account_info(),
            ctx.accounts.swap_destination.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.pool_fee.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ];

        let mut host_fee_pubkey = None;

        if let Some(host_fee) = ctx.remaining_accounts.get(0) {
            host_fee_pubkey = Some(host_fee.key());
            account_infos.push(host_fee.to_account_info());
        };

        let ix = spl_token_swap::instruction::swap(
            &ctx.accounts.spl_token_swap_program.key(),
            &ctx.accounts.token_program.key(),
            &ctx.accounts.swap.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.user_transfer_authority.key(),
            &ctx.accounts.source.key(),
            &ctx.accounts.swap_source.key(),
            &ctx.accounts.swap_destination.key(),
            &ctx.accounts.destination.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.pool_fee.key(),
            host_fee_pubkey.as_ref(),
            spl_token_swap::instruction::Swap {
                amount_in,
                minimum_amount_out,
            },
        )?;

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn deposit_single_token(
        ctx: Context<VerifiedDepositSingleToken>,
        source_token_amount: u64,
        minimum_pool_token_amount: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.user_transfer_authority.key()),
        )?;

        let ix = spl_token_swap::instruction::deposit_single_token_type_exact_amount_in(
            &ctx.accounts.spl_token_swap_program.key(),
            &ctx.accounts.token_program.key(),
            &ctx.accounts.swap.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.user_transfer_authority.key(),
            &ctx.accounts.source_token.key(),
            &ctx.accounts.swap_token_a.key(),
            &ctx.accounts.swap_token_b.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.destination.key(),
            spl_token_swap::instruction::DepositSingleTokenTypeExactAmountIn {
                source_token_amount,
                minimum_pool_token_amount,
            },
        )?;

        let account_infos = vec![
            ctx.accounts.swap.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.user_transfer_authority.to_account_info(),
            ctx.accounts.source_token.to_account_info(),
            ctx.accounts.swap_token_a.to_account_info(),
            ctx.accounts.swap_token_b.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn withdraw_single_token(
        ctx: Context<VerifiedWithdrawSingleToken>,
        destination_token_amount: u64,
        maximum_pool_token_amount: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.user_transfer_authority.key()),
        )?;

        let ix = spl_token_swap::instruction::withdraw_single_token_type_exact_amount_out(
            &ctx.accounts.spl_token_swap_program.key(),
            &ctx.accounts.token_program.key(),
            &ctx.accounts.swap.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.user_transfer_authority.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.fee_account.key(),
            &ctx.accounts.pool_token_source.key(),
            &ctx.accounts.swap_token_a.key(),
            &ctx.accounts.swap_token_b.key(),
            &ctx.accounts.destination.key(),
            spl_token_swap::instruction::WithdrawSingleTokenTypeExactAmountOut {
                destination_token_amount,
                maximum_pool_token_amount,
            },
        )?;

        let account_infos = vec![
            ctx.accounts.swap.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.user_transfer_authority.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.pool_token_source.to_account_info(),
            ctx.accounts.swap_token_a.to_account_info(),
            ctx.accounts.swap_token_b.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.fee_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn deposit_all_token_types(
        ctx: Context<VerifiedDepositAllTokenTypes>,
        pool_token_amount: u64,
        maximum_token_a_amount: u64,
        maximum_token_b_amount: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.user_transfer_authority.key()),
        )?;

        let ix = spl_token_swap::instruction::deposit_all_token_types(
            &ctx.accounts.spl_token_swap_program.key(),
            &ctx.accounts.token_program.key(),
            &ctx.accounts.swap.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.user_transfer_authority.key(),
            &ctx.accounts.deposit_token_a.key(),
            &ctx.accounts.deposit_token_b.key(),
            &ctx.accounts.swap_token_a.key(),
            &ctx.accounts.swap_token_b.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.destination.key(),
            spl_token_swap::instruction::DepositAllTokenTypes {
                pool_token_amount,
                maximum_token_a_amount,
                maximum_token_b_amount,
            },
        )?;

        let account_infos = vec![
            ctx.accounts.swap.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.user_transfer_authority.to_account_info(),
            ctx.accounts.deposit_token_a.to_account_info(),
            ctx.accounts.deposit_token_b.to_account_info(),
            ctx.accounts.swap_token_a.to_account_info(),
            ctx.accounts.swap_token_b.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    pub fn withdraw_all_token_types(
        ctx: Context<VerifiedWithdrawAllTokenTypes>,
        pool_token_amount: u64,
        minimum_token_a_amount: u64,
        minimum_token_b_amount: u64,
    ) -> Result<()> {
        check_compliant(
            &ctx.accounts.zkp_request,
            Some(ctx.accounts.user_transfer_authority.key()),
        )?;

        let ix = spl_token_swap::instruction::withdraw_all_token_types(
            &ctx.accounts.spl_token_swap_program.key(),
            &ctx.accounts.token_program.key(),
            &ctx.accounts.swap.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.user_transfer_authority.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.fee_account.key(),
            &ctx.accounts.source.key(),
            &ctx.accounts.swap_token_a.key(),
            &ctx.accounts.swap_token_b.key(),
            &ctx.accounts.destination_token_a.key(),
            &ctx.accounts.destination_token_b.key(),
            spl_token_swap::instruction::WithdrawAllTokenTypes {
                pool_token_amount,
                minimum_token_a_amount,
                minimum_token_b_amount,
            },
        )?;

        let account_infos = vec![
            ctx.accounts.swap.to_account_info(),
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.user_transfer_authority.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.source.to_account_info(),
            ctx.accounts.swap_token_a.to_account_info(),
            ctx.accounts.swap_token_b.to_account_info(),
            ctx.accounts.destination_token_a.to_account_info(),
            ctx.accounts.destination_token_b.to_account_info(),
            ctx.accounts.fee_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ];

        invoke(&ix, &account_infos)?;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct VerifiedSwap<'info> {
        /// CHECK:
        pub swap: AccountInfo<'info>,

        /// CHECK:
        pub authority: AccountInfo<'info>,

        /// CHECK:
        pub user_transfer_authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub source: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_source: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_destination: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_mint: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_fee: AccountInfo<'info>,

        /// CHECK:
        pub spl_token_swap_program: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub token_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedDepositSingleToken<'info> {
        /// CHECK:
        pub swap: AccountInfo<'info>,

        /// CHECK:
        pub authority: AccountInfo<'info>,

        /// CHECK:
        pub user_transfer_authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub source_token: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_mint: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination: AccountInfo<'info>,

        /// CHECK:
        pub spl_token_swap_program: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub token_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedWithdrawSingleToken<'info> {
        /// CHECK:
        pub swap: AccountInfo<'info>,

        /// CHECK:
        pub authority: AccountInfo<'info>,

        /// CHECK:
        pub user_transfer_authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_token_source: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_mint: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub fee_account: AccountInfo<'info>,

        /// CHECK:
        pub spl_token_swap_program: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub token_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedDepositAllTokenTypes<'info> {
        /// CHECK:
        pub swap: AccountInfo<'info>,

        /// CHECK:
        pub authority: AccountInfo<'info>,

        /// CHECK:
        pub user_transfer_authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub deposit_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub deposit_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_mint: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination: AccountInfo<'info>,

        /// CHECK:
        pub spl_token_swap_program: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub token_program: AccountInfo<'info>,
    }

    #[derive(Accounts)]
    pub struct VerifiedWithdrawAllTokenTypes<'info> {
        /// CHECK:
        pub swap: AccountInfo<'info>,

        /// CHECK:
        pub authority: AccountInfo<'info>,

        /// CHECK:
        pub user_transfer_authority: Signer<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub destination_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_a: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub swap_token_b: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub pool_mint: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub source: AccountInfo<'info>,

        /// CHECK:
        #[account(mut)]
        pub fee_account: AccountInfo<'info>,

        /// CHECK:
        pub spl_token_swap_program: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK:
        pub token_program: AccountInfo<'info>,
    }
}
