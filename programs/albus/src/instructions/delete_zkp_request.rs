use anchor_lang::prelude::*;

use crate::{events::DeleteZKPRequestEvent, state::ZKPRequest, AlbusError};

pub fn handler(ctx: Context<DeleteZKPRequest>) -> Result<()> {
    let req = &mut ctx.accounts.zkp_request;

    if req.owner.key() != ctx.accounts.authority.key() {
        return Err(AlbusError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteZKPRequestEvent {
        zkp_request: req.key(),
        owner: req.owner,
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteZKPRequest<'info> {
    #[account(mut, close = authority)]
    pub zkp_request: Box<Account<'info, ZKPRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
