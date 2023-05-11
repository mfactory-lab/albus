/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, jFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@jfactory.ch>.
 */

use anchor_lang::prelude::*;

use crate::utils::assert_authorized;
use crate::{
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
    assert_authorized(&ctx.accounts.authority.key())?;

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
        _ => {
            msg!("Invalid status!");
            return Err(AlbusError::WrongData.into());
        }
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
