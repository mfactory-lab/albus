use anchor_lang::prelude::*;

use crate::{events::VerifyEvent, state::ZKPRequest, AlbusError};

pub fn handler(ctx: Context<Verify>) -> Result<()> {
    let req = &mut ctx.accounts.zkp_request;

    if req.verified_at <= 0 {
        return Err(AlbusError::Unverified.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    emit!(VerifyEvent {
        zkp_request: req.key(),
        service_provider: req.service_provider,
        circuit: req.circuit,
        owner: req.owner,
        timestamp,
    });

    msg!("Verified!");

    Ok(())
}

#[derive(Accounts)]
pub struct Verify<'info> {
    pub zkp_request: Box<Account<'info, ZKPRequest>>,

    pub system_program: Program<'info, System>,
}
