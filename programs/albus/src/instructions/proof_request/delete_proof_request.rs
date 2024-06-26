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

use anchor_lang::prelude::*;

use crate::errors::AlbusError;
use crate::{events::DeleteProofRequestEvent, state::ProofRequest, utils::cmp_pubkeys};

pub fn handler(ctx: Context<DeleteProofRequest>) -> Result<()> {
    let req = &mut ctx.accounts.proof_request;

    if !cmp_pubkeys(&req.owner, &ctx.accounts.authority.key()) {
        msg!("Error: Only request owner can delete it!");
        return Err(AlbusError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    if req.is_verified() && timestamp < req.retention_end_date {
        msg!(
            "Error: Retention period has not reached. The proof request may be deleted on {}",
            req.retention_end_date
        );
        return Err(AlbusError::Unauthorized.into());
    }

    emit!(DeleteProofRequestEvent {
        proof_request: req.key(),
        owner: req.owner,
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteProofRequest<'info> {
    #[account(mut, close = authority)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
