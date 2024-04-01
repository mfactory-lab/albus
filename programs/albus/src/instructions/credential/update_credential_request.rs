/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
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
 * The developer of this program can be contacted at <info@albus.finance>.
 */

use crate::errors::AlbusError;
use crate::state::{CredentialRequest, CredentialRequestStatus, Issuer, MAX_CRED_REQ_MSG_LEN};
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdateCredentialRequest>,
    data: UpdateCredentialRequestData,
) -> Result<()> {
    let req = &mut ctx.accounts.credential_request;

    if data.message.len() > MAX_CRED_REQ_MSG_LEN {
        msg!("Message too long, max {}", MAX_CRED_REQ_MSG_LEN);
        return Err(AlbusError::InvalidData.into());
    }

    req.status = data.status;
    req.message = data.message;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCredentialRequestData {
    pub status: CredentialRequestStatus,
    pub message: String,
}

#[derive(Accounts)]
#[instruction(data: UpdateCredentialRequestData)]
pub struct UpdateCredentialRequest<'info> {
    #[account(mut, has_one = issuer)]
    pub credential_request: Box<Account<'info, CredentialRequest>>,

    #[account(has_one = authority)]
    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
