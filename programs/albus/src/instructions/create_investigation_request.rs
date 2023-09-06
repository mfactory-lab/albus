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

use crate::constants::DEFAULT_SECRET_SHARE_THRESHOLD;
use anchor_lang::prelude::*;

use crate::state::{InvestigationRequest, InvestigationStatus, ProofRequest};

pub fn handler(
    ctx: Context<CreateInvestigationRequest>,
    data: CreateInvestigationRequestData,
) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let proof_request = &mut ctx.accounts.proof_request;

    let investigation_request = &mut ctx.accounts.investigation_request;
    investigation_request.authority = ctx.accounts.authority.key();
    investigation_request.encryption_key = data.encryption_key;
    investigation_request.proof_request = proof_request.key();
    investigation_request.proof_request_owner = proof_request.owner;
    investigation_request.service_provider = proof_request.service_provider;
    // TODO: get from service provider
    investigation_request.required_share_count = DEFAULT_SECRET_SHARE_THRESHOLD;
    // investigation_request.secret_shares = Default::default();
    investigation_request.status = InvestigationStatus::Pending;
    investigation_request.created_at = timestamp;
    investigation_request.bump = ctx.bumps["investigation_request"];

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInvestigationRequestData {
    pub encryption_key: Option<Pubkey>,
}

#[derive(Accounts)]
#[instruction(data: CreateInvestigationRequestData)]
pub struct CreateInvestigationRequest<'info> {
    #[account(
        init,
        seeds = [
            InvestigationRequest::SEED,
            proof_request.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = InvestigationRequest::space()
    )]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(mut)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
