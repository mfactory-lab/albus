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

use crate::AlbusError;
use anchor_lang::prelude::*;

use crate::state::{
    InvestigationRequest, InvestigationRequestShare, RevelationStatus, ServiceProvider, Trustee,
};
use crate::utils::cmp_pubkeys;

pub fn handler(ctx: Context<RevealSecretShare>, data: RevealSecretShareData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let service = &mut ctx.accounts.service_provider;
    let trustee = &mut ctx.accounts.trustee;
    trustee.revealed_share_count += 1;

    if !service
        .trustees
        .iter()
        .any(|t| cmp_pubkeys(t, &trustee.key()))
    {
        msg!("Error: Unauthorized trustee");
        return Err(AlbusError::Unauthorized.into());
    }

    let request = &mut ctx.accounts.investigation_request;

    if request.revealed_share_count >= request.required_share_count {
        msg!("Error: Revelation threshold reached");
        return Err(AlbusError::Unauthorized.into());
    }

    request.revealed_share_count += 1;

    let share = &mut ctx.accounts.investigation_request_share;
    share.investigation_request = request.key();
    share.proof_request_owner = request.proof_request_owner;
    share.trustee = trustee.key();
    share.index = data.index;
    share.share = data.share;
    share.revealed_at = timestamp;

    if share.created_at == 0 {
        share.created_at = timestamp;
    }

    let authority = ctx.accounts.authority.key();

    if cmp_pubkeys(&request.proof_request_owner, &authority) {
        share.status = RevelationStatus::RevealedByUser;
    } else if cmp_pubkeys(&trustee.key(), &authority) {
        share.status = RevelationStatus::RevealedByTrustee;
    } else {
        msg!("Error: Only the trustee or the request owner can reveal a share.");
        return Err(AlbusError::Unauthorized.into());
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RevealSecretShareData {
    pub index: u8,
    pub share: String,
}

#[derive(Accounts)]
#[instruction(data: RevealSecretShareData)]
pub struct RevealSecretShare<'info> {
    #[account(
        init_if_needed,
        seeds = [
            InvestigationRequestShare::SEED,
            investigation_request.key().as_ref(),
            &data.index.to_le_bytes(),
        ],
        bump,
        payer = authority,
        space = InvestigationRequestShare::space()
    )]
    pub investigation_request_share: Box<Account<'info, InvestigationRequestShare>>,

    #[account(mut, has_one = service_provider)]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(mut)]
    pub trustee: Box<Account<'info, Trustee>>,

    #[account(mut)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
