use anchor_lang::prelude::*;

use crate::state::ServiceProvider;

pub fn handler(_ctx: Context<DeleteServiceProvider>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteServiceProvider<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
