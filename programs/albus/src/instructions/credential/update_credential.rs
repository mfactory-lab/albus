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
use crate::state::Issuer;
use crate::utils::{assert_authorized, cmp_pubkeys};
use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;
use anchor_spl::metadata::mpl_token_metadata::{instructions::UpdateV1CpiBuilder, types::Data};
use anchor_spl::metadata::Metadata as MetadataProgram;
use anchor_spl::metadata::MetadataAccount;

pub fn handler(ctx: Context<UpdateCredential>, data: UpdateCredentialData) -> Result<()> {
    let signer_seeds = [ID.as_ref(), &[ctx.bumps.albus_authority]];
    let metadata = &ctx.accounts.metadata_account;

    match &ctx.accounts.issuer {
        Some(issuer) => {
            if issuer.is_disabled {
                msg!("Error: Issuer is disabled");
                return Err(AlbusError::Unauthorized.into());
            }
            if !cmp_pubkeys(&issuer.authority, ctx.accounts.authority.key) {
                msg!("Error: Issuer authority mismatch");
                return Err(AlbusError::Unauthorized.into());
            }
            // Only an authorized issuer can update the credential
            if let Some(creators) = &metadata.creators {
                let found = creators
                    .iter()
                    .find(|&c| cmp_pubkeys(&c.address, &issuer.key()));
                if found.is_none() {
                    msg!("Error: Issuer authority mismatch");
                    return Err(AlbusError::Unauthorized.into());
                }
            } else {
                msg!("Error: Credential is not owned by an issuer");
                return Err(AlbusError::Unauthorized.into());
            }
        }
        None => {
            // superuser can update any credential
            assert_authorized(ctx.accounts.authority.key)?;
        }
    }

    UpdateV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .metadata(&metadata.to_account_info())
        .authority(&ctx.accounts.albus_authority)
        // .token(Some(&ctx.accounts.token_account))
        .mint(&ctx.accounts.mint)
        .payer(&ctx.accounts.albus_authority)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .system_program(&ctx.accounts.system_program)
        .data(Data {
            name: data.name.unwrap_or(metadata.name.to_string()),
            symbol: metadata.symbol.to_string(),
            uri: data.uri,
            seller_fee_basis_points: metadata.seller_fee_basis_points,
            creators: metadata.creators.clone(),
        })
        // .is_mutable(true)
        .invoke_signed(&[&signer_seeds])?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCredentialData {
    pub name: Option<String>,
    pub uri: String,
}

#[derive(Accounts)]
pub struct UpdateCredential<'info> {
    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    /// (Optional) Credential issuer.
    pub issuer: Option<Box<Account<'info, Issuer>>>,

    /// Mint account of the NFT.
    ///
    /// CHECK: account checked in CPI
    pub mint: UncheckedAccount<'info>,

    /// Metadata account of the NFT.
    #[account(mut)]
    pub metadata_account: Account<'info, MetadataAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// Instructions sysvar account.
    ///
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub sysvar_instructions: UncheckedAccount<'info>,

    /// Token Metadata program.
    ///
    /// CHECK: account checked in CPI
    pub metadata_program: Program<'info, MetadataProgram>,

    pub system_program: Program<'info, System>,
}
