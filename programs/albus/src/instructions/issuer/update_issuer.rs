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
use anchor_lang::prelude::*;

use crate::state::Issuer;
use crate::utils::{assert_authorized, cmp_pubkeys};

pub fn handler(ctx: Context<UpdateIssuer>, data: UpdateIssuerData) -> Result<()> {
    let issuer = &mut ctx.accounts.issuer;
    let is_admin = assert_authorized(ctx.accounts.authority.key).is_ok();
    let is_authorized = is_admin || cmp_pubkeys(&issuer.authority, ctx.accounts.authority.key);

    if !is_authorized {
        return Err(AlbusError::Unauthorized.into());
    }

    if let Some(name) = data.name {
        issuer.name = name;
    }

    if let Some(description) = data.description {
        issuer.description = description;
    }

    if let Some(authority) = data.new_authority {
        issuer.authority = authority;
    }

    if let Some(pubkey) = data.pubkey {
        issuer.pubkey = pubkey;
        if let Some(zk_pubkey) = data.zk_pubkey {
            issuer.zk_pubkey = zk_pubkey;
        } else {
            msg!("ZK pubkey is required");
            return Err(AlbusError::Unauthorized.into());
        }
    }

    // Admin updates
    if is_admin {
        if let Some(is_disabled) = data.is_disabled {
            issuer.is_disabled = is_disabled;
        }
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateIssuerData {
    pub name: Option<String>,
    pub description: Option<String>,
    pub pubkey: Option<Pubkey>,
    pub zk_pubkey: Option<[u8; 64]>,
    pub new_authority: Option<Pubkey>,
    pub is_disabled: Option<bool>,
}

#[derive(Accounts)]
pub struct UpdateIssuer<'info> {
    #[account(mut)]
    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
