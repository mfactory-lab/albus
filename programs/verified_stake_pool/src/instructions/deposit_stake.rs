use albus_verifier::check_compliant;
use anchor_lang::prelude::*;
use spl_stake_pool::{id, solana_program::program::invoke};

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, VerifiedDepositStake<'info>>) -> Result<()> {
    check_compliant(
        &ctx.accounts.zkp_request,
        Some(ctx.accounts.authority.key()),
    )?;

    let ixs;

    let deposit_account_infos;

    let authorize_account_infos;

    if let Some(stake_pool_deposit_authority) = ctx.remaining_accounts.get(0) {
        authorize_account_infos = vec![
            ctx.accounts.deposit_stake.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            stake_pool_deposit_authority.to_account_info(),
        ];

        deposit_account_infos = vec![
            ctx.accounts.stake_pool.to_account_info(),
            ctx.accounts.validator_list_storage.to_account_info(),
            stake_pool_deposit_authority.to_account_info(),
            ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
            ctx.accounts.deposit_stake.to_account_info(),
            ctx.accounts.validator_stake.to_account_info(),
            ctx.accounts.reserve_stake.to_account_info(),
            ctx.accounts.pool_tokens_to.to_account_info(),
            ctx.accounts.manager_fee_account.to_account_info(),
            ctx.accounts.referrer_pool_tokens_account.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.stake_history.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.stake_program.to_account_info(),
        ];

        ixs = spl_stake_pool::instruction::deposit_stake_with_authority(
            &id(),
            &ctx.accounts.stake_pool.key(),
            &ctx.accounts.validator_list_storage.key(),
            &stake_pool_deposit_authority.key(),
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            &ctx.accounts.deposit_stake.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.validator_stake.key(),
            &ctx.accounts.reserve_stake.key(),
            &ctx.accounts.pool_tokens_to.key(),
            &ctx.accounts.manager_fee_account.key(),
            &ctx.accounts.referrer_pool_tokens_account.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.token_program.key(),
        );
    } else {
        authorize_account_infos = vec![
            ctx.accounts.deposit_stake.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        ];

        deposit_account_infos = vec![
            ctx.accounts.stake_pool.to_account_info(),
            ctx.accounts.validator_list_storage.to_account_info(),
            ctx.accounts.stake_pool_deposit_authority.to_account_info(),
            ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
            ctx.accounts.deposit_stake.to_account_info(),
            ctx.accounts.validator_stake.to_account_info(),
            ctx.accounts.reserve_stake.to_account_info(),
            ctx.accounts.pool_tokens_to.to_account_info(),
            ctx.accounts.manager_fee_account.to_account_info(),
            ctx.accounts.referrer_pool_tokens_account.to_account_info(),
            ctx.accounts.pool_mint.to_account_info(),
            ctx.accounts.clock.to_account_info(),
            ctx.accounts.stake_history.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.stake_program.to_account_info(),
        ];

        ixs = spl_stake_pool::instruction::deposit_stake(
            &id(),
            &ctx.accounts.stake_pool.key(),
            &ctx.accounts.validator_list_storage.key(),
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            &ctx.accounts.deposit_stake.key(),
            &ctx.accounts.authority.key(),
            &ctx.accounts.validator_stake.key(),
            &ctx.accounts.reserve_stake.key(),
            &ctx.accounts.pool_tokens_to.key(),
            &ctx.accounts.manager_fee_account.key(),
            &ctx.accounts.referrer_pool_tokens_account.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.token_program.key(),
        );
    }

    for ix in ixs.iter() {
        if ix.program_id == id() {
            invoke(ix, &deposit_account_infos)?;
        } else {
            invoke(ix, &authorize_account_infos)?;
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct VerifiedDepositStake<'info> {
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

    /// CHECK: Stake pool's deposit authority account
    pub stake_pool_deposit_authority: AccountInfo<'info>,

    /// CHECK: Stake account to join the pool
    #[account(mut)]
    pub deposit_stake: AccountInfo<'info>,

    /// CHECK: Validator stake account for the stake account to be merged with
    #[account(mut)]
    pub validator_stake: AccountInfo<'info>,

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
    /// CHECK: Stake program id
    pub stake_program: AccountInfo<'info>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    pub clock: Sysvar<'info, Clock>,
}
