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
use crate::state::CredentialRequest;
use crate::utils::{assert_authorized, cmp_pubkeys};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<DeleteCredentialRequest>) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let req = &ctx.accounts.credential_request;

    if assert_authorized(authority.key).is_err() && !cmp_pubkeys(&req.owner, authority.key) {
        return Err(AlbusError::Unauthorized.into());
    }

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteCredentialRequest<'info> {
    #[account(mut, close = authority)]
    pub credential_request: Box<Account<'info, CredentialRequest>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
