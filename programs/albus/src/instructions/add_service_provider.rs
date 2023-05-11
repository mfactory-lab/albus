use anchor_lang::prelude::*;

use crate::{state::ServiceProvider, utils::assert_authorized};

pub fn handler(ctx: Context<AddServiceProvider>, data: AddServiceProviderData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let timestamp = Clock::get()?.unix_timestamp;

    let sp = &mut ctx.accounts.service_provider;
    sp.code = data.code;
    sp.name = data.name;
    sp.authority = ctx.accounts.authority.key();
    sp.created_at = timestamp;
    sp.bump = ctx.bumps["service_provider"];

    Ok(())
}

/// Data required to add a new service provider
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddServiceProviderData {
    /// The unique code representing the service
    pub code: String,
    /// The name of the service
    pub name: String,
}

#[derive(Accounts)]
#[instruction(data: AddServiceProviderData)]
pub struct AddServiceProvider<'info> {
    #[account(
        init,
        seeds = [ServiceProvider::SEED, data.code.as_bytes()],
        bump,
        payer = authority,
        space = ServiceProvider::space()
    )]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
