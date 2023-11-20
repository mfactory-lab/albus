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
use crate::events::DeleteInvestigationRequestEvent;
use crate::state::{InvestigationRequest, InvestigationRequestShare};
use crate::utils::close;

pub fn handler<'info>(
    ctx: Context<'_, '_, 'info, 'info, DeleteInvestigationRequest<'info>>,
) -> Result<()> {
    let investigation_request = &ctx.accounts.investigation_request;

    if ctx.remaining_accounts.len() != investigation_request.trustees.len() {
        msg!("Error: Required all trustee accounts");
        return Err(AlbusError::Unauthorized.into());
    }

    // close all share accounts
    for acc in ctx.remaining_accounts {
        let share = Account::<InvestigationRequestShare>::try_from(acc).map_err(|_e| {
            msg!("Invalid investigation request share account `{}`", acc.key);
            AlbusError::InvalidData
        })?;
        if !investigation_request.trustees.contains(&share.trustee) {
            msg!("Invalid trustee account");
            return Err(AlbusError::InvalidData.into());
        }
        close(
            acc.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        )?;
    }

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteInvestigationRequestEvent {
        investigation_request: investigation_request.key(),
        proof_request: investigation_request.proof_request,
        proof_request_owner: investigation_request.proof_request_owner,
        authority: investigation_request.authority,
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteInvestigationRequest<'info> {
    #[account(mut, has_one = authority @ AlbusError::Unauthorized, close = authority)]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
