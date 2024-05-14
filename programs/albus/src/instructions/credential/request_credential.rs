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
use crate::events::CreateCredentialRequestEvent;
use crate::state::{CredentialRequest, CredentialRequestStatus, CredentialSpec, Issuer};
use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar;
use anchor_spl::metadata::mpl_token_metadata::instructions::UpdateV1CpiBuilder;
use anchor_spl::metadata::mpl_token_metadata::types::Data;
use anchor_spl::metadata::Metadata as MetadataProgram;
use anchor_spl::metadata::MetadataAccount;
use anchor_spl::token::TokenAccount;

pub fn handler(ctx: Context<RequestCredential>, data: RequestCredentialData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let spec = &mut ctx.accounts.credential_spec;
    spec.credential_request_count += 1;

    let req = &mut ctx.accounts.credential_request;
    req.authority = ctx.accounts.authority.key();
    req.credential_owner = ctx.accounts.credential_owner.key();
    req.credential_mint = ctx.accounts.credential_mint.key();
    req.credential_spec = spec.key();
    req.issuer = ctx.accounts.issuer.key();
    req.uri = data.uri;
    req.status = CredentialRequestStatus::Pending;
    req.created_at = timestamp;
    req.message = Default::default();
    req.bump = ctx.bumps.credential_request;

    // Reset credential if needed
    let signer_seeds = [ID.as_ref(), &[ctx.bumps.albus_authority]];
    let metadata = &ctx.accounts.credential_metadata;

    UpdateV1CpiBuilder::new(&ctx.accounts.metadata_program)
        .metadata(&metadata.to_account_info())
        .authority(&ctx.accounts.albus_authority)
        .token(Some(&ctx.accounts.credential_token.to_account_info()))
        .mint(&ctx.accounts.credential_mint.to_account_info())
        .payer(&ctx.accounts.authority)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .system_program(&ctx.accounts.system_program)
        .data(Data {
            name: metadata.name.to_string(),
            symbol: metadata.symbol.to_string(),
            // empty uri means pending credential
            uri: Default::default(),
            seller_fee_basis_points: metadata.seller_fee_basis_points,
            creators: metadata.creators.clone(),
        })
        .invoke_signed(&[&signer_seeds])?;

    emit!(CreateCredentialRequestEvent {
        authority: req.authority,
        credential_owner: req.credential_owner,
        credential_spec: req.credential_spec,
        credential_mint: req.credential_mint,
        issuer: req.issuer,
        uri: req.uri.to_owned(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RequestCredentialData {
    /// Presentation uri
    pub uri: String,
}

#[derive(Accounts)]
#[instruction(data: RequestCredentialData)]
pub struct RequestCredential<'info> {
    #[account(
        init_if_needed,
        seeds = [
            CredentialRequest::SEED,
            credential_spec.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = CredentialRequest::space()
    )]
    pub credential_request: Box<Account<'info, CredentialRequest>>,

    #[account(mut, has_one = issuer)]
    pub credential_spec: Box<Account<'info, CredentialSpec>>,

    /// Mint account of the NFT.
    ///
    /// CHECK: account checked in CPI
    pub credential_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub credential_metadata: Account<'info, MetadataAccount>,

    #[account(
        associated_token::mint = credential_mint,
        associated_token::authority = credential_owner,
        constraint = credential_token.amount == 1
    )]
    pub credential_token: Account<'info, TokenAccount>,

    pub credential_owner: Signer<'info>,

    pub issuer: Box<Account<'info, Issuer>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

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
