use albus_verifier::check_compliant;
use anchor_lang::prelude::*;
use spl_stake_pool::{id, solana_program::program::invoke};

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, VerifiedWithdrawSol<'info>>,
    amount: u64,
) -> Result<()> {
    check_compliant(
        &ctx.accounts.zkp_request,
        Some(ctx.accounts.authority.key()),
    )?;

    let ix;

    let mut account_infos = vec![
        ctx.accounts.stake_pool.to_account_info(),
        ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.pool_tokens_from.to_account_info(),
        ctx.accounts.reserve_stake.to_account_info(),
        ctx.accounts.lamports_to.to_account_info(),
        ctx.accounts.manager_fee_account.to_account_info(),
        ctx.accounts.pool_mint.to_account_info(),
        ctx.accounts.clock.to_account_info(),
        ctx.accounts.stake_history.to_account_info(),
        ctx.accounts.stake_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    ];

    if let Some(sol_withdraw_authority) = ctx.remaining_accounts.get(0) {
        account_infos.push(sol_withdraw_authority.to_account_info());

        ix = spl_stake_pool::instruction::withdraw_sol_with_authority(
            &id(),
            &ctx.accounts.stake_pool.key(),
            &sol_withdraw_authority.key(),
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.pool_tokens_from.key(),
            &ctx.accounts.reserve_stake.key(),
            &ctx.accounts.lamports_to.key(),
            &ctx.accounts.manager_fee_account.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.token_program.key(),
            amount,
        );
    } else {
        ix = spl_stake_pool::instruction::withdraw_sol(
            &id(),
            &ctx.accounts.stake_pool.key(),
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.pool_tokens_from.key(),
            &ctx.accounts.reserve_stake.key(),
            &ctx.accounts.lamports_to.key(),
            &ctx.accounts.manager_fee_account.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.token_program.key(),
            amount,
        );
    }

    invoke(&ix, &account_infos)?;

    Ok(())
}

#[derive(Accounts)]
pub struct VerifiedWithdrawSol<'info> {
    /// CHECK: Albus ZKP request
    pub zkp_request: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Stake pool account
    #[account(mut)]
    pub stake_pool: AccountInfo<'info>,

    /// CHECK: Stake pool's withdraw authority account
    pub stake_pool_withdraw_authority: AccountInfo<'info>,

    /// CHECK: Stake pool's reserve stake account
    #[account(mut)]
    pub reserve_stake: AccountInfo<'info>,

    /// CHECK: User account with pool tokens
    #[account(mut)]
    pub pool_tokens_from: AccountInfo<'info>,

    /// CHECK: User account to receive SOL
    #[account(mut)]
    pub lamports_to: AccountInfo<'info>,

    /// CHECK: Stake pool's manager's fee account
    #[account(mut)]
    pub manager_fee_account: AccountInfo<'info>,

    /// CHECK: Stake pool's token mint account
    #[account(mut)]
    pub pool_mint: AccountInfo<'info>,

    /// CHECK: Spl token program id
    pub token_program: AccountInfo<'info>,
    /// CHECK: Stake program id
    pub stake_program: AccountInfo<'info>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    pub clock: Sysvar<'info, Clock>,
}
