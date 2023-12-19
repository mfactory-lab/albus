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
use crate::utils::assert_authorized;

pub fn handler(ctx: Context<CreateTrustee>, data: CreateTrusteeData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let trustee = &mut ctx.accounts.trustee;

    trustee.authority = if let Some(authority) = data.authority {
        assert_authorized(&ctx.accounts.authority.key())?;
        authority
    } else {
        ctx.accounts.authority.key()
    };

    trustee.key = data.key;
    trustee.name = data.name;
    trustee.email = data.email;
    trustee.website = data.website;
    trustee.created_at = timestamp;
    trustee.is_verified = false;
    trustee.bump = ctx.bumps.trustee;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateTrusteeData {
    pub key: [u8; 32],
    pub name: String,
    pub email: String,
    pub website: String,
    pub authority: Option<Pubkey>,
}

#[derive(Accounts)]
#[instruction(data: CreateTrusteeData)]
pub struct CreateTrustee<'info> {
    #[account(
        init,
        seeds = [Trustee::SEED, data.key.as_ref()],
        bump,
        payer = authority,
        space = Trustee::space()
    )]
    pub trustee: Account<'info, Trustee>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
