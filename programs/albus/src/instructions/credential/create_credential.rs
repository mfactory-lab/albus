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

use crate::state::{Credential, Issuer, MAX_CREDENTIAL_URI_LEN};
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<CreateCredential>, data: CreateCredentialData) -> Result<()> {
    if data.uri.len() > MAX_CREDENTIAL_URI_LEN {
        msg!("Error: Max uri length is {}", MAX_CREDENTIAL_URI_LEN);
        return Err(ProgramError::InvalidArgument.into());
    }

    let authority = &ctx.accounts.authority;

    let issuer = &mut ctx.accounts.issuer;
    issuer.credential_counter += 1;

    let credential = &mut ctx.accounts.credential;

    let timestamp = Clock::get()?.unix_timestamp;

    credential.uri = data.uri;
    credential.issuer = issuer.key();
    credential.authority = authority.key();
    credential.created_at = timestamp;
    credential.bump = ctx.bumps.credential;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCredentialData {
    pub uri: String,
}

#[derive(Accounts)]
pub struct CreateCredential<'info> {
    #[account(
        init,
        seeds = [Credential::SEED, &issuer.credential_counter.to_le_bytes()],
        bump,
        payer = payer,
        space = Credential::space()
    )]
    pub credential: Box<Account<'info, Credential>>,

    #[account(mut)]
    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}