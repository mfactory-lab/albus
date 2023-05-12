mod instructions;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("HN5hBpR28T8Mjkm1CB1D8Hj5z5rHQ7VkD2ZWmZtFk49e");

#[program]
pub mod verified_stake_pool {

    use super::*;

    pub fn deposit_sol<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifiedDepositSol<'info>>,
        amount: u64,
    ) -> Result<()> {
        deposit_sol::handle(ctx, amount)
    }

    pub fn deposit_stake<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifiedDepositStake<'info>>,
    ) -> Result<()> {
        deposit_stake::handle(ctx)
    }

    pub fn withdraw_sol<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifiedWithdrawSol<'info>>,
        amount: u64,
    ) -> Result<()> {
        withdraw_sol::handle(ctx, amount)
    }

    pub fn withdraw_stake(ctx: Context<VerifiedWithdrawStake>, amount: u64) -> Result<()> {
        withdraw_stake::handle(ctx, amount)
    }

    pub fn add_validator(ctx: Context<VerifiedAddValidator>) -> Result<()> {
        add_validator::handle(ctx)
    }
}
