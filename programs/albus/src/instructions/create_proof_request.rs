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
use anchor_spl::token::Mint;

use crate::{
    events::CreateProofRequestEvent,
    state::{ProofRequest, ProofRequestStatus, ServiceProvider},
    utils::assert_valid_circuit,
};

pub fn handler(ctx: Context<CreateProofRequest>, data: CreateProofRequestData) -> Result<()> {
    let circuit_metadata = assert_valid_circuit(&ctx.accounts.circuit_metadata)?;

    let timestamp = Clock::get()?.unix_timestamp;

    let req = &mut ctx.accounts.proof_request;
    req.service_provider = ctx.accounts.service_provider.key();
    req.owner = ctx.accounts.authority.key();
    req.circuit = circuit_metadata.mint;
    req.proved_at = 0;
    req.verified_at = 0;
    req.created_at = timestamp;
    req.status = ProofRequestStatus::Pending;
    req.bump = ctx.bumps["proof_request"];

    if data.expires_in > 0 {
        req.expired_at = timestamp.saturating_add(data.expires_in as i64);
    }

    let sp = &mut ctx.accounts.service_provider;
    sp.proof_request_count += 1;

    emit!(CreateProofRequestEvent {
        service_provider: req.service_provider,
        circuit: req.circuit,
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

    #[account(
        init_if_needed,
        seeds = [
            ProofRequest::SEED,
            service_provider.key().as_ref(),
            circuit_mint.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = ProofRequest::space()
    )]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    #[account(
        constraint = circuit_mint.supply == 1,
        constraint = circuit_mint.decimals == 0,
    )]
    pub circuit_mint: Box<Account<'info, Mint>>,

    /// CHECK: checked in metaplex
    pub circuit_metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
