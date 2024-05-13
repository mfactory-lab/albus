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
use crate::events::CreateCredentialRequestEvent;
use crate::state::{CredentialRequest, CredentialRequestStatus, CredentialSpec, Issuer};
use crate::utils::cmp_pubkeys;
use crate::ID;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use solana_program::program_option::COption;

pub fn handler(ctx: Context<RequestCredential>, data: RequestCredentialData) -> Result<()> {
    let (albus_authority, _) = Pubkey::find_program_address(&[ID.as_ref()], ctx.program_id);
    let token_account = &ctx.accounts.credential_token;

    match token_account.delegate {
        COption::None => {
            msg!("Missing delegate authority");
            return Err(AlbusError::Unauthorized.into());
        }
        COption::Some(delegate) => {
            if !cmp_pubkeys(&delegate, &albus_authority) {
                msg!("Delegate authority mismatch");
                return Err(AlbusError::Unauthorized.into());
            }
        }
    }

    let timestamp = Clock::get()?.unix_timestamp;
    let mint = &ctx.accounts.credential_mint;
    let issuer = &ctx.accounts.issuer;

    let spec = &mut ctx.accounts.credential_spec;
    spec.credential_request_count += 1;

    let req = &mut ctx.accounts.credential_request;
    req.credential_spec = spec.key();
    req.credential_mint = mint.key();
    req.owner = ctx.accounts.authority.key();
    req.issuer = issuer.key();
    req.uri = data.uri;
    req.status = CredentialRequestStatus::Pending;
    req.created_at = timestamp;
    req.message = Default::default();
    req.bump = ctx.bumps.credential_request;

    emit!(CreateCredentialRequestEvent {
        credential_spec: req.credential_spec,
        credential_mint: req.credential_mint,
        owner: req.owner,
        issuer: req.issuer,
        uri: req.uri.to_owned(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RequestCredentialData {
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

    pub credential_mint: Account<'info, Mint>,

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

    pub system_program: Program<'info, System>,
}
