use anchor_lang::prelude::*;

use crate::state::ServiceProvider;

pub fn handler(ctx: Context<AddServiceProvider>, data: AddServiceProviderData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let sp = &mut ctx.accounts.service_provider;
    sp.code = data.code;
    sp.name = data.name;
    sp.authority = ctx.accounts.authority.key();
    sp.created_at = timestamp;
    sp.bump = ctx.bumps["service_provider"];

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddServiceProviderData {
    pub code: String,
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
