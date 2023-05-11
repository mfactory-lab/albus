use albus_verifier::check_compliant;
use anchor_lang::prelude::*;
use spl_stake_pool::{id, solana_program::program::invoke};

pub fn handle(ctx: Context<VerifiedDepositSol>, amount: u64) -> Result<()> {
    check_compliant(
        &ctx.accounts.zkp_request,
        Some(ctx.accounts.authority.key()),
    )?;

    let ix = spl_stake_pool::instruction::deposit_sol(
        &id(),
        &ctx.accounts.stake_pool.key(),
        &ctx.accounts.stake_pool_withdraw_authority.key(),
        &ctx.accounts.reserve_stake.key(),
        &ctx.accounts.authority.key(),
        &ctx.accounts.pool_tokens_to.key(),
        &ctx.accounts.manager_fee_account.key(),
        &ctx.accounts.referrer_pool_tokens_account.key(),
        &ctx.accounts.pool_mint.key(),
        &ctx.accounts.token_program.key(),
        amount,
    );

    let account_infos = vec![
        ctx.accounts.stake_pool.to_account_info(),
        ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
        ctx.accounts.reserve_stake.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.pool_tokens_to.to_account_info(),
        ctx.accounts.manager_fee_account.to_account_info(),
        ctx.accounts.referrer_pool_tokens_account.to_account_info(),
        ctx.accounts.pool_mint.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    ];

    invoke(&ix, &account_infos)?;

    Ok(())
}

#[derive(Accounts)]
pub struct VerifiedDepositSol<'info> {
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

    /// CHECK: User account to receive pool tokens
    #[account(mut)]
    pub pool_tokens_to: AccountInfo<'info>,

    /// CHECK: Stake pool's manager's fee account
    #[account(mut)]
    pub manager_fee_account: AccountInfo<'info>,

    /// CHECK: Account to receive a portion of fee as referral fees
    #[account(mut)]
    pub referrer_pool_tokens_account: AccountInfo<'info>,

    /// CHECK: Stake pool's token mint account
    #[account(mut)]
    pub pool_mint: AccountInfo<'info>,

    /// CHECK: Spl token program id
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
