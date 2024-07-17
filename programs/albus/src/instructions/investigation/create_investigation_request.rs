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
use crate::events::CreateInvestigationRequestEvent;
use anchor_lang::prelude::*;
use anchor_lang::Discriminator;

use crate::state::{
    InvestigationRequest, InvestigationRequestShare, InvestigationStatus, ProofRequest,
    ServiceProvider,
};
use crate::utils::{cmp_pubkeys, initialize_account, BpfWriter};

pub fn handler<'info>(
    ctx: Context<'_, '_, 'info, 'info, CreateInvestigationRequest<'info>>,
    data: CreateInvestigationRequestData,
) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    // TODO: is authorized for investigation?
    // TODO: does `data.trustees` exist in `proof_request.public_inputs`

    let service = &mut ctx.accounts.service_provider;
    let proof_request = &mut ctx.accounts.proof_request;
    let investigation_request = &mut ctx.accounts.investigation_request;

    if !proof_request.is_proved() {
        msg!("The proof request is not proved yet");
        return Err(AlbusError::Unproved.into());
    }

    // Try to initialize share accounts
    if !ctx.remaining_accounts.is_empty() {
        if data.trustees.len() != ctx.remaining_accounts.len() {
            msg!(
                "Invalid length of provided trustees, expected {}",
                data.trustees.len()
            );
            return Err(AlbusError::InvalidData.into());
        }

        for (idx, acc) in &mut ctx.remaining_accounts.iter().enumerate() {
            // a share account is not yet created
            if acc.data_is_empty() {
                let trustee = data.trustees[idx];

                let investigation_request = investigation_request.key();

                let (addr, bump) = Pubkey::find_program_address(
                    &[
                        InvestigationRequestShare::SEED,
                        investigation_request.as_ref(),
                        trustee.as_ref(),
                    ],
                    &crate::ID,
                );

                if !cmp_pubkeys(acc.key, &addr) {
                    msg!("Invalid share account address `{}`", acc.key);
                    return Err(AlbusError::InvalidData.into());
                }

                {
                    initialize_account(
                        ctx.accounts.authority.to_account_info(),
                        acc.to_account_info(),
                        ctx.accounts.system_program.to_account_info(),
                        &crate::ID,
                        &[&[
                            InvestigationRequestShare::SEED,
                            investigation_request.as_ref(),
                            trustee.as_ref(),
                            &[bump],
                        ]],
                        InvestigationRequestShare::space(),
                    )?;
                    let dst: &mut [u8] = &mut acc.try_borrow_mut_data()?;
                    dst[..8].copy_from_slice(InvestigationRequestShare::discriminator().as_slice());
                }

                let mut share = Account::<InvestigationRequestShare>::try_from(acc)?;
                share.investigation_request = investigation_request;
                share.proof_request_owner = proof_request.owner;
                share.trustee = trustee;
                share.created_at = timestamp;
                share.index = (idx + 1) as u8;
                share.share = Default::default();
                share.bump = bump;

                let dst: &mut [u8] = &mut acc.try_borrow_mut_data()?;
                let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
                InvestigationRequestShare::try_serialize(&share, &mut writer)?;
            }
        }
    }

    investigation_request.authority = ctx.accounts.authority.key();
    investigation_request.encryption_key = data.encryption_key;
    investigation_request.proof_request = proof_request.key();
    investigation_request.proof_request_owner = proof_request.owner;
    investigation_request.service_provider = proof_request.service_provider;
    investigation_request.required_share_count = service.secret_share_threshold;
    investigation_request.status = InvestigationStatus::Pending;
    investigation_request.created_at = timestamp;
    investigation_request.bump = ctx.bumps.investigation_request;
    investigation_request.trustees = data.trustees;

    emit!(CreateInvestigationRequestEvent {
        investigation_request: investigation_request.key(),
        proof_request: proof_request.key(),
        proof_request_owner: proof_request.owner,
        authority: ctx.accounts.authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInvestigationRequestData {
    pub encryption_key: Pubkey,
    pub trustees: Vec<Pubkey>,
}

#[derive(Accounts)]
#[instruction(data: CreateInvestigationRequestData)]
pub struct CreateInvestigationRequest<'info> {
    #[account(
        init,
        seeds = [
            InvestigationRequest::SEED,
            proof_request.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = InvestigationRequest::space(data.trustees.len())
    )]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(mut, has_one = service_provider)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    // /// CHECK:
    // #[account(address = anchor_lang::solana_program::sysvar::slot_hashes::id())]
    // pub slot_hashes: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
