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

use crate::{
    errors::AlbusError,
    state::{CredentialSpec, Issuer},
    utils::{assert_authorized, cmp_pubkeys},
};

pub fn handler(ctx: Context<DeleteCredentialSpec>) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let issuer = &ctx.accounts.issuer;

    if assert_authorized(authority.key).is_err() && !cmp_pubkeys(&issuer.authority, authority.key) {
        return Err(AlbusError::Unauthorized.into());
    }

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteCredentialSpec<'info> {
    #[account(mut, close = authority, has_one = issuer)]
    pub credential_spec: Box<Account<'info, CredentialSpec>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub issuer: Box<Account<'info, Issuer>>,

    pub system_program: Program<'info, System>,
}
