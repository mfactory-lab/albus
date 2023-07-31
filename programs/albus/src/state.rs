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

use crate::utils::{num_to_bytes, Signals};
use anchor_lang::prelude::*;
use groth16_solana::{Proof, PublicInputs, VK};
use std::borrow::Cow;

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Debug)]
pub struct ProofData {
    pub a: [u8; 64],
    pub b: [u8; 128],
    pub c: [u8; 64],
}

impl From<ProofData> for Proof {
    fn from(value: ProofData) -> Self {
        // let proof_a = &alt_bn128_g1_neg(value.a.as_slice()).unwrap()[..];
        // Self::new(proof_a.try_into().unwrap(), value.b, value.c)
        Self::new(value.a, value.b, value.c)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Debug)]
pub struct VerificationKey {
    // #[max_len(16)]
    // pub protocol: String,
    // #[max_len(32)]
    // pub curve: String,
    pub alpha: [u8; 64],
    pub beta: [u8; 128],
    pub gamma: [u8; 128],
    pub delta: [u8; 128],
    #[max_len(0)]
    pub ic: Vec<[u8; 64]>,
}

impl VerificationKey {
    pub fn space(inputs_len: usize) -> usize {
        Self::INIT_SPACE + ((inputs_len + 1) * 64)
    }
}

impl From<VerificationKey> for VK {
    fn from(value: VerificationKey) -> Self {
        Self {
            alpha: value.alpha,
            beta: value.beta,
            gamma: value.gamma,
            delta: value.delta,
            ic: value.ic,
        }
    }
}

#[account]
#[derive(InitSpace)]
pub struct Circuit {
    /// Uniq code of the circuit
    #[max_len(16)]
    pub code: String,
    /// Name of the circuit
    #[max_len(32)]
    pub name: String,
    /// Short description
    #[max_len(64)]
    pub description: String,
    #[max_len(128)]
    pub wasm_uri: String,
    #[max_len(128)]
    pub zkey_uri: String,
    /// Creation date
    pub created_at: i64,
    /// PDA bump.
    pub bump: u8,
    /// Verification key
    pub vk: VerificationKey,
    #[max_len(0, 0)]
    pub private_signals: Vec<String>,
    #[max_len(0, 0)]
    pub public_signals: Vec<String>,
}

impl Circuit {
    pub const SEED: &'_ [u8] = b"circuit";
    pub const MAX_SIGNAL_NAME_LEN: usize = 32;

    #[inline]
    pub fn space(signals_len: usize) -> usize {
        8 + Self::INIT_SPACE
            + VerificationKey::space(signals_len)
            + signals_len * Self::MAX_SIGNAL_NAME_LEN
    }

    #[inline]
    pub fn signals_count<'a, T>(signals: impl IntoIterator<Item = T>) -> usize
    where
        T: Into<Cow<'a, str>>,
    {
        Signals::new(signals).len()
    }

    #[inline]
    pub fn signals(&self) -> Signals {
        Signals::new(&self.public_signals)
    }
}

#[account]
#[derive(InitSpace)]
pub struct Policy {
    /// The service provider this belongs to.
    pub service_provider: Pubkey,
    /// The circuit associated with this policy
    pub circuit: Pubkey,
    /// Name of the policy
    #[max_len(32)]
    pub name: String,
    /// Short description
    #[max_len(64)]
    pub description: String,
    /// Request expiration period in seconds
    pub expiration_period: u32,
    /// Request retention period in seconds
    pub retention_period: u32,
    /// Total number of proof requests
    pub proof_request_count: u64,
    /// Creation date
    pub created_at: i64,
    /// PDA bump.
    pub bump: u8,
    /// Policy rules
    #[max_len(0)]
    pub rules: Vec<PolicyRule>,
}

impl Policy {
    pub const SEED: &'_ [u8] = b"policy";

    #[inline]
    pub fn space(rules_len: usize) -> usize {
        8 + Self::INIT_SPACE + (rules_len * PolicyRule::INIT_SPACE)
    }

    #[inline]
    pub fn apply_rules(&self, public_inputs: &mut PublicInputs) {
        for rule in &self.rules {
            if let Some(i) = public_inputs.get_mut(rule.index as usize) {
                *i = num_to_bytes(rule.value);
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub struct PolicyRule {
    pub index: u8,
    pub group: u8,
    pub value: u32,
}

#[account]
#[derive(InitSpace)]
pub struct ServiceProvider {
    /// Authority that manages the service
    pub authority: Pubkey,
    /// Unique code identifying the service
    #[max_len(16)]
    pub code: String,
    /// Name of the service
    #[max_len(32)]
    pub name: String,
    /// Total number of proof requests
    pub proof_request_count: u64,
    /// Total number of policies
    pub policy_count: u64,
    /// Timestamp for when the service was added
    pub created_at: i64,
    /// PDA bump.
    pub bump: u8,
}

impl ServiceProvider {
    pub const SEED: &'_ [u8] = b"service-provider";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }
}

#[account]
#[derive(InitSpace)]
pub struct ProofRequest {
    /// The [ServiceProvider] associated with this request
    pub service_provider: Pubkey,
    /// The [Policy] associated with this request
    pub policy: Pubkey,
    /// The [Circuit] used for proof generation
    pub circuit: Pubkey,
    /// Address of the request initiator
    pub owner: Pubkey,
    /// Auto-increment service specific identifier
    pub identifier: u64,
    /// Timestamp for when the request was created
    pub created_at: i64,
    /// Timestamp for when the request will expire
    pub expired_at: i64,
    /// Timestamp for when the proof was verified
    pub verified_at: i64,
    /// Timestamp for when the user was added the `proof`
    pub proved_at: i64,
    /// PDA bump.
    pub bump: u8,
    /// Status of the request
    pub status: ProofRequestStatus,
    /// The address of the presentation used for proof generation
    #[max_len(200)]
    pub vp_uri: String,
    // /// Proof payload
    // pub proof: Option<ProofData>,
}

impl ProofRequest {
    pub const SEED: &'_ [u8] = b"proof-request";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Default, Eq, PartialEq, Clone, InitSpace)]
pub enum ProofRequestStatus {
    #[default]
    Pending,
    Proved,
    Verified,
    Rejected,
}
