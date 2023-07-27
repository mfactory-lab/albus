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

use crate::state::Policy;
use crate::{
    events::CreateProofRequestEvent,
    state::{ProofRequest, ProofRequestStatus, ServiceProvider},
};

pub fn handler(ctx: Context<CreateProofRequest>, data: CreateProofRequestData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let policy = &mut ctx.accounts.policy;
    policy.proof_request_count += 1;

    let service_provider = &mut ctx.accounts.service_provider;
    service_provider.proof_request_count += 1;

    let req = &mut ctx.accounts.proof_request;
    req.service_provider = service_provider.key();
    req.policy = policy.key();
    req.circuit = policy.circuit;
    req.owner = ctx.accounts.authority.key();
    req.identifier = service_provider.proof_request_count;
    req.proved_at = 0;
    req.verified_at = 0;
    req.created_at = timestamp;
    req.status = ProofRequestStatus::Pending;
    req.bump = ctx.bumps["proof_request"];

    if data.expires_in > 0 {
        req.expired_at = timestamp.saturating_add(data.expires_in as i64);
    } else if policy.proof_expires_in > 0 {
        req.expired_at = timestamp.saturating_add(policy.proof_expires_in as i64);
    }

    emit!(CreateProofRequestEvent {
        service_provider: req.service_provider,
        policy: req.policy,
        owner: req.owner,
        timestamp,
    });

    Ok(())
}

/// Data required to create a new proof request
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateProofRequestData {
    /// Time in seconds until the request expires
    pub expires_in: u32,
}

#[derive(Accounts)]
pub struct CreateProofRequest<'info> {
    #[account(mut)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut, has_one = service_provider)]
    pub policy: Box<Account<'info, Policy>>,

    #[account(
        init_if_needed,
        seeds = [
            ProofRequest::SEED,
            policy.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = ProofRequest::space()
    )]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
