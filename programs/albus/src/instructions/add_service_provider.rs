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

use crate::state::ServiceProvider;
use crate::utils::assert_authorized;

pub fn handler(ctx: Context<AddServiceProvider>, data: AddServiceProviderData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let timestamp = Clock::get()?.unix_timestamp;

    let sp = &mut ctx.accounts.service_provider;
    sp.code = data.code;
    sp.name = data.name;
    sp.authority = ctx.accounts.authority.key();
    sp.created_at = timestamp;
    sp.bump = ctx.bumps["service_provider"];

    Ok(())
}

/// Data required to add a new service provider
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AddServiceProviderData {
    /// The unique code representing the service
    pub code: String,
    /// The name of the service
    pub name: String,
}

#[derive(Accounts)]
#[instruction(data: AddServiceProviderData)]
pub struct AddServiceProvider<'info> {
    #[account(
        init,
        seeds = [ServiceProvider::SEED, data.code.as_bytes()],
        bump,
        payer = authority,
        space = ServiceProvider::space()
    )]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
