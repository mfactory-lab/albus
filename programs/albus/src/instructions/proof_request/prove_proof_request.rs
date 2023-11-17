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

use crate::constants::{ISSUER_PK_SIGNAL, TIMESTAMP_SIGNAL, TIMESTAMP_THRESHOLD};
use crate::state::{Circuit, Issuer, Policy, ProofData};
use crate::utils::bytes_to_num;
use crate::{
    errors::AlbusError,
    events::ProveEvent,
    state::{ProofRequest, ProofRequestStatus},
    utils::cmp_pubkeys,
};

/// Proves the [ProofRequest] by validating the proof metadata and updating its status to `Proved`.
/// Returns an error the proof metadata is invalid.
pub fn handler(ctx: Context<ProveProofRequest>, data: ProveProofRequestData) -> Result<()> {
    let req = &mut ctx.accounts.proof_request;

    if !cmp_pubkeys(&req.owner, &ctx.accounts.authority.key()) {
        msg!("Error: Only request owner can prove it!");
        return Err(AlbusError::Unauthorized.into());
    }

    if data.reset {
        req.status = ProofRequestStatus::Pending;
        req.proved_at = 0;
        req.proof = None;
        req.issuer = Default::default();
        req.public_inputs.clear();
    }

    if !data.public_inputs.is_empty() {
        req.public_inputs.extend(data.public_inputs);
    }

    if data.proof.is_some() {
        let timestamp = Clock::get()?.unix_timestamp;

        req.status = ProofRequestStatus::Proved;
        req.proved_at = timestamp;
        req.proof = data.proof;

        let circuit = &ctx.accounts.circuit;
        let signals = circuit.signals();

        // validate timestamp
        if let Some(s) = signals.get(TIMESTAMP_SIGNAL) {
            let input_ts = bytes_to_num(req.public_inputs[s.index]);
            if (input_ts as i64) < timestamp - TIMESTAMP_THRESHOLD as i64 {
                msg!("Error: Invalid timestamp input");
                return Err(AlbusError::InvalidData.into());
            }
        }

        // validate issuer
        if let Some(s) = signals.get(ISSUER_PK_SIGNAL) {
            match &ctx.accounts.issuer {
                None => {
                    msg!("Error: Issuer required");
                    return Err(AlbusError::InvalidData.into());
                }
                Some(iss) => {
                    if iss.is_disabled() {
                        msg!("Error: This issuer is inactive");
                        return Err(AlbusError::Unauthorized.into());
                    }
                    let zk_pubkey = iss.zk_pubkey();
                    req.public_inputs[s.index] = zk_pubkey.0;
                    req.public_inputs[s.index + 1] = zk_pubkey.1;
                    req.issuer = iss.key();
                }
            }
        }

        // validate policy rules
        let policy = &ctx.accounts.policy;
        policy.apply_rules(&mut req.public_inputs, &signals);

        emit!(ProveEvent {
            proof_request: req.key(),
            service_provider: req.service_provider,
            circuit: req.circuit,
            owner: req.owner,
            timestamp,
        });
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProveProofRequestData {
    pub proof: Option<ProofData>,
    pub public_inputs: Vec<[u8; 32]>,
    pub reset: bool,
}

#[derive(Accounts)]
#[instruction(data: ProveProofRequestData)]
pub struct ProveProofRequest<'info> {
    #[account(mut, has_one = circuit, has_one = policy)]
    pub proof_request: Box<Account<'info, ProofRequest>>,

    pub circuit: Box<Account<'info, Circuit>>,

    pub policy: Box<Account<'info, Policy>>,

    pub issuer: Option<Box<Account<'info, Issuer>>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
