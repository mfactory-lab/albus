use albus_verifier::check_compliant;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::vote::state::VoteState;
use spl_stake_pool::solana_program::program::invoke;

pub fn handle(ctx: Context<VerifiedAddValidator>) -> Result<()> {
    // TODO: deserialize VoteState and check authorized_withdrawer with albus
    // let vote_account = VoteState::deserialize(ctx.accounts.validator.data.take()).unwrap();
    // msg!("{:?}", vote_account);
    // check_compliant(
    //     &ctx.accounts.zkp_request,
    //     Some(vote_account.authorized_withdrawer),
    // )?;

    let ix = spl_stake_pool::instruction::add_validator_to_pool(
        &ctx.accounts.stake_pool_program.key(),
        &ctx.accounts.stake_pool.key(),
        &ctx.accounts.staker.key(),
        &ctx.accounts.funder.key(),
        &ctx.accounts.stake_pool_withdraw_authority.key(),
        &ctx.accounts.validator_list_storage.key(),
        &ctx.accounts.stake.key(),
        &ctx.accounts.validator.key(),
    );

    let account_infos = vec![
        ctx.accounts.stake_pool.to_account_info(),
        ctx.accounts.staker.to_account_info(),
        ctx.accounts.funder.to_account_info(),
        ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
        ctx.accounts.validator_list_storage.to_account_info(),
        ctx.accounts.stake.to_account_info(),
        ctx.accounts.validator.to_account_info(),
        ctx.accounts.rent.to_account_info(),
        ctx.accounts.clock.to_account_info(),
        ctx.accounts.stake_history.to_account_info(),
        ctx.accounts.stake_config.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.stake_program.to_account_info(),
    ];

    invoke(&ix, &account_infos)?;

    Ok(())
}

#[derive(Accounts)]
pub struct VerifiedAddValidator<'info> {
    /// CHECK: Albus ZKP request
    pub proof_request: AccountInfo<'info>,

    pub staker: Signer<'info>,

    #[account(mut)]
    pub funder: Signer<'info>,

    /// CHECK: Stake pool account
    #[account(mut)]
    pub stake_pool: AccountInfo<'info>,

    /// CHECK: Stake pool's validator list storage account
    #[account(mut)]
    pub validator_list_storage: AccountInfo<'info>,

    /// CHECK: Stake pool's withdraw authority account
    pub stake_pool_withdraw_authority: AccountInfo<'info>,

    /// CHECK: Stake account to add to the pool
    #[account(mut)]
    pub stake: AccountInfo<'info>,

    /// CHECK: Validator this stake account will be delegated to
    pub validator: AccountInfo<'info>,

    /// CHECK: Stake program id
    pub stake_program: AccountInfo<'info>,

    /// CHECK: Stake config sysvar id
    pub stake_config: AccountInfo<'info>,

    /// CHECK: Stake pool program id
    pub stake_pool_program: AccountInfo<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    pub system_program: Program<'info, System>,
}
