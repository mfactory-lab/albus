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

use crate::constants::DEFAULT_SECRET_SHARE_THRESHOLD;
use crate::state::ContactInfo;
use crate::{state::ServiceProvider, utils::assert_authorized};

pub fn handler(ctx: Context<CreateServiceProvider>, data: CreateServiceProviderData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let timestamp = Clock::get()?.unix_timestamp;

    let service = &mut ctx.accounts.service_provider;
    service.authority = data.authority.unwrap_or(ctx.accounts.authority.key());
    service.code = data.code;
    service.name = data.name;
    service.website = data.website;
    service.contact_info = data.contact_info.unwrap_or_default();

    service.secret_share_threshold = data
        .secret_share_threshold
        .unwrap_or(DEFAULT_SECRET_SHARE_THRESHOLD);

    service.created_at = timestamp;
    service.bump = ctx.bumps.service_provider;

    if let Some(trustees) = data.trustees {
        service.trustees = trustees;
    }

    Ok(())
}

/// Data required to add a new service provider
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateServiceProviderData {
    /// The unique code representing the service
    pub code: String,
    /// The name of the service
    pub name: String,
    pub website: String,
    pub contact_info: Option<ContactInfo>,
    /// Service authority
    pub authority: Option<Pubkey>,
    /// Required number of shares used to reconstruct the secret
    pub secret_share_threshold: Option<u8>,
    pub trustees: Option<Vec<Pubkey>>,
}

#[derive(Accounts)]
#[instruction(data: CreateServiceProviderData)]
pub struct CreateServiceProvider<'info> {
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
