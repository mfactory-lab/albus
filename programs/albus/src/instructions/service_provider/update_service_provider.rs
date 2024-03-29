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

use crate::state::{ContactInfo, Trustee};
use crate::{errors::AlbusError, state::ServiceProvider};

pub fn handler<'info>(
    ctx: Context<'_, '_, 'info, 'info, UpdateServiceProvider<'info>>,
    data: UpdateServiceProviderData,
) -> Result<()> {
    let service = &mut ctx.accounts.service_provider;

    if let Some(new_authority) = data.new_authority {
        service.authority = new_authority;
    }

    if let Some(name) = data.name {
        service.name = name;
    }

    if let Some(website) = data.website {
        service.website = website;
    }

    if let Some(contact_info) = data.contact_info {
        service.contact_info = contact_info;
    }

    if let Some(n) = data.secret_share_threshold {
        service.secret_share_threshold = n;
    }

    if data.clear_trustees || !ctx.remaining_accounts.is_empty() {
        service.trustees.clear();
    }

    if !ctx.remaining_accounts.is_empty() {
        for acc in ctx.remaining_accounts {
            let trustee = Account::<Trustee>::try_from(acc).map_err(|_e| {
                msg!("Invalid trustee account `{}`", acc.key);
                AlbusError::InvalidData
            })?;
            if !trustee.is_verified {
                msg!("Selected trustee `{}` is not verified", acc.key);
                return Err(AlbusError::InvalidData.into());
            }
            service.trustees.push(acc.key());
        }
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateServiceProviderData {
    pub new_authority: Option<Pubkey>,
    pub name: Option<String>,
    pub website: Option<String>,
    pub contact_info: Option<ContactInfo>,
    pub secret_share_threshold: Option<u8>,
    pub clear_trustees: bool,
}

#[derive(Accounts)]
pub struct UpdateServiceProvider<'info> {
    #[account(mut, has_one = authority)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
