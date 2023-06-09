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

use crate::state::Proof;
use crate::{
    events::ProveEvent,
    state::{ProofRequest, ProofRequestStatus},
    utils::cmp_pubkeys,
    AlbusError,
};

/// Proves the [ProofRequest] by validating the proof metadata and updating its status to `Proved`.
/// Returns an error if the request has expired or if the proof metadata is invalid.
pub fn handler(ctx: Context<Prove>, data: ProveData) -> Result<()> {
    let req = &mut ctx.accounts.proof_request;

    if !cmp_pubkeys(&req.owner, &ctx.accounts.authority.key()) {
        msg!("Error: Only request owner can prove it!");
        return Err(AlbusError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    req.status = ProofRequestStatus::Proved;
    req.proof = Some(data.proof.to_owned());
    req.proved_at = timestamp;
    req.verified_at = 0;

    emit!(ProveEvent {
        proof_request: req.key(),
        service_provider: req.service_provider,
        circuit: req.circuit,
        proof: data.proof,
        owner: req.owner,
        timestamp,
    });

    msg!("Proved!");

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProveData {
    pub proof: Proof,
}

#[derive(Accounts)]
#[instruction(data: ProveData)]
pub struct Prove<'info> {
    #[account(mut, realloc = ProofRequest::space() + data.proof.space(), realloc::payer = authority, realloc::zero = false)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
