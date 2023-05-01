use anchor_lang::prelude::*;

use crate::{events::VerifyEvent, state::{ZKPRequest, ZKPRequestStatus}, AlbusError, constants::AUTHORIZED_AUTHORITY};

use std::str::FromStr;

pub fn handler(ctx: Context<Verify>, data: VerifyData) -> Result<()> {
    let req = &mut ctx.accounts.zkp_request;

    if !AUTHORIZED_AUTHORITY.is_empty()
        && !AUTHORIZED_AUTHORITY
        .iter()
        .any(|a| Pubkey::from_str(a).unwrap() == ctx.accounts.authority.key())
    {
        return Err(AlbusError::Unauthorized.into());
    }

    if req.status == ZKPRequestStatus::Denied {
        return Err(AlbusError::Denied.into());
    }
    if req.status != ZKPRequestStatus::Proved {
        return Err(AlbusError::Unproved.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    req.status = data.status;
    req.verified_at = timestamp;

    emit!(VerifyEvent {
        zkp_request: req.key(),
        service_provider: req.service_provider,
        circuit: req.circuit,
        owner: req.owner,
        timestamp,
    });

    match req.status {
        ZKPRequestStatus::Verified => msg!("Verified!"),
        ZKPRequestStatus::Denied => msg!("Denied!"),
        _ => return Err(AlbusError::WrongData.into())
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VerifyData {
    pub status: ZKPRequestStatus,
}

#[derive(Accounts)]
pub struct Verify<'info> {
    #[account(mut)]
    pub zkp_request: Box<Account<'info, ZKPRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
