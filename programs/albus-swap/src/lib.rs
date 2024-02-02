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

declare_id!("ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq");

#[program]
pub mod albus_swap {
    use super::*;
    use crate::curve::base::SwapCurve;
    use crate::curve::calculator::{RoundDirection, TradeDirection};
    use crate::curve::fees::Fees;
    use albus_solana_verifier::AlbusVerifier;

    pub fn initialize(
        ctx: Context<Initialize>,
        fees_input: FeesInfo,
        curve_input: CurveInfo,
        swap_policy: Option<Pubkey>,
        add_liquidity_policy: Option<Pubkey>,
    ) -> Result<()> {
        if ctx.accounts.token_swap.is_initialized {
            return Err(SwapError::AlreadyInUse.into());
        }

        let (swap_authority, bump_seed) = Pubkey::find_program_address(
            &[&ctx.accounts.token_swap.key().to_bytes()],
            ctx.program_id,
        );

        let seeds = &[&ctx.accounts.token_swap.key().to_bytes(), &[bump_seed][..]];

        if !cmp_pubkeys(ctx.accounts.authority.key, swap_authority) {
            return Err(SwapError::InvalidProgramAddress.into());
        }
        if !cmp_pubkeys(ctx.accounts.authority.key, ctx.accounts.token_a.owner) {
            return Err(SwapError::InvalidOwner.into());
        }
        if !cmp_pubkeys(ctx.accounts.authority.key, ctx.accounts.token_b.owner) {
            return Err(SwapError::InvalidOwner.into());
        }
        if cmp_pubkeys(ctx.accounts.authority.key, ctx.accounts.destination.owner) {
            return Err(SwapError::InvalidOutputOwner.into());
        }
        if cmp_pubkeys(ctx.accounts.authority.key, ctx.accounts.pool_fee.owner) {
            return Err(SwapError::InvalidOutputOwner.into());
        }
        if COption::Some(*ctx.accounts.authority.key) != ctx.accounts.pool_mint.mint_authority {
            return Err(SwapError::InvalidOwner.into());
        }

        if cmp_pubkeys(ctx.accounts.token_a.mint, ctx.accounts.token_b.mint) {
            return Err(SwapError::RepeatedMint.into());
        }

        let curve = SwapCurve::try_from(curve_input.clone())?;

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

        if !cmp_pubkeys(ctx.accounts.pool_mint.key(), ctx.accounts.pool_fee.mint) {
            return Err(SwapError::IncorrectPoolMint.into());
        }

        let fees = fees_input.into();

        if let Some(swap_constraints) = SWAP_CONSTRAINTS {
            let owner_key = swap_constraints
                .owner_key
                .parse::<Pubkey>()
                .map_err(|_| SwapError::InvalidOwner)?;
            if ctx.accounts.pool_fee.owner != owner_key {
                return Err(SwapError::InvalidOwner.into());
            }
            swap_constraints.validate_curve(&curve)?;
            swap_constraints.validate_fees(&fees)?;
        }

        fees.validate()?;
        curve.calculator.validate()?;

        let initial_amount = curve.calculator.new_pool_supply();

        token::mint_to(
            ctx.accounts.mint_to_ctx().with_signer(&[&seeds[..]]),
            to_u64(initial_amount)?,
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
        token_swap.pool_fee_account = ctx.accounts.pool_fee.key();
        token_swap.fees = fees_input;
        token_swap.curve = curve_input;
        token_swap.swap_policy = swap_policy;
        token_swap.add_liquidity_policy = add_liquidity_policy;

        Ok(())
    }

    /// Processes an [Swap](enum.Instruction.html).
    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

        if let Some(policy) = token_swap.swap_policy {
            AlbusVerifier::new(
                ctx.accounts
                    .proof_request
                    .as_ref()
                    .expect("Proof request required"),
            )
            .check_policy(policy)
            .check_owner(ctx.accounts.user_transfer_authority.key())
            .run()?;
        }

        if !cmp_pubkeys(
            ctx.accounts.authority.key,
            authority_id(ctx.program_id, &token_swap.key(), token_swap.bump_seed)?,
        ) {
            return Err(SwapError::InvalidProgramAddress.into());
        }

        if !(cmp_pubkeys(ctx.accounts.pool_source.key(), token_swap.token_a)
            || cmp_pubkeys(ctx.accounts.pool_source.key(), token_swap.token_b))
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }

