mod instructions;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("HN5hBpR28T8Mjkm1CB1D8Hj5z5rHQ7VkD2ZWmZtFk49e");

#[program]
pub mod verified_stake_pool {

    use super::*;

    pub fn deposit_sol(ctx: Context<VerifiedDepositSol>, amount: u64) -> Result<()> {
        deposit_sol::handle(ctx, amount)
    }

    pub fn deposit_stake(ctx: Context<VerifiedDepositStake>) -> Result<()> {
        deposit_stake::handle(ctx)
    }

    pub fn withdraw_sol(ctx: Context<VerifiedWithdrawSol>, amount: u64) -> Result<()> {
        withdraw_sol::handle(ctx, amount)
    }

    pub fn withdraw_stake(ctx: Context<VerifiedWithdrawStake>, amount: u64) -> Result<()> {
        withdraw_stake::handle(ctx, amount)
    }
}
