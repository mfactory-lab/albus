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

    // TODO: validate authority

    let proof_request = &mut ctx.accounts.proof_request;
    let service = &mut ctx.accounts.service_provider;

    if proof_request.proof.is_none() {
        msg!("`ProofRequest` is not proved yet");
        return Err(AlbusError::Unproved.into());
    }

    let req = &mut ctx.accounts.investigation_request;
    req.authority = ctx.accounts.authority.key();
    req.encryption_key = data.encryption_key;
    req.proof_request = proof_request.key();
    req.proof_request_owner = proof_request.owner;
    req.service_provider = proof_request.service_provider;
    req.required_share_count = service.secret_share_threshold;
    req.status = InvestigationStatus::Pending;
    req.created_at = timestamp;
    req.bump = ctx.bumps.investigation_request;

    // Try to initialize share accounts
    if !ctx.remaining_accounts.is_empty() {
        // let slots_ref = ctx.accounts.slot_hashes.try_borrow_data()?;
        // let slots = &**slots_ref;
        // let mut offset: usize = 1;
        // let rand = u8::random_within_range(slots, &mut offset, 1, 3);

        if data.trustees.len() != ctx.remaining_accounts.len() {
            msg!("Invalid length of trustees");
            return Err(AlbusError::InvalidData.into());
        }

        for (idx, acc) in &mut ctx.remaining_accounts.iter().enumerate() {
            // share account is not already created
            if acc.data_is_empty() {
                let trustee = data.trustees[idx];

                let investigation_request = req.key();

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
        space = InvestigationRequest::space()
    )]
    pub investigation_request: Box<Account<'info, InvestigationRequest>>,

    #[account(has_one = service_provider)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    // /// CHECK:
    // #[account(address = anchor_lang::solana_program::sysvar::slot_hashes::id())]
    // pub slot_hashes: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
