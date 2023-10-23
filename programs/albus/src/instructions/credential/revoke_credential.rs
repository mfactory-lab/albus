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

use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;
use anchor_spl::token::Token;
use mpl_token_metadata::instructions::{BurnV1CpiBuilder, ThawDelegatedAccountCpiBuilder};

pub fn handler(ctx: Context<RevokeCredential>) -> Result<()> {
    // assert_authorized(ctx.accounts.authority.key)?;
    let signer_seeds = [ID.as_ref(), &[ctx.bumps["albus_authority"]]];

    ThawDelegatedAccountCpiBuilder::new(&ctx.accounts.metadata_program)
        .mint(&ctx.accounts.mint)
        .edition(&ctx.accounts.edition_account)
        .token_account(&ctx.accounts.token_account)
        .delegate(&ctx.accounts.albus_authority)
        .token_program(&ctx.accounts.token_program)
        .invoke_signed(&[&signer_seeds])?;

    BurnV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .authority(&ctx.accounts.authority)
        .metadata(&ctx.accounts.metadata_account)
        .token(&ctx.accounts.token_account)
        .mint(&ctx.accounts.mint)
        .edition(Some(&ctx.accounts.edition_account))
        .spl_token_program(&ctx.accounts.token_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .system_program(&ctx.accounts.system_program)
        .invoke()?;

    // builder.invoke_signed(&[&signer_seeds])?;

    Ok(())
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    /// Destination token account (required for pNFT).
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// Mint account of the NFT.
    /// The account will be initialized if necessary.
    ///
    /// Must be a signer if:
    ///   * the mint account does not exist.
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,

    /// Metadata account of the NFT.
    /// This account must be uninitialized.
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// Master edition account of the NFT.
    /// The account will be initialized if necessary.
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub edition_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// Token Metadata program.
    ///
    /// CHECK: account checked in CPI
    pub metadata_program: Program<'info, TokenMetadata>,

    /// SPL Token program.
    pub token_program: Program<'info, Token>,

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
