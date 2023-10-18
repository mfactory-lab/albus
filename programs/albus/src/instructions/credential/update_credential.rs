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

use crate::constants::{NFT_SYMBOL_PREFIX, VC_SYMBOL_CODE};
use crate::utils::assert_authorized;
use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;
use mpl_token_metadata::instructions::UpdateV1CpiBuilder;
use mpl_token_metadata::types::{Creator, Data};

pub fn handler(ctx: Context<UpdateCredential>, data: UpdateCredentialData) -> Result<()> {
    assert_authorized(ctx.accounts.authority.key)?;

    let signer_seeds = [ID.as_ref(), &[ctx.bumps.albus_authority]];

    UpdateV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .metadata(&ctx.accounts.metadata_account)
        .authority(&ctx.accounts.albus_authority)
        .token(Some(&ctx.accounts.token_account))
        .mint(&ctx.accounts.mint)
        .payer(&ctx.accounts.authority)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .system_program(&ctx.accounts.system_program)
        .data(Data {
            name: data.name,
            symbol: format!("{}-{}", NFT_SYMBOL_PREFIX, VC_SYMBOL_CODE),
            uri: data.uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![
                Creator {
                    address: ctx.accounts.albus_authority.key(),
                    verified: true,
                    share: 100,
                },
                // Add issuer account ?
            ]),
        })
        .is_mutable(true)
        .invoke_signed(&[&signer_seeds])?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCredentialData {
    pub uri: String,
    pub name: String,
}

#[derive(Accounts)]
pub struct UpdateCredential<'info> {
    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    /// Destination token account (required for pNFT).
    ///
    /// CHECK: account checked in CPI
    pub token_account: UncheckedAccount<'info>,

    /// Mint account of the NFT.
    /// The account will be initialized if necessary.
    ///
    /// Must be a signer if:
    ///   * the mint account does not exist.
    ///
    /// CHECK: account checked in CPI
    pub mint: UncheckedAccount<'info>,

    /// Metadata account of the NFT.
    /// This account must be uninitialized.
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    // /// Master edition account of the NFT.
    // /// The account will be initialized if necessary.
    // ///
    // /// CHECK: account checked in CPI
    // #[account(mut)]
    // pub edition_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Token Metadata program.
    ///
    /// CHECK: account checked in CPI
    pub metadata_program: Program<'info, TokenMetadata>,

    /// Instructions sysvar account.
    ///
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub sysvar_instructions: UncheckedAccount<'info>,

    /// System program.
    pub system_program: Program<'info, System>,
}

#[derive(Clone)]
pub struct TokenMetadata;

impl Id for TokenMetadata {
    fn id() -> Pubkey {
        mpl_token_metadata::ID
    }
}
