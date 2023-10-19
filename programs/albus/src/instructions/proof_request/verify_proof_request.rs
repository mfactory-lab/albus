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

#[cfg(feature = "verify-on-chain")]
use groth16_solana::{Groth16Verifier, Proof, VK};

use crate::state::Circuit;
use crate::{state::ProofRequest, AlbusError};

#[cfg(feature = "verify-on-chain")]
use crate::{events::VerifyEvent, state::ProofRequestStatus};

pub fn handler(ctx: Context<VerifyProofRequest>) -> Result<()> {
    #[cfg(feature = "verify-on-chain")]
    {
        let req = &mut ctx.accounts.proof_request;

        let proof = req.proof.as_ref().ok_or(AlbusError::InvalidPublicInputs)?;
        let proof = Proof::new(proof.a, proof.b, proof.c);

        let circuit = &ctx.accounts.circuit;
        let vk = VK {
            alpha: circuit.vk.alpha,
            beta: circuit.vk.beta,
            gamma: circuit.vk.gamma,
            delta: circuit.vk.delta,
            ic: circuit.vk.ic.to_vec(),
        };

        Groth16Verifier::new(&proof, &req.public_inputs, &vk)
            .map_err(|_| AlbusError::InvalidPublicInputs)?
            .verify()
            .map_err(|_| AlbusError::ProofVerificationFailed)?;

        let timestamp = Clock::get()?.unix_timestamp;

        req.status = ProofRequestStatus::Verified;
        req.verified_at = timestamp;

        emit!(VerifyEvent {
            proof_request: req.key(),
            service_provider: req.service_provider,
            circuit: circuit.key(),
            owner: req.owner,
            timestamp,
        });

        Ok(())
    }

    #[cfg(not(feature = "verify-on-chain"))]
    {
        msg!("On-chain verification is disabled, available from solana v1.17.0");
        Err(AlbusError::Unverified.into())
    }
}

#[derive(Accounts)]
pub struct VerifyProofRequest<'info> {
    #[account(mut, has_one = circuit)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub circuit: Box<Account<'info, Circuit>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
