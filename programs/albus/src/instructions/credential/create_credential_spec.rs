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
use crate::state::{CredentialSpec, Issuer};
use crate::utils::{assert_authorized, cmp_pubkeys};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<CreateCredentialSpec>, data: CreateCredentialSpecData) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let issuer = &ctx.accounts.issuer;

    if assert_authorized(authority.key).is_err() && !cmp_pubkeys(&issuer.authority, authority.key) {
        return Err(AlbusError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    let spec = &mut ctx.accounts.credential_spec;
    spec.bump = ctx.bumps.credential_spec;
    spec.issuer = issuer.key();
    spec.code = data.code;
    spec.name = data.name;
    spec.uri = data.uri;
    spec.created_at = timestamp;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCredentialSpecData {
    pub code: String,
    pub name: String,
    pub uri: String,
}

#[derive(Accounts)]
#[instruction(data: CreateCredentialSpecData)]
pub struct CreateCredentialSpec<'info> {
    #[account(
        init,
        seeds = [
            CredentialSpec::SEED,
            issuer.key().as_ref(),
            data.code.as_bytes(),
        ],
        bump,
        payer = authority,
        space = CredentialSpec::space()
    )]
    pub credential_spec: Box<Account<'info, CredentialSpec>>,

    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
