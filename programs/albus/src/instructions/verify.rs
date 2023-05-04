use std::str::FromStr;

use anchor_lang::prelude::*;

use crate::{
    constants::AUTHORIZED_AUTHORITY,
    events::{RejectEvent, VerifyEvent},
    state::{ZKPRequest, ZKPRequestStatus},
    AlbusError,
};

/// Verifies the [ZKPRequest] and updates its status accordingly.
/// Returns an error if the authority is not authorized, the request has not been proved,
/// the request has expired or the status is not valid.
pub fn handler(ctx: Context<Verify>, data: VerifyData) -> Result<()> {
    let req = &mut ctx.accounts.zkp_request;

    // Check that the authority is authorized to perform this action
    if !AUTHORIZED_AUTHORITY.is_empty()
        && !AUTHORIZED_AUTHORITY
            .iter()
            .any(|a| Pubkey::from_str(a).unwrap() == ctx.accounts.authority.key())
    {
        return Err(AlbusError::Unauthorized.into());
    }

    // Check that the ZKP request has already been proved
    if req.status != ZKPRequestStatus::Proved {
        return Err(AlbusError::Unproved.into());
    }

    // Check that the ZKP request has not yet expired
    let timestamp = Clock::get()?.unix_timestamp;
    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    req.status = data.status;
    req.verified_at = timestamp;

    match req.status {
        ZKPRequestStatus::Verified => {
            emit!(VerifyEvent {
                zkp_request: req.key(),
                service_provider: req.service_provider,
                circuit: req.circuit,
                owner: req.owner,
                timestamp,
            });
            msg!("Verified!");
        }
        ZKPRequestStatus::Rejected => {
            emit!(RejectEvent {
                zkp_request: req.key(),
                service_provider: req.service_provider,
                circuit: req.circuit,
                owner: req.owner,
                timestamp,
            });
            msg!("Rejected!")
        }
        _ => return Err(AlbusError::WrongData.into()),
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
