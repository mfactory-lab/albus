use anchor_lang::prelude::*;
use albus_verifier::check_compliant;
use spl_stake_pool::{solana_program::program::invoke, id};

pub fn handle(ctx: Context<VerifiedWithdrawStake>, amount: u64) -> Result<()> {
    check_compliant(&ctx.accounts.zkp_request, Some(ctx.accounts.authority.key()))?;

    let ix = spl_stake_pool::instruction::withdraw_stake(
        &id(),
        &ctx.accounts.stake_pool.key(),
        &ctx.accounts.validator_list_storage.key(),
        &ctx.accounts.stake_pool_withdraw_authority.key(),
        &ctx.accounts.stake_to_split.key(),
        &ctx.accounts.stake_to_receive.key(),
        &ctx.accounts.authority.key(),
        &ctx.accounts.authority.key(),
        &ctx.accounts.pool_tokens_from.key(),
        &ctx.accounts.manager_fee_account.key(),
        &ctx.accounts.pool_mint.key(),
        &ctx.accounts.token_program.key(),
        amount,
    );

    let account_infos = vec![
        ctx.accounts.stake_pool.to_account_info(),
        ctx.accounts.validator_list_storage.to_account_info(),
        ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
        ctx.accounts.stake_to_split.to_account_info(),
        ctx.accounts.stake_to_receive.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.pool_tokens_from.to_account_info(),
        ctx.accounts.manager_fee_account.to_account_info(),
        ctx.accounts.pool_mint.to_account_info(),
        ctx.accounts.clock.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.stake_program.to_account_info(),
    ];

    invoke(&ix, &account_infos)?;

    Ok(())
}

#[derive(Accounts)]
pub struct VerifiedWithdrawStake<'info> {
    /// CHECK: Albus ZKP request
    pub zkp_request: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Stake pool account
    #[account(mut)]
    pub stake_pool: AccountInfo<'info>,

    /// CHECK: Stake pool's validator list storage account
    #[account(mut)]
    pub validator_list_storage: AccountInfo<'info>,

    /// CHECK: Stake pool's withdraw authority account
    pub stake_pool_withdraw_authority: AccountInfo<'info>,

    /// CHECK: Validator or reserve stake account to split
    #[account(mut)]
    pub stake_to_split: AccountInfo<'info>,

    /// CHECK: Uninitialized stake account to receive withdrawal
    #[account(mut)]
    pub stake_to_receive: AccountInfo<'info>,

    /// CHECK: User account with pool tokens
    #[account(mut)]
    pub pool_tokens_from: AccountInfo<'info>,

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
    pub clock: Sysvar<'info, Clock>,
}
