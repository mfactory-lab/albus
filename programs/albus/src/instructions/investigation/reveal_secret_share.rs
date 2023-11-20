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
use crate::events::RevealSecretShareEvent;
use anchor_lang::prelude::*;

use crate::state::{InvestigationRequest, InvestigationRequestShare, RevelationStatus, Trustee};
use crate::utils::cmp_pubkeys;

pub fn handler(ctx: Context<RevealSecretShare>, data: RevealSecretShareData) -> Result<()> {
    let share = &mut ctx.accounts.investigation_request_share;
    if share.revealed_at != 0 {
        msg!("Error: Already revealed");
        return Err(AlbusError::InvalidData.into());
    }

    let investigation_request = &mut ctx.accounts.investigation_request;
    let trustee = &mut ctx.accounts.trustee;

    if investigation_request.revealed_share_count >= investigation_request.required_share_count {
        msg!("Error: Revelation threshold reached");
        return Err(AlbusError::Unauthorized.into());
    }

    investigation_request.revealed_share_count += 1;

    let authority = ctx.accounts.authority.key();

    if cmp_pubkeys(&investigation_request.proof_request_owner, &authority) {
        share.status = RevelationStatus::RevealedByUser;
    } else if cmp_pubkeys(&trustee.authority, &authority) {
        trustee.revealed_share_count += 1;
        share.status = RevelationStatus::RevealedByTrustee;
    } else {
        msg!("Error: Only the trustee or the request owner can reveal a share.");
        return Err(AlbusError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    share.investigation_request = investigation_request.key();
    share.proof_request_owner = investigation_request.proof_request_owner;
    share.trustee = trustee.key();

    // TODO: don't update index if account already created?
    share.index = data.index;
    share.share = data.share;
    share.revealed_at = timestamp;

    if share.created_at == 0 {
        share.created_at = timestamp;
    }

    emit!(RevealSecretShareEvent {
        investigation_request: investigation_request.key(),
        proof_request: investigation_request.proof_request,
        proof_request_owner: investigation_request.proof_request_owner,
        authority: investigation_request.authority,
        trustee: trustee.key(),
        index: data.index,
        status: share.status.clone(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RevealSecretShareData {
    pub index: u8,
    pub share: Vec<u8>,
}

#[derive(Accounts)]
pub struct RevealSecretShare<'info> {
    #[account(
        init_if_needed,
        seeds = [
            InvestigationRequestShare::SEED,
            investigation_request.key().as_ref(),
            trustee.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = InvestigationRequestShare::space()
    )]
    pub investigation_request_share: Box<Account<'info, InvestigationRequestShare>>,

    #[account(mut)]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(mut)]
    pub trustee: Box<Account<'info, Trustee>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
