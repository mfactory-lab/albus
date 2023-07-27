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
use crate::ID;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::state::{Collection, DataV2};

use crate::utils::mint_nft;

pub fn handler(ctx: Context<MintCredential>, data: MintCredentialData) -> Result<()> {
    // let creators: Vec<Creator> = vec![];
    let collection = None;

    mint_nft(
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.albus_authority.to_account_info(),
        &ctx.accounts.metadata_account.to_account_info(),
        Some(&ctx.accounts.edition_account.to_account_info()),
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.rent.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        Some(&[ID.as_ref(), &[ctx.bumps["albus_authority"]]]),
        DataV2 {
            symbol: format!("{}-{}", NFT_SYMBOL_PREFIX, VC_SYMBOL_CODE),
            name: "Albus Verifiable Credential".to_owned(),
            uri: data.uri,
            creators: None,
            seller_fee_basis_points: 0,
            collection: collection.map(|key| Collection {
                key,
                verified: false,
            }),
            uses: None,
        },
    )?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintCredentialData {
    pub uri: String,
}

#[derive(Accounts)]
pub struct MintCredential<'info> {
    /// CHECK:
    #[account(seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = albus_authority,
        mint::freeze_authority = albus_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub edition_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub metadata_program: Program<'info, TokenMetadata>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Clone)]
pub struct TokenMetadata;

impl Id for TokenMetadata {
    fn id() -> Pubkey {
        mpl_token_metadata::ID
    }
}
