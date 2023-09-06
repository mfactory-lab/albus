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

use crate::state::Trustee;

pub fn handler(ctx: Context<UpdateTrustee>, data: UpdateTrusteeData) -> Result<()> {
    let trustee = &mut ctx.accounts.trustee;

    if let Some(key) = data.key {
        trustee.key = key;
    }
    if let Some(name) = data.name {
        trustee.name = name;
    }
    if let Some(email) = data.email {
        trustee.email = email;
    }
    if let Some(website) = data.website {
        trustee.website = website;
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateTrusteeData {
    pub key: Option<[u8; 32]>,
    pub name: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
}

#[derive(Accounts)]
pub struct UpdateTrustee<'info> {
    #[account(mut, has_one = authority)]
    pub trustee: Box<Account<'info, Trustee>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
