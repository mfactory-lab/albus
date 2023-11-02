use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};
use std::convert::TryFrom;

use crate::constraints::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;

mod constraints;
mod curve;
mod errors;
mod state;
mod utils;

declare_id!("J8YCNcS2xDvowMcSzWrDYNguk5y9NWfGStNT4YsiKuea");

#[program]
pub mod albus_swap {
    use super::*;
    use crate::curve::calculator::{RoundDirection, TradeDirection};
    use albus_solana_verifier::AlbusCompliant;

    pub fn initialize(
        ctx: Context<Initialize>,
        fees_input: TokenSwapFees,
        curve_input: TokenSwapCurve,
    ) -> Result<()> {
        if ctx.accounts.token_swap.is_initialized {
            return Err(SwapError::AlreadyInUse.into());
        }

        let (swap_authority, bump_seed) = Pubkey::find_program_address(
            &[&ctx.accounts.token_swap.key().to_bytes()],
            ctx.program_id,
        );
        let seeds = &[&ctx.accounts.token_swap.key().to_bytes(), &[bump_seed][..]];

        if *ctx.accounts.authority.key != swap_authority {
            return Err(SwapError::InvalidProgramAddress.into());
        }
        if *ctx.accounts.authority.key != ctx.accounts.token_a.owner {
            return Err(SwapError::InvalidOwner.into());
        }
        if *ctx.accounts.authority.key != ctx.accounts.token_b.owner {
            return Err(SwapError::InvalidOwner.into());
        }
        if *ctx.accounts.authority.key == ctx.accounts.destination.owner {
            return Err(SwapError::InvalidOutputOwner.into());
        }
        if *ctx.accounts.authority.key == ctx.accounts.fee_account.owner {
            return Err(SwapError::InvalidOutputOwner.into());
        }
        if COption::Some(*ctx.accounts.authority.key) != ctx.accounts.pool_mint.mint_authority {
            return Err(SwapError::InvalidOwner.into());
        }

        if ctx.accounts.token_a.mint == ctx.accounts.token_b.mint {
            return Err(SwapError::RepeatedMint.into());
        }

        let curve = build_curve(&curve_input).unwrap();
        curve
            .calculator
            .validate_supply(ctx.accounts.token_a.amount, ctx.accounts.token_b.amount)?;
        if ctx.accounts.token_a.delegate.is_some() {
            return Err(SwapError::InvalidDelegate.into());
        }
        if ctx.accounts.token_b.delegate.is_some() {
            return Err(SwapError::InvalidDelegate.into());
        }
        if ctx.accounts.token_a.close_authority.is_some() {
            return Err(SwapError::InvalidCloseAuthority.into());
        }
        if ctx.accounts.token_b.close_authority.is_some() {
            return Err(SwapError::InvalidCloseAuthority.into());
        }

        if ctx.accounts.pool_mint.supply != 0 {
            return Err(SwapError::InvalidSupply.into());
        }
        if ctx.accounts.pool_mint.freeze_authority.is_some() {
            return Err(SwapError::InvalidFreezeAuthority.into());
        }
        if *ctx.accounts.pool_mint.to_account_info().key != ctx.accounts.fee_account.mint {
            return Err(SwapError::IncorrectPoolMint.into());
        }
        let fees = build_fees(&fees_input).unwrap();

        if let Some(swap_constraints) = SWAP_CONSTRAINTS {
            let owner_key = swap_constraints
                .owner_key
                .parse::<Pubkey>()
                .map_err(|_| SwapError::InvalidOwner)?;
            if ctx.accounts.fee_account.owner != owner_key {
                return Err(SwapError::InvalidOwner.into());
            }
            swap_constraints.validate_curve(&curve)?;
            swap_constraints.validate_fees(&fees)?;
        }
        fees.validate()?;
        curve.calculator.validate()?;

        let initial_amount = curve.calculator.new_pool_supply();

        token::mint_to(
            ctx.accounts
                .into_mint_to_context()
                .with_signer(&[&seeds[..]]),
            u64::try_from(initial_amount).unwrap(),
        )?;

        let token_swap = &mut ctx.accounts.token_swap;
        token_swap.is_initialized = true;
        token_swap.bump_seed = bump_seed;
        token_swap.token_program_id = ctx.accounts.token_program.key();
        token_swap.token_a = ctx.accounts.token_a.key();
        token_swap.token_b = ctx.accounts.token_b.key();
        token_swap.pool_mint = ctx.accounts.pool_mint.key();
        token_swap.token_a_mint = ctx.accounts.token_a.mint;
        token_swap.token_b_mint = ctx.accounts.token_b.mint;
        token_swap.pool_fee_account = ctx.accounts.fee_account.key();
        token_swap.fees = fees_input;
        token_swap.curve = curve_input;

        Ok(())
    }

