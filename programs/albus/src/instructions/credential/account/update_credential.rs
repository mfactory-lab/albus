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

use crate::state::{Credential, CredentialStatus, MAX_CREDENTIAL_URI_LEN};
use crate::utils::assert_authorized;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<UpdateCredential>, data: UpdateCredentialData) -> Result<()> {
    assert_authorized(ctx.accounts.authority.key)?;

    if data.uri.len() > MAX_CREDENTIAL_URI_LEN {
        msg!("Error: Max uri length is {}", MAX_CREDENTIAL_URI_LEN);
        return Err(ProgramError::InvalidArgument.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    let credential = &mut ctx.accounts.credential;
    credential.uri = data.uri;
    credential.status = data.status;
    credential.processed_at = timestamp;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCredentialData {
    pub status: CredentialStatus,
    pub uri: String,
}

#[derive(Accounts)]
pub struct UpdateCredential<'info> {
    #[account(mut)]
    pub credential: Box<Account<'info, Credential>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
