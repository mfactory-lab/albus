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

use crate::state::Issuer;
use crate::utils::assert_authorized;

pub fn handler(ctx: Context<CreateIssuer>, data: CreateIssuerData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let timestamp = Clock::get()?.unix_timestamp;

    let issuer = &mut ctx.accounts.issuer;
    issuer.code = data.code;
    issuer.name = data.name;
    issuer.description = data.description;
    issuer.created_at = timestamp;
    issuer.authority = data.authority;
    issuer.pubkey = data.pubkey;
    issuer.zk_pubkey = data.zk_pubkey;
    issuer.bump = ctx.bumps.issuer;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateIssuerData {
    pub code: String,
    pub name: String,
    pub description: String,
    pub authority: Pubkey,
    pub pubkey: Pubkey,
    pub zk_pubkey: [u8; 64],
}

#[derive(Accounts)]
#[instruction(data: CreateIssuerData)]
pub struct CreateIssuer<'info> {
    #[account(
        init,
        seeds = [Issuer::SEED, data.code.as_bytes()],
        bump,
        payer = authority,
        space = Issuer::space()
    )]
    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