    pub fn swap<'info>(
        ctx: Context<'_, '_, 'info, 'info, Swap<'info>>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;
        // if token_swap.to_account_info().owner != ctx.program_id {
        //     return Err(ProgramError::IncorrectProgramId.into());
        // }

        AlbusCompliant::new(&ctx.accounts.proof_request)
            .with_policy(token_swap.policy.unwrap())
            .with_user(ctx.accounts.user_transfer_authority.key())
            .check()?;

        if *ctx.accounts.authority.key
            != authority_id(ctx.program_id, &token_swap.key(), token_swap.bump_seed)?
        {
            return Err(SwapError::InvalidProgramAddress.into());
        }
        if !(*ctx.accounts.swap_source.to_account_info().key == token_swap.token_a
            || *ctx.accounts.swap_source.to_account_info().key == token_swap.token_b)
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }
        if !(*ctx.accounts.swap_destination.to_account_info().key == token_swap.token_a
            || *ctx.accounts.swap_destination.to_account_info().key == token_swap.token_b)
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }
        if *ctx.accounts.swap_source.to_account_info().key
            == *ctx.accounts.swap_destination.to_account_info().key
        {
            return Err(SwapError::InvalidInput.into());
        }
        if ctx.accounts.swap_source.to_account_info().key == ctx.accounts.source_info.key {
            return Err(SwapError::InvalidInput.into());
        }
        if ctx.accounts.swap_destination.to_account_info().key == ctx.accounts.destination_info.key
        {
            return Err(SwapError::InvalidInput.into());
        }
        if *ctx.accounts.pool_mint.to_account_info().key != token_swap.pool_mint {
            return Err(SwapError::IncorrectPoolMint.into());
        }
        if *ctx.accounts.fee_account.to_account_info().key != token_swap.pool_fee_account {
            return Err(SwapError::IncorrectFeeAccount.into());
        }
        if *ctx.accounts.token_program.key != token_swap.token_program_id {
            return Err(SwapError::IncorrectTokenProgramId.into());
        }

        let trade_direction =
            if *ctx.accounts.swap_source.to_account_info().key == token_swap.token_a {
                TradeDirection::AtoB
            } else {
                TradeDirection::BtoA
            };

        let curve = build_curve(&token_swap.curve).unwrap();
        let fees = build_fees(&token_swap.fees).unwrap();

        let result = curve
            .swap(
                u128::try_from(amount_in).unwrap(),
                u128::try_from(ctx.accounts.swap_source.amount).unwrap(),
                u128::try_from(ctx.accounts.swap_destination.amount).unwrap(),
                trade_direction,
                &fees,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;
        if result.destination_amount_swapped < u128::try_from(minimum_amount_out).unwrap() {
            return Err(SwapError::ExceededSlippage.into());
        }

        let (swap_token_a_amount, swap_token_b_amount) = match trade_direction {
            TradeDirection::AtoB => (
                result.new_swap_source_amount,
                result.new_swap_destination_amount,
            ),
            TradeDirection::BtoA => (
                result.new_swap_destination_amount,
                result.new_swap_source_amount,
            ),
        };

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_swap_source_context()
                .with_signer(&[&seeds[..]]),
            u64::try_from(result.source_amount_swapped).unwrap(),
        )?;

        let mut pool_token_amount = curve
            .withdraw_single_token_type_exact_out(
                result.owner_fee,
                swap_token_a_amount,
                swap_token_b_amount,
                u128::try_from(ctx.accounts.pool_mint.supply).unwrap(),
                trade_direction,
                &fees,
            )
            .ok_or(SwapError::FeeCalculationFailure)?;

        if pool_token_amount > 0 {
            // Allow error to fall through
            // if *ctx.accounts.host_fee_account.key != Pubkey::default() {
            if !ctx.remaining_accounts.is_empty() {
                let host_info = next_account_info(&mut ctx.remaining_accounts.iter())?;
                let host = Account::<TokenAccount>::try_from(host_info)?;

                if !cmp_pubkeys(ctx.accounts.pool_mint.key(), host.mint) {
                    return Err(SwapError::IncorrectPoolMint.into());
                }

                let host_fee = fees
                    .host_fee(pool_token_amount)
                    .ok_or(SwapError::FeeCalculationFailure)?;
                if host_fee > 0 {
                    pool_token_amount = pool_token_amount
                        .checked_sub(host_fee)
                        .ok_or(SwapError::FeeCalculationFailure)?;
                    token::mint_to(
                        ctx.accounts
                            .into_mint_to_host_context(host_info)
                            .with_signer(&[&seeds[..]]),
                        u64::try_from(host_fee).unwrap(),
                    )?;
                }
            }
            token::mint_to(
                ctx.accounts
                    .into_mint_to_pool_context()
                    .with_signer(&[&seeds[..]]),
                u64::try_from(pool_token_amount).unwrap(),
            )?;
        }

        token::transfer(
            ctx.accounts
                .into_transfer_to_destination_context()
                .with_signer(&[&seeds[..]]),
            u64::try_from(result.destination_amount_swapped).unwrap(),
        )?;

        Ok(())
    }

    /// Processes an [DepositAllTokenTypes](enum.Instruction.html).
    pub fn deposit_all_token_types(
        ctx: Context<DepositAllTokenTypes>,
        pool_token_amount: u64,
        maximum_token_a_amount: u64,
        maximum_token_b_amount: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

        let curve = build_curve(&token_swap.curve).unwrap();
        let calculator = curve.calculator;
        if !calculator.allows_deposits() {
            return Err(SwapError::UnsupportedCurveOperation.into());
        }

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.token_a.to_account_info(),
            &ctx.accounts.token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.source_a_info),
            Some(&ctx.accounts.source_b_info),
            None,
        )?;

        let current_pool_mint_supply = u128::try_from(ctx.accounts.pool_mint.supply).unwrap();
        let (pool_token_amount, pool_mint_supply) = if current_pool_mint_supply > 0 {
            (
                u128::try_from(pool_token_amount).unwrap(),
                current_pool_mint_supply,
            )
        } else {
            (calculator.new_pool_supply(), calculator.new_pool_supply())
        };

        let results = calculator
            .pool_tokens_to_trading_tokens(
                pool_token_amount,
                pool_mint_supply,
                u128::try_from(ctx.accounts.token_a.amount).unwrap(),
                u128::try_from(ctx.accounts.token_b.amount).unwrap(),
                RoundDirection::Ceiling,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;
        let token_a_amount = u64::try_from(results.token_a_amount).unwrap();
        if token_a_amount > maximum_token_a_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_a_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }
        let token_b_amount = u64::try_from(results.token_b_amount).unwrap();
        if token_b_amount > maximum_token_b_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_b_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let pool_token_amount = u64::try_from(pool_token_amount).unwrap();

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_token_a_context()
                .with_signer(&[&seeds[..]]),
            token_a_amount,
        )?;

        token::transfer(
            ctx.accounts
                .into_transfer_to_token_b_context()
                .with_signer(&[&seeds[..]]),
            token_b_amount,
        )?;

        token::mint_to(
            ctx.accounts
                .into_mint_to_context()
                .with_signer(&[&seeds[..]]),
            u64::try_from(pool_token_amount).unwrap(),
        )?;

        Ok(())
    }

    /// Processes an [WithdrawAllTokenTypes](enum.Instruction.html).
    pub fn withdraw_all_token_types(
        ctx: Context<WithdrawAllTokenTypes>,
        pool_token_amount: u64,
        minimum_token_a_amount: u64,
        minimum_token_b_amount: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

        let curve = build_curve(&token_swap.curve).unwrap();
        let fees = build_fees(&token_swap.fees).unwrap();

        let calculator = curve.calculator;
        if !calculator.allows_deposits() {
            return Err(SwapError::UnsupportedCurveOperation.into());
        }

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.token_a.to_account_info(),
            &ctx.accounts.token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.dest_token_a_info),
            Some(&ctx.accounts.dest_token_b_info),
            Some(&ctx.accounts.fee_account),
        )?;

        let withdraw_fee: u128 = if *ctx.accounts.fee_account.key == *ctx.accounts.source_info.key {
            // withdrawing from the fee account, don't assess withdraw fee
            0
        } else {
            fees.owner_withdraw_fee(u128::try_from(pool_token_amount).unwrap())
                .ok_or(SwapError::FeeCalculationFailure)?
        };
        let pool_token_amount = u128::try_from(pool_token_amount)
            .unwrap()
            .checked_sub(withdraw_fee)
            .ok_or(SwapError::CalculationFailure)?;

        let results = calculator
            .pool_tokens_to_trading_tokens(
                pool_token_amount,
                u128::try_from(ctx.accounts.pool_mint.supply).unwrap(),
                u128::try_from(ctx.accounts.token_a.amount).unwrap(),
                u128::try_from(ctx.accounts.token_b.amount).unwrap(),
                RoundDirection::Floor,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        let token_a_amount = u64::try_from(results.token_a_amount).unwrap();
        let token_a_amount = std::cmp::min(ctx.accounts.token_a.amount, token_a_amount);
        if token_a_amount < minimum_token_a_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_a_amount == 0 && ctx.accounts.token_a.amount != 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }
        let token_b_amount = u64::try_from(results.token_b_amount).unwrap();
        let token_b_amount = std::cmp::min(ctx.accounts.token_b.amount, token_b_amount);
        if token_b_amount < minimum_token_b_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_b_amount == 0 && ctx.accounts.token_b.amount != 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];
        if withdraw_fee > 0 {
            token::transfer(
                ctx.accounts.into_transfer_to_fee_account_context(),
                u64::try_from(withdraw_fee).unwrap(),
            )?;
        }
        token::burn(
            ctx.accounts.into_burn_context(),
            u64::try_from(pool_token_amount).unwrap(),
        )?;

        if token_a_amount > 0 {
            token::transfer(
                ctx.accounts
                    .into_transfer_to_token_a_context()
                    .with_signer(&[&seeds[..]]),
                token_a_amount,
            )?;
        }
        if token_b_amount > 0 {
            token::transfer(
                ctx.accounts
                    .into_transfer_to_token_b_context()
                    .with_signer(&[&seeds[..]]),
                token_a_amount,
            )?;
        }
        Ok(())
    }

    /// Processes DepositSingleTokenTypeExactAmountIn
    pub fn deposit_single_token_type(
        ctx: Context<DepositSingleTokenType>,
        source_token_amount: u64,
        minimum_pool_token_amount: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

        let curve = build_curve(&token_swap.curve).unwrap();
        let fees = build_fees(&token_swap.fees).unwrap();

        let trade_direction =
            if cmp_pubkeys(ctx.accounts.source.mint, ctx.accounts.swap_token_a.mint) {
                TradeDirection::AtoB
            } else if cmp_pubkeys(ctx.accounts.source.mint, ctx.accounts.swap_token_b.mint) {
                TradeDirection::BtoA
            } else {
                return Err(SwapError::IncorrectSwapAccount.into());
            };

        let source = ctx.accounts.source.to_account_info();
        let (source_a_info, source_b_info) = match trade_direction {
            TradeDirection::AtoB => (Some(&source), None),
            TradeDirection::BtoA => (None, Some(&source)),
        };

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.swap_token_a.to_account_info(),
            &ctx.accounts.swap_token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            source_a_info,
            source_b_info,
            None,
        )?;

        let pool_mint_supply = u128::try_from(ctx.accounts.pool_mint.supply).unwrap();
        let pool_token_amount = if pool_mint_supply > 0 {
            curve
                .deposit_single_token_type(
                    u128::try_from(source_token_amount).unwrap(),
                    u128::try_from(ctx.accounts.swap_token_a.amount).unwrap(),
                    u128::try_from(ctx.accounts.swap_token_b.amount).unwrap(),
                    pool_mint_supply,
                    trade_direction,
                    &fees,
                )
                .ok_or(SwapError::ZeroTradingTokens)?
        } else {
            curve.calculator.new_pool_supply()
        };

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];
        let pool_token_amount = u64::try_from(pool_token_amount).unwrap();
        if pool_token_amount < minimum_pool_token_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if pool_token_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        match trade_direction {
            TradeDirection::AtoB => {
                token::transfer(
                    ctx.accounts.into_transfer_to_token_a_context(),
                    source_token_amount,
                )?;
            }
            TradeDirection::BtoA => {
                token::transfer(
                    ctx.accounts.into_transfer_to_token_b_context(),
                    source_token_amount,
                )?;
            }
        }
        token::mint_to(
            ctx.accounts
                .into_mint_to_context()
                .with_signer(&[&seeds[..]]),
            pool_token_amount,
        )?;

        Ok(())
    }

    /// Processes a [WithdrawSingleTokenTypeExactAmountOut](enum.Instruction.html).
    pub fn withdraw_single_token_type(
        ctx: Context<WithdrawSingleTokenType>,
        destination_token_amount: u64,
        maximum_pool_token_amount: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

        let curve = build_curve(&token_swap.curve).unwrap();
        let fees = build_fees(&token_swap.fees).unwrap();

        let trade_direction = if cmp_pubkeys(
            ctx.accounts.destination.mint,
            ctx.accounts.swap_token_a.mint,
        ) {
            TradeDirection::AtoB
        } else if cmp_pubkeys(
            ctx.accounts.destination.mint,
            ctx.accounts.swap_token_b.mint,
        ) {
            TradeDirection::BtoA
        } else {
            return Err(SwapError::IncorrectSwapAccount.into());
        };

        let destination = ctx.accounts.destination.to_account_info();
        let (destination_a_info, destination_b_info) = match trade_direction {
            TradeDirection::AtoB => (Some(&destination), None),
            TradeDirection::BtoA => (None, Some(&destination)),
        };

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.swap_token_a.to_account_info(),
            &ctx.accounts.swap_token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            destination_a_info,
            destination_b_info,
            Some(&ctx.accounts.fee_account.to_account_info()),
        )?;

        let pool_mint_supply = u128::try_from(ctx.accounts.pool_mint.supply).unwrap();
        let swap_token_a_amount = u128::try_from(ctx.accounts.swap_token_a.amount).unwrap();
        let swap_token_b_amount = u128::try_from(ctx.accounts.swap_token_b.amount).unwrap();

        let burn_pool_token_amount = curve
            .withdraw_single_token_type_exact_out(
                u128::try_from(destination_token_amount).unwrap(),
                swap_token_a_amount,
                swap_token_b_amount,
                pool_mint_supply,
                trade_direction,
                &fees,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        let withdraw_fee: u128 =
            if cmp_pubkeys(ctx.accounts.fee_account.key, ctx.accounts.source.key()) {
                // withdrawing from the fee account, don't assess withdraw fee
                0
            } else {
                fees.owner_withdraw_fee(burn_pool_token_amount)
                    .ok_or(SwapError::FeeCalculationFailure)?
            };

        let pool_token_amount = burn_pool_token_amount
            .checked_add(withdraw_fee)
            .ok_or(SwapError::CalculationFailure)?;

        if u64::try_from(pool_token_amount).unwrap() > maximum_pool_token_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if pool_token_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        if withdraw_fee > 0 {
            token::transfer(
                ctx.accounts.into_transfer_to_fee_account_context(),
                u64::try_from(withdraw_fee).unwrap(),
            )?;
        }

        token::burn(
            ctx.accounts.into_burn_context(),
            u64::try_from(burn_pool_token_amount).unwrap(),
        )?;

        match trade_direction {
            TradeDirection::AtoB => {
                token::transfer(
                    ctx.accounts
                        .into_transfer_from_token_a_context()
                        .with_signer(&[&seeds[..]]),
                    destination_token_amount,
                )?;
            }
            TradeDirection::BtoA => {
                token::transfer(
                    ctx.accounts
                        .into_transfer_from_token_b_context()
                        .with_signer(&[&seeds[..]]),
                    destination_token_amount,
                )?;
            }
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: only for signing
    pub authority: AccountInfo<'info>,
    #[account(signer, zero)]
    pub token_swap: Box<Account<'info, TokenSwap>>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    /// CHECK: only for signing
    pub authority: AccountInfo<'info>,
    /// CHECK: account checked in Albus
    pub proof_request: AccountInfo<'info>,
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub source_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub destination_info: AccountInfo<'info>,
    #[account(mut)]
    pub swap_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    #[account(mut)]
    pub fee_account: Account<'info, TokenAccount>,
    // /// CHECK: safe
    // pub host_fee_account: AccountInfo<'info>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositAllTokenTypes<'info> {
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub source_a_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub source_b_info: AccountInfo<'info>,
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// CHECK: safe
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositSingleTokenType<'info> {
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// CHECK: safe
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawAllTokenTypes<'info> {
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: only for signing
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub source_info: AccountInfo<'info>,
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_a_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_b_info: AccountInfo<'info>,
    /// CHECK: safe
    #[account(mut)]
    pub fee_account: AccountInfo<'info>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawSingleTokenType<'info> {
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: only for signing
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    /// CHECK: safe
    #[account(mut)]
    pub fee_account: AccountInfo<'info>,
    /// SPL Token program.
    pub token_program: Program<'info, Token>,
}

// Context

impl<'info> Initialize<'info> {
    fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> DepositAllTokenTypes<'info> {
    fn into_transfer_to_token_a_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source_a_info.clone(),
            to: self.token_a.to_account_info(),
            authority: self.user_transfer_authority_info.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_token_b_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source_b_info.clone(),
            to: self.token_b.to_account_info(),
            authority: self.user_transfer_authority_info.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> DepositSingleTokenType<'info> {
    fn into_transfer_to_token_a_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.swap_token_a.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_token_b_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.swap_token_b.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> WithdrawAllTokenTypes<'info> {
    fn into_transfer_to_fee_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source_info.to_account_info(),
            to: self.fee_account.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.pool_mint.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
            from: self.source_info.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_token_a_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.token_a.to_account_info(),
            to: self.dest_token_a_info.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_token_b_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.token_b.to_account_info(),
            to: self.dest_token_b_info.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> WithdrawSingleTokenType<'info> {
    fn into_transfer_to_fee_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.fee_account.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.pool_mint.to_account_info(),
            from: self.source.to_account_info(),
            authority: self.user_transfer_authority_info.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_from_token_a_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_a.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_from_token_b_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_b.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> Swap<'info> {
    fn into_transfer_to_swap_source_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source_info.to_account_info(),
            to: self.swap_source.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_destination_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_destination.to_account_info(),
            to: self.destination_info.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_mint_to_host_context(
        &self,
        host: &AccountInfo<'info>,
    ) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: host.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_mint_to_pool_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.fee_account.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}
