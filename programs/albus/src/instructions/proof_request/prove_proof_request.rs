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

use crate::constants::{TIMESTAMP_SIGNAL, TIMESTAMP_THRESHOLD};
use crate::state::{Circuit, Policy, ProofData};
use crate::utils::bytes_to_num;
use crate::{
    events::ProveEvent,
    state::{ProofRequest, ProofRequestStatus},
    utils::cmp_pubkeys,
    AlbusError,
};

/// Proves the [ProofRequest] by validating the proof metadata and updating its status to `Proved`.
/// Returns an error if the request has expired or if the proof metadata is invalid.
pub fn handler(ctx: Context<Prove>, data: ProveData) -> Result<()> {
    let circuit = &ctx.accounts.circuit;
    let policy = &ctx.accounts.policy;
    let req = &mut ctx.accounts.proof_request;

    if !cmp_pubkeys(&req.owner, &ctx.accounts.authority.key()) {
        msg!("Error: Only request owner can prove it!");
        return Err(AlbusError::Unauthorized.into());
    }

    if data.reset {
        req.proof = None;
        req.public_inputs.clear();
    }

    if !data.public_inputs.is_empty() {
        req.public_inputs.extend(data.public_inputs);
    }

    if data.proof.is_none() {
        msg!("Public inputs was updated");
        return Ok(());
    }

    let timestamp = Clock::get()?.unix_timestamp;
    let signals = circuit.signals();

    // validate timestamp
    if let Some(s) = signals.get(TIMESTAMP_SIGNAL) {
        let input_ts = bytes_to_num(req.public_inputs[s.index]);
        if (input_ts as i64) < timestamp - TIMESTAMP_THRESHOLD as i64 {
            msg!("Error: Invalid timestamp input");
            return Err(AlbusError::InvalidData.into());
        }
    }

    // // validate issuer
    // if let Some(s) = signals.get(ISSUER_PK_SIGNAL) {
    //     public_inputs[s.0] = <[u8; 32]>::try_from(&ISSUER_PK[..32]).unwrap();
    //     public_inputs[s.0 + 1] = <[u8; 32]>::try_from(&ISSUER_PK[32..]).unwrap();
    // }

    policy.apply_rules(&mut req.public_inputs, &signals);

    req.status = ProofRequestStatus::Proved;
    req.proved_at = timestamp;
    req.proof = data.proof;

    #[cfg(feature = "verify-on-chain")]
    if data.verify {
        let proof = req.proof.as_ref().expect("Invalid proof");
        let proof = Proof::new(proof.a, proof.b, proof.c);

        let vk = VK {
            alpha: circuit.vk.alpha,
            beta: circuit.vk.beta,
            gamma: circuit.vk.gamma,
            delta: circuit.vk.delta,
            ic: circuit.vk.ic.to_owned(),
        };

        Groth16Verifier::new(&proof, &req.public_inputs, &vk)
            .map_err(|_| AlbusError::InvalidPublicInputs)?
            .verify()
            .map_err(|_| AlbusError::ProofVerificationFailed)?;

        req.status = ProofRequestStatus::Verified;
        req.verified_at = timestamp;
    }

    emit!(ProveEvent {
        proof_request: req.key(),
        service_provider: req.service_provider,
        circuit: circuit.key(),
        owner: req.owner,
        timestamp,
    });

    msg!("Proved!");

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProveData {
    pub proof: Option<ProofData>,
    pub public_inputs: Vec<[u8; 32]>,
    pub reset: bool,
    pub verify: bool,
}

#[derive(Accounts)]
#[instruction(data: ProveData)]
pub struct Prove<'info> {
    #[account(mut, has_one = policy, has_one = circuit)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub circuit: Box<Account<'info, Circuit>>,

    pub policy: Account<'info, Policy>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