        if !(cmp_pubkeys(ctx.accounts.pool_destination.key(), token_swap.token_a)
            || cmp_pubkeys(ctx.accounts.pool_destination.key(), token_swap.token_b))
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }

        if cmp_pubkeys(
            ctx.accounts.pool_source.key(),
            ctx.accounts.pool_destination.key(),
        ) {
            return Err(SwapError::InvalidInput.into());
        }

        if cmp_pubkeys(ctx.accounts.pool_source.key(), ctx.accounts.user_source.key) {
            return Err(SwapError::InvalidInput.into());
        }

        if cmp_pubkeys(
            ctx.accounts.pool_destination.key(),
            ctx.accounts.user_destination.key,
        ) {
            return Err(SwapError::InvalidInput.into());
        }

        if !cmp_pubkeys(ctx.accounts.pool_mint.key(), token_swap.pool_mint) {
            return Err(SwapError::IncorrectPoolMint.into());
        }

        if !cmp_pubkeys(ctx.accounts.pool_fee.key(), token_swap.pool_fee_account) {
            return Err(SwapError::IncorrectFeeAccount.into());
        }

        if !cmp_pubkeys(ctx.accounts.token_program.key, token_swap.token_program_id) {
            return Err(SwapError::IncorrectTokenProgramId.into());
        }

        // Calculate the trade amounts
        let trade_direction = if cmp_pubkeys(ctx.accounts.pool_source.key(), token_swap.token_a) {
            TradeDirection::AtoB
        } else {
            TradeDirection::BtoA
        };

        let curve = SwapCurve::try_from(token_swap.curve.clone())?;
        let fees = token_swap.fees.into();

        let result = curve
            .swap(
                to_u128(amount_in)?,
                to_u128(ctx.accounts.pool_source.amount)?,
                to_u128(ctx.accounts.pool_destination.amount)?,
                trade_direction,
                &fees,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        if result.destination_amount_swapped < to_u128(minimum_amount_out)? {
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
                .transfer_to_swap_source_ctx()
                .with_signer(&[&seeds[..]]),
            to_u64(result.source_amount_swapped)?,
        )?;

        if result.owner_fee > 0 {
            let mut pool_token_amount = curve
                .calculator
                .withdraw_single_token_type_exact_out(
                    result.owner_fee,
                    swap_token_a_amount,
                    swap_token_b_amount,
                    to_u128(ctx.accounts.pool_mint.supply)?,
                    trade_direction,
                    RoundDirection::Floor,
                )
                .ok_or(SwapError::FeeCalculationFailure)?;

            if let Some(host_info) = &ctx.accounts.host_fee_account {
                let ref_data = host_info.try_borrow_data()?;
                let mut account_data: &[u8] = &ref_data;

                // validate host mint
                let host = TokenAccount::try_deserialize(&mut account_data)?;
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
                            .mint_to_host_ctx(host_info)
                            .with_signer(&[&seeds[..]]),
                        to_u64(host_fee)?,
                    )?;
                }
            }

            token::mint_to(
                ctx.accounts.mint_to_pool_ctx().with_signer(&[&seeds[..]]),
                to_u64(pool_token_amount)?,
            )?;
        }

        token::transfer(
            ctx.accounts
                .transfer_to_destination_ctx()
                .with_signer(&[&seeds[..]]),
            to_u64(result.destination_amount_swapped)?,
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

        if let Some(policy) = token_swap.add_liquidity_policy {
            AlbusVerifier::new(
                ctx.accounts
                    .proof_request
                    .as_ref()
                    .expect("Proof request required"),
            )
            .check_policy(policy)
            .check_owner(ctx.accounts.user_transfer_authority.key())
            .run()?;
        }

        let curve = SwapCurve::try_from(token_swap.curve.clone())?;

        let calculator = curve.calculator;
        if !calculator.allows_deposits() {
            return Err(SwapError::UnsupportedCurveOperation.into());
        }

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.swap_token_a.to_account_info(),
            &ctx.accounts.swap_token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.user_token_a),
            Some(&ctx.accounts.user_token_b),
            None,
        )?;

        let current_pool_mint_supply = to_u128(ctx.accounts.pool_mint.supply)?;
        let (pool_token_amount, pool_mint_supply) = if current_pool_mint_supply > 0 {
            (to_u128(pool_token_amount)?, current_pool_mint_supply)
        } else {
            (calculator.new_pool_supply(), calculator.new_pool_supply())
        };

        let results = calculator
            .pool_tokens_to_trading_tokens(
                pool_token_amount,
                pool_mint_supply,
                to_u128(ctx.accounts.swap_token_a.amount)?,
                to_u128(ctx.accounts.swap_token_b.amount)?,
                RoundDirection::Ceiling,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        let token_a_amount = to_u64(results.token_a_amount)?;
        if token_a_amount > maximum_token_a_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_a_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let token_b_amount = to_u64(results.token_b_amount)?;
        if token_b_amount > maximum_token_b_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_b_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let pool_token_amount = to_u64(pool_token_amount)?;

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        token::transfer(
            ctx.accounts
                .transfer_to_token_a_ctx()
                .with_signer(&[&seeds[..]]),
            token_a_amount,
        )?;

        token::transfer(
            ctx.accounts
                .transfer_to_token_b_ctx()
                .with_signer(&[&seeds[..]]),
            token_b_amount,
        )?;

        token::mint_to(
            ctx.accounts.mint_to_ctx().with_signer(&[&seeds[..]]),
            pool_token_amount,
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

        let curve = SwapCurve::try_from(token_swap.curve.clone())?;
        let calculator = curve.calculator;
        if !calculator.allows_deposits() {
            return Err(SwapError::UnsupportedCurveOperation.into());
        }

        check_accounts(
            token_swap,
            ctx.program_id,
            &token_swap.to_account_info(),
            &ctx.accounts.authority,
            &ctx.accounts.swap_token_a.to_account_info(),
            &ctx.accounts.swap_token_b.to_account_info(),
            &ctx.accounts.pool_mint.to_account_info(),
            &ctx.accounts.token_program,
            Some(&ctx.accounts.dest_token_a),
            Some(&ctx.accounts.dest_token_b),
            Some(&ctx.accounts.pool_fee),
        )?;

        let withdraw_fee: u128 = if *ctx.accounts.pool_fee.key == *ctx.accounts.source.key {
            // withdrawing from the fee account, don't assess withdraw fee
            0
        } else {
            let fees: Fees = token_swap.fees.into();
            fees.owner_withdraw_fee(to_u128(pool_token_amount)?)
                .ok_or(SwapError::FeeCalculationFailure)?
        };

        let pool_token_amount = to_u128(pool_token_amount)?
            .checked_sub(withdraw_fee)
            .ok_or(SwapError::CalculationFailure)?;

        let results = calculator
            .pool_tokens_to_trading_tokens(
                pool_token_amount,
                to_u128(ctx.accounts.pool_mint.supply)?,
                to_u128(ctx.accounts.swap_token_a.amount)?,
                to_u128(ctx.accounts.swap_token_b.amount)?,
                RoundDirection::Floor,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        let token_a_amount = to_u64(results.token_a_amount)?;
        let token_a_amount = std::cmp::min(ctx.accounts.swap_token_a.amount, token_a_amount);
        if token_a_amount < minimum_token_a_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_a_amount == 0 && ctx.accounts.swap_token_a.amount != 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }
        let token_b_amount = to_u64(results.token_b_amount)?;
        let token_b_amount = std::cmp::min(ctx.accounts.swap_token_b.amount, token_b_amount);
        if token_b_amount < minimum_token_b_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if token_b_amount == 0 && ctx.accounts.swap_token_b.amount != 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];
        if withdraw_fee > 0 {
            token::transfer(
                ctx.accounts.transfer_to_fee_account_ctx(),
                to_u64(withdraw_fee)?,
            )?;
        }
        token::burn(ctx.accounts.burn_ctx(), to_u64(pool_token_amount)?)?;

        if token_a_amount > 0 {
            token::transfer(
                ctx.accounts
                    .transfer_to_token_a_ctx()
                    .with_signer(&[&seeds[..]]),
                token_a_amount,
            )?;
        }

        if token_b_amount > 0 {
            token::transfer(
                ctx.accounts
                    .transfer_to_token_b_ctx()
                    .with_signer(&[&seeds[..]]),
                token_b_amount,
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

        if let Some(policy) = token_swap.add_liquidity_policy {
            AlbusVerifier::new(
                ctx.accounts
                    .proof_request
                    .as_ref()
                    .expect("Proof request required"),
            )
            .check_policy(policy)
            .check_owner(ctx.accounts.user_transfer_authority.key())
            .run()?;
        }

        let curve: SwapCurve = token_swap.curve.clone().try_into()?;
        let fees = token_swap.fees.into();

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

        let pool_mint_supply = to_u128(ctx.accounts.pool_mint.supply)?;
        let pool_token_amount = if pool_mint_supply > 0 {
            curve
                .deposit_single_token_type(
                    to_u128(source_token_amount).unwrap(),
                    to_u128(ctx.accounts.swap_token_a.amount)?,
                    to_u128(ctx.accounts.swap_token_b.amount)?,
                    pool_mint_supply,
                    trade_direction,
                    &fees,
                )
                .ok_or(SwapError::ZeroTradingTokens)?
        } else {
            curve.calculator.new_pool_supply()
        };

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];
        let pool_token_amount = to_u64(pool_token_amount)?;
        if pool_token_amount < minimum_pool_token_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if pool_token_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        match trade_direction {
            TradeDirection::AtoB => {
                token::transfer(ctx.accounts.transfer_to_token_a_ctx(), source_token_amount)?;
            }
            TradeDirection::BtoA => {
                token::transfer(ctx.accounts.transfer_to_token_b_ctx(), source_token_amount)?;
            }
        }
        token::mint_to(
            ctx.accounts.mint_to_ctx().with_signer(&[&seeds[..]]),
            pool_token_amount,
        )?;

        Ok(())
    }

    /// Processes a WithdrawSingleTokenTypeExactAmountOut.
    pub fn withdraw_single_token_type(
        ctx: Context<WithdrawSingleTokenType>,
        destination_token_amount: u64,
        maximum_pool_token_amount: u64,
    ) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;

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
            Some(&ctx.accounts.pool_fee.to_account_info()),
        )?;

        let pool_mint_supply = to_u128(ctx.accounts.pool_mint.supply)?;
        let swap_token_a_amount = to_u128(ctx.accounts.swap_token_a.amount)?;
        let swap_token_b_amount = to_u128(ctx.accounts.swap_token_b.amount)?;

        let curve = SwapCurve::try_from(token_swap.curve.clone())?;
        let fees = Fees::from(token_swap.fees);

        let burn_pool_token_amount = curve
            .withdraw_single_token_type_exact_out(
                to_u128(destination_token_amount)?,
                swap_token_a_amount,
                swap_token_b_amount,
                pool_mint_supply,
                trade_direction,
                &fees,
            )
            .ok_or(SwapError::ZeroTradingTokens)?;

        let withdraw_fee: u128 =
            if cmp_pubkeys(ctx.accounts.pool_fee.key, ctx.accounts.source.key()) {
                // withdrawing from the fee account, don't assess withdraw fee
                0
            } else {
                fees.owner_withdraw_fee(burn_pool_token_amount)
                    .ok_or(SwapError::FeeCalculationFailure)?
            };

        let pool_token_amount = burn_pool_token_amount
            .checked_add(withdraw_fee)
            .ok_or(SwapError::CalculationFailure)?;

        if to_u64(pool_token_amount)? > maximum_pool_token_amount {
            return Err(SwapError::ExceededSlippage.into());
        }
        if pool_token_amount == 0 {
            return Err(SwapError::ZeroTradingTokens.into());
        }

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        if withdraw_fee > 0 {
            token::transfer(
                ctx.accounts.transfer_to_fee_account_ctx(),
                to_u64(withdraw_fee)?,
            )?;
        }

        token::burn(ctx.accounts.burn_ctx(), to_u64(burn_pool_token_amount)?)?;

        match trade_direction {
            TradeDirection::AtoB => {
                token::transfer(
                    ctx.accounts
                        .transfer_from_token_a_ctx()
                        .with_signer(&[&seeds[..]]),
                    destination_token_amount,
                )?;
            }
            TradeDirection::BtoA => {
                token::transfer(
                    ctx.accounts
                        .transfer_from_token_b_ctx()
                        .with_signer(&[&seeds[..]]),
                    destination_token_amount,
                )?;
            }
        }

        Ok(())
    }

    pub fn close(ctx: Context<ClosePool>) -> Result<()> {
        let token_swap = &mut ctx.accounts.token_swap;
        let token_a_amount = ctx.accounts.swap_token_a.amount;
        let token_b_amount = ctx.accounts.swap_token_b.amount;

        let seeds = &[&token_swap.key().to_bytes(), &[token_swap.bump_seed][..]];

        if token_a_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.swap_token_a.to_account_info(),
                to: ctx.accounts.dest_token_a.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts)
                    .with_signer(&[&seeds[..]]),
                token_a_amount,
            )?;
        }

        if token_b_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.swap_token_b.to_account_info(),
                to: ctx.accounts.dest_token_b.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts)
                    .with_signer(&[&seeds[..]]),
                token_b_amount,
            )?;
        }

        close_account(
            &token_swap.to_account_info(),
            &ctx.accounts.payer.to_account_info(),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ClosePool<'info> {
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// token_a Swap Account to potentially withdraw from.
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    /// token_b Swap Account to potentially withdraw from.
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    /// token_a user Account to credit.
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_a: AccountInfo<'info>,
    /// token_b user Account to credit.
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_b: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// Token-swap
    #[account(signer, zero)]
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// Pool Token Mint. Must be empty, owned by swap authority.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// Token A Account. Must be non-zero, owned by swap authority.
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    /// Token B Account. Must be non-zero, owned by swap authority.
    #[account(mut)]
    pub token_b: Account<'info, TokenAccount>,
    /// Pool Token Account to deposit trading and withdraw fees.
    /// Must be empty, not owned by swap authority.
    #[account(mut)]
    pub pool_fee: Account<'info, TokenAccount>,
    /// Pool Token Account to deposit the initial pool token.
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

/// Swap the tokens in the pool.
#[derive(Accounts)]
pub struct Swap<'info> {
    /// CHECK: safe, checked in Albus
    pub proof_request: Option<AccountInfo<'info>>,
    /// Token-swap
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// SOURCE Account, amount is transferable by user transfer authority.
    /// CHECK: safe
    #[account(mut)]
    pub user_source: AccountInfo<'info>,
    /// DESTINATION Account assigned to USER as the owner.
    /// CHECK: safe
    #[account(mut)]
    pub user_destination: AccountInfo<'info>,
    /// Base Account to swap FROM.  Must be the DESTINATION token.
    #[account(mut)]
    pub pool_source: Account<'info, TokenAccount>,
    /// Base Account to swap INTO. Must be the SOURCE token.
    #[account(mut)]
    pub pool_destination: Account<'info, TokenAccount>,
    /// Pool token mint, to generate trading fees.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// Fee account, to receive trading fees.
    #[account(mut)]
    pub pool_fee: Account<'info, TokenAccount>,
    /// Host fee account to receive additional trading fees.
    /// CHECK: safe
    pub host_fee_account: Option<AccountInfo<'info>>,
    // source_mint: AccountInfo<'info>,
    // destination_mint: AccountInfo<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

/// Deposit both types of tokens into the pool. The output is a "pool"
/// token representing ownership in the pool. Inputs are converted to
/// the current ratio.
#[derive(Accounts)]
pub struct DepositAllTokenTypes<'info> {
    /// CHECK: safe, checked in Albus
    pub proof_request: Option<AccountInfo<'info>>,
    /// Token-swap
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// token_a user transfer authority can transfer amount.
    /// CHECK: safe
    #[account(mut)]
    pub user_token_a: AccountInfo<'info>,
    /// token_b user transfer authority can transfer amount.
    /// CHECK: safe
    #[account(mut)]
    pub user_token_b: AccountInfo<'info>,
    /// token_a Base Account to deposit into.
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    /// token_b Base Account to deposit into.
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    /// Pool MINT account, swap authority is the owner.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// Pool Account to deposit the generated tokens, user is the owner.
    /// CHECK: safe
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

/// Deposit one type of tokens into the pool. The output is a "pool" token
/// representing ownership into the pool. Input token is converted as if
/// a swap and deposit all token types were performed.
#[derive(Accounts)]
pub struct DepositSingleTokenType<'info> {
    /// CHECK: safe, checked in Albus
    pub proof_request: Option<AccountInfo<'info>>,
    /// Token-swap
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// token_(A|B) SOURCE Account, amount is transferable by user transfer authority.
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    /// token_a Swap Account, may deposit INTO.
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    /// token_b Swap Account, may deposit INTO.
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    /// Pool MINT account, swap authority is the owner.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// Pool Account to deposit the generated tokens, user is the owner.
    /// CHECK: safe
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

/// Withdraw both types of tokens from the pool at the current ratio, given
/// pool tokens. The pool tokens are burned in exchange for an equivalent
/// amount of token A and B.
#[derive(Accounts)]
pub struct WithdrawAllTokenTypes<'info> {
    /// Token-swap
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// Pool mint account, swap authority is the owner.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// SOURCE Pool account, amount is transferable by user transfer authority.
    /// CHECK: safe
    #[account(mut)]
    pub source: AccountInfo<'info>,
    /// token_a Swap Account to withdraw FROM.
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    /// token_b Swap Account to withdraw FROM.
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    /// token_a user Account to credit.
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_a: AccountInfo<'info>,
    /// token_b user Account to credit.
    /// CHECK: safe
    #[account(mut)]
    pub dest_token_b: AccountInfo<'info>,
    /// Fee account, to receive withdrawal fees.
    /// CHECK: safe
    #[account(mut)]
    pub pool_fee: AccountInfo<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

/// Withdraw one token type from the pool at the current ratio given the
/// exact amount out expected.
#[derive(Accounts)]
pub struct WithdrawSingleTokenType<'info> {
    /// Token-swap
    pub token_swap: Box<Account<'info, TokenSwap>>,
    /// CHECK: safe
    pub authority: AccountInfo<'info>,
    /// CHECK: safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// Pool mint account, swap authority is the owner.
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// SOURCE Pool account, amount is transferable by user transfer authority.
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    /// token_a Swap Account to potentially withdraw from.
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    /// token_b Swap Account to potentially withdraw from.
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    /// token_(A|B) User Account to credit.
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    /// Fee account, to receive withdrawal fees.
    /// CHECK: safe
    #[account(mut)]
    pub pool_fee: AccountInfo<'info>,
    /// Pool Token program id.
    pub token_program: Program<'info, Token>,
}

