use anchor_lang::prelude::*;

use crate::{state::ServiceProvider, utils::assert_authorized};

pub fn handler(ctx: Context<DeleteServiceProvider>) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteServiceProvider<'info> {
    #[account(mut, close = authority)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
