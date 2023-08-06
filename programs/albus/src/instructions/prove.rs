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
use groth16_solana::Groth16Verifier;

use crate::constants::CURRENT_DATE_SIGNAL;
use crate::state::{Circuit, Policy, ProofData};
use crate::utils::format_circuit_date;
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

    let timestamp = Clock::get()?.unix_timestamp;

    if !cmp_pubkeys(&req.owner, &ctx.accounts.authority.key()) {
        msg!("Error: Only request owner can prove it!");
        return Err(AlbusError::Unauthorized.into());
    }

    let mut public_inputs = data.public_inputs;

    let signals = circuit.signals();

    // apply current date
    if let Some(s) = signals.get(CURRENT_DATE_SIGNAL) {
        public_inputs[s.0] =
            format_circuit_date(timestamp).expect("Failed to get current timestamp");
    }

    // // apply issuer public key
    // if let Some(s) = signals.get(ISSUER_PK_SIGNAL) {
    //     public_inputs[s.0] = <[u8; 32]>::try_from(&ISSUER_PK[..32]).unwrap();
    //     public_inputs[s.0 + 1] = <[u8; 32]>::try_from(&ISSUER_PK[32..]).unwrap();
    // }

    policy.apply_rules(&mut public_inputs);

    if cfg!(feature = "verify-on-chain") {
        #[cfg(feature = "verify-on-chain")]
        Groth16Verifier::new(
            &data.proof.to_owned().into(),
            &public_inputs,
            &circuit.vk.to_owned().into(),
        )
        .map_err(|_| AlbusError::InvalidPublicInputs)?
        .verify()
        .map_err(|_| AlbusError::ProofVerificationFailed)?;

        req.status = ProofRequestStatus::Verified;
        req.verified_at = timestamp;
    } else {
        req.status = ProofRequestStatus::Proved;
    }

    req.proof = Some(data.proof);
    req.public_inputs = public_inputs;
    req.vp_uri = data.uri.to_owned();
    req.proved_at = timestamp;

    // TODO: reset expired_at if needed

    emit!(ProveEvent {
        proof_request: req.key(),
        service_provider: req.service_provider,
        circuit: circuit.key(),
        vp_url: data.uri,
        owner: req.owner,
        timestamp,
    });

    msg!("Proved!");

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProveData {
    pub uri: String,
    pub proof: ProofData,
    pub public_inputs: Vec<[u8; 32]>,
}

#[derive(Accounts)]
#[instruction(data: ProveData)]
pub struct Prove<'info> {
    #[account(mut, has_one = policy, has_one = circuit)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub circuit: Account<'info, Circuit>,
    pub policy: Account<'info, Policy>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