// Context

impl<'info> Initialize<'info> {
    fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> DepositAllTokenTypes<'info> {
    fn transfer_to_token_a_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_token_a.clone(),
            to: self.swap_token_a.to_account_info(),
            authority: self.user_transfer_authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_to_token_b_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_token_b.clone(),
            to: self.swap_token_b.to_account_info(),
            authority: self.user_transfer_authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> DepositSingleTokenType<'info> {
    fn transfer_to_token_a_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.swap_token_a.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_to_token_b_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.swap_token_b.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> WithdrawAllTokenTypes<'info> {
    fn transfer_to_fee_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.pool_fee.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.pool_mint.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
            from: self.source.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_to_token_a_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_a.to_account_info(),
            to: self.dest_token_a.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_to_token_b_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_b.to_account_info(),
            to: self.dest_token_b.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> WithdrawSingleTokenType<'info> {
    fn transfer_to_fee_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.source.to_account_info(),
            to: self.pool_fee.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.pool_mint.to_account_info(),
            from: self.source.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_from_token_a_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_a.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_from_token_b_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_token_b.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

impl<'info> Swap<'info> {
    fn transfer_to_swap_source_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_source.to_account_info(),
            to: self.pool_source.to_account_info(),
            authority: self.user_transfer_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn transfer_to_destination_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.pool_destination.to_account_info(),
            to: self.user_destination.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn mint_to_host_ctx(
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

    fn mint_to_pool_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.pool_fee.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[cfg(test)]
mod tests {
    use crate::curve::base::SwapCurve;
    use crate::curve::calculator::RoundDirection;
    use crate::errors::SwapError;
    use crate::utils::to_u128;
    use solana_program::native_token::LAMPORTS_PER_SOL;

    #[test]
    fn test1() {
        let curve = SwapCurve::default();

        let calculator = curve.calculator;
        let results = calculator
            .pool_tokens_to_trading_tokens(
                (0.01 * LAMPORTS_PER_SOL as f64) as u128,
                to_u128((11.59 * LAMPORTS_PER_SOL as f64) as u64).unwrap(),
                to_u128((3.821 * LAMPORTS_PER_SOL as f64) as u64).unwrap(),
                to_u128((10.22 * 1_000_000f64) as u64).unwrap(),
                RoundDirection::Floor,
            )
            .ok_or(SwapError::ZeroTradingTokens)
            .unwrap();

        println!("{:?}", results);
    }
}
