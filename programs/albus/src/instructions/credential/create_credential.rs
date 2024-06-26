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

use crate::constants::{CREDENTIAL_NAME, CREDENTIAL_SYMBOL_CODE, NFT_SYMBOL_PREFIX};
use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;
use anchor_spl::associated_token::AssociatedToken as AssociatedTokenProgram;
use anchor_spl::metadata::mpl_token_metadata::instructions::MintV1CpiBuilder;
use anchor_spl::metadata::mpl_token_metadata::instructions::{
    CreateV1CpiBuilder, DelegateStandardV1CpiBuilder, FreezeDelegatedAccountCpiBuilder,
};
use anchor_spl::metadata::mpl_token_metadata::types::{PrintSupply, TokenStandard};
use anchor_spl::metadata::Metadata as MetadataProgram;
use anchor_spl::token::Token as TokenProgram;

pub fn handler(ctx: Context<CreateCredential>) -> Result<()> {
    let signer_seeds = [ID.as_ref(), &[ctx.bumps.albus_authority]];

    let payer: &AccountInfo = &ctx.accounts.payer;

    // Albus payer
    // let balance = ctx.accounts.albus_authority.lamports();
    // requires 0.0219862 SOL
    // if balance > 25_000_000 {
    //     payer = &ctx.accounts.albus_authority;
    // }

    CreateV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .name(CREDENTIAL_NAME.into())
        .uri(Default::default())
        .symbol(format!("{}-{}", NFT_SYMBOL_PREFIX, CREDENTIAL_SYMBOL_CODE))
        .mint(&ctx.accounts.mint, true)
        .metadata(&ctx.accounts.metadata_account)
        .master_edition(Some(&ctx.accounts.edition_account))
        .token_standard(TokenStandard::NonFungible)
        // .token_standard(TokenStandard::ProgrammableNonFungible)
        .payer(payer)
        .authority(&ctx.accounts.albus_authority)
        .seller_fee_basis_points(0)
        .update_authority(&ctx.accounts.albus_authority, true)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(&ctx.accounts.token_program)
        .print_supply(PrintSupply::Zero)
        .is_mutable(true)
        .invoke_signed(&[&signer_seeds])?;

    MintV1CpiBuilder::new(&ctx.accounts.token_program)
        .token(&ctx.accounts.token_account)
        .token_owner(Some(&ctx.accounts.authority))
        .token_record(ctx.accounts.token_record.as_deref())
        .mint(&ctx.accounts.mint)
        .metadata(&ctx.accounts.metadata_account)
        .master_edition(Some(&ctx.accounts.edition_account))
        .authority(&ctx.accounts.albus_authority)
        .payer(payer)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(&ctx.accounts.token_program)
        .spl_ata_program(&ctx.accounts.ata_program)
        .invoke_signed(&[&signer_seeds])?;

    DelegateStandardV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .delegate(&ctx.accounts.albus_authority)
        .token(&ctx.accounts.token_account)
        .metadata(&ctx.accounts.metadata_account)
        .mint(&ctx.accounts.mint)
        .master_edition(Some(&ctx.accounts.edition_account))
        .authority(&ctx.accounts.authority)
        .payer(payer)
        .spl_token_program(Some(&ctx.accounts.token_program))
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .invoke_signed(&[&signer_seeds])?;

    FreezeDelegatedAccountCpiBuilder::new(&ctx.accounts.metadata_program)
        .mint(&ctx.accounts.mint)
        .edition(&ctx.accounts.edition_account)
        .token_account(&ctx.accounts.token_account)
        .delegate(&ctx.accounts.albus_authority)
        .token_program(&ctx.accounts.token_program)
        .invoke_signed(&[&signer_seeds])?;

    // For Programmable NFT use UtilityV1 and LockV1

    // let mut delegate_builder = DelegateUtilityV1CpiBuilder::new(&ctx.accounts.metadata_program);

    // let mut lock_builder = LockV1CpiBuilder::new(&ctx.accounts.metadata_program);
    // lock_builder
    //     .token(&ctx.accounts.token_account)
    //     .mint(&ctx.accounts.mint)
    //     .metadata(&ctx.accounts.metadata_account)
    //     .authority(&ctx.accounts.payer)
    //     .payer(&ctx.accounts.payer)
    //     .spl_token_program(Some(&ctx.accounts.token_program))
    //     .system_program(&ctx.accounts.system_program)
    //     .sysvar_instructions(&ctx.accounts.sysvar_instructions);
    //
    // lock_builder.invoke_signed(&[&signer_seeds])?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateCredential<'info> {
    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    /// Destination token account (required for pNFT).
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// Token record (required for pNFT).
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    token_record: Option<UncheckedAccount<'info>>,

    /// Mint account of the NFT.
    /// The account will be initialized if necessary.
    ///
    /// Must be a signer if:
    ///   * the mint account does not exist.
    ///
    /// CHECK: account checked in CPI
    #[account(mut)]
    pub mint: Signer<'info>,

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
    pub payer: Signer<'info>,

    pub authority: Signer<'info>,

    /// SPL Token program.
    pub token_program: Program<'info, TokenProgram>,

    /// SPL Associated Token program.
    pub ata_program: Program<'info, AssociatedTokenProgram>,

    /// Token Metadata program.
    pub metadata_program: Program<'info, MetadataProgram>,

    /// Instructions sysvar account.
    ///
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::instructions::id())]
    pub sysvar_instructions: UncheckedAccount<'info>,

    /// System program.
    pub system_program: Program<'info, System>,
}
