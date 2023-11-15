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

use crate::utils::Signals;
use anchor_lang::prelude::*;

#[cfg(feature = "verify-on-chain")]
use groth16_solana::{Proof, VK};

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Debug)]
pub struct ProofData {
    pub a: [u8; 64],
    pub b: [u8; 128],
    pub c: [u8; 64],
}

#[cfg(feature = "verify-on-chain")]
impl From<ProofData> for Proof {
    fn from(value: ProofData) -> Self {
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
    pub fn space(public_inputs_len: usize) -> usize {
        Self::INIT_SPACE + ((public_inputs_len + 1) * 64)
    }
}

#[cfg(feature = "verify-on-chain")]
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
pub struct Issuer {
    /// Signer Public key
    pub pubkey: Pubkey,
    /// Public key (babyjub curve)
    pub zk_pubkey: [u8; 64],
    /// Authority account of the issuer
    pub authority: Pubkey,
    /// Issuer status
    pub is_disabled: bool,
    /// Creation date
    pub created_at: i64,
    /// PDA bump.
    pub bump: u8,
    /// Uniq code of the issuer
    #[max_len(32)]
    pub code: String,
    /// The name of the issuer
    #[max_len(32)]
    pub name: String,
    /// Short description
    #[max_len(64)]
    pub description: String,
}

impl Issuer {
    pub const SEED: &'static [u8] = b"issuer";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }

    #[inline]
    pub fn is_disabled(&self) -> bool {
        self.is_disabled
    }

    pub fn zk_pubkey(&self) -> ([u8; 32], [u8; 32]) {
        (
            self.zk_pubkey[..32].try_into().unwrap(),
            self.zk_pubkey[32..].try_into().unwrap(),
        )
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
    /// Output signals associated with the circuit
    #[max_len(0, 0)]
    pub outputs: Vec<String>,
    /// Public signals associated with the circuit
    #[max_len(0, 0)]
    pub public_signals: Vec<String>,
    /// Private signals associated with the circuit
    #[max_len(0, 0)]
    pub private_signals: Vec<String>,
}

impl Circuit {
    pub const SEED: &'static [u8] = b"circuit";
    pub const MAX_SIGNAL_NAME_LEN: usize = 32;

    #[inline]
    pub fn space(public_len: usize, private_len: usize) -> usize {
        8 + Self::INIT_SPACE
            + VerificationKey::space(public_len)
            + (public_len + private_len) * Self::MAX_SIGNAL_NAME_LEN
    }

    #[inline]
    pub fn signals_count<T: AsRef<str>>(signals: impl IntoIterator<Item = T>) -> usize {
        Signals::new(signals).len()
    }

    #[inline]
    pub fn signals(&self) -> Signals {
        let mut vec = Vec::with_capacity(self.outputs.len() + self.public_signals.len());
        vec.extend_from_slice(self.outputs.as_slice());
        vec.extend_from_slice(self.public_signals.as_slice());
        Signals::new(vec)
    }
}

#[account]
#[derive(InitSpace)]
pub struct Policy {
    /// The service provider this belongs to
    pub service_provider: Pubkey,
    /// The circuit associated with this policy
    pub circuit: Pubkey,
    /// Unique code of the policy (associated with the service)
    #[max_len(16)]
    pub code: String,
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
    /// PDA bump
    pub bump: u8,
    /// Policy rules
    #[max_len(0)]
    pub rules: Vec<PolicyRule>,
}

impl Policy {
    pub const SEED: &'static [u8] = b"policy";

    #[inline]
    pub fn space(rules_len: usize) -> usize {
        8 + Self::INIT_SPACE + (rules_len * PolicyRule::INIT_SPACE)
    }

    #[inline]
    pub fn apply_rules(&self, public_inputs: &mut [[u8; 32]], signals: &Signals) {
        for rule in &self.rules {
            let (name, idx) = rule.parse();
            if let Some(signal) = signals.get(name) {
                let index = signal.index + idx.unwrap_or_default() as usize;
                if let Some(i) = public_inputs.get_mut(index) {
                    *i = rule.value;
                }
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub struct PolicyRule {
    #[max_len(32)]
    pub key: String,
    /// Scalar Field
    pub value: [u8; 32],
    #[max_len(32)]
    pub label: String,
}

impl PolicyRule {
    pub const DELIMITER: char = '.';

    /// Parses the name of a policy rule and returns a tuple with the name and length
    pub fn parse(&self) -> (&str, Option<u8>) {
        let mut split = self.key.splitn(2, Self::DELIMITER);
        let name = split.next().unwrap_or_default();
        let len = split.next().and_then(|len| len.parse().ok());
        (name, len)
    }
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
    /// The website link
    #[max_len(200)]
    pub website: String,
    /// Contact information
    pub contact_info: ContactInfo,
    /// Total number of proof requests
    pub proof_request_count: u64,
    /// Total number of policies
    pub policy_count: u64,
    /// Timestamp for when the service was registered
    pub created_at: i64,
    /// PDA bump
    pub bump: u8,
    /// Required number of trustee shares used to reconstruct the proof request secret
    pub secret_share_threshold: u8,
    /// List of selected trustees
    #[max_len(3)]
    pub trustees: Vec<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, InitSpace)]
pub struct ContactInfo {
    pub kind: u8,
    #[max_len(128)]
    pub value: String,
}

impl ServiceProvider {
    pub const SEED: &'static [u8] = b"service-provider";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }
}

#[account]
#[derive(InitSpace)]
pub struct Trustee {
    /// Key that is used for secret sharing encryption.
    /// BabyJub packed pubkey
    pub key: [u8; 32],
    /// The authority that manages the trustee
    pub authority: Pubkey,
    /// Name of the trustee
    #[max_len(32)]
    pub name: String,
    /// Email of the trustee
    #[max_len(128)]
    pub email: String,
    /// Website of the trustee
    #[max_len(200)]
    pub website: String,
    /// Indicates whether the [Trustee] has been verified
    pub is_verified: bool,
    /// The number of revealed secret shares
    pub revealed_share_count: u32,
    /// Timestamp for when the trustee was registered
    pub created_at: i64,
    /// PDA bump
    pub bump: u8,
}

impl Trustee {
    pub const SEED: &'static [u8] = b"trustee";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }
}

// #[account]
// #[derive(InitSpace)]
// pub struct InvestigationService {}

#[account]
#[derive(InitSpace)]
pub struct InvestigationRequest {
    /// Investigation service authority public key
    pub authority: Pubkey,
    /// The key that is used for secret sharing encryption.
    pub encryption_key: Pubkey,
    /// The [ProofRequest] associated with this request
    pub proof_request: Pubkey,
    /// The public key of the user who owns the [ProofRequest]
    pub proof_request_owner: Pubkey,
    /// The [ServiceProvider] associated with [ProofRequest]
    pub service_provider: Pubkey,
    /// Required number of shares used to reconstruct the secret
    pub required_share_count: u8,
    /// Revealed number of shares used to reconstruct the secret
    pub revealed_share_count: u8,
    /// Investigation processing status
    pub status: InvestigationStatus,
    /// Creation date
    pub created_at: i64,
    /// PDA bump
    pub bump: u8,
}

impl InvestigationRequest {
    pub const SEED: &'static [u8] = b"investigation-request";

    #[inline]
    pub fn space() -> usize {
        8 + Self::INIT_SPACE
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum InvestigationStatus {
    Pending = 0,
    InProgress = 1,
    UnderReview = 2,
    // OnHold = 3,
    // Escalated = 4,
    // Abandoned = 5,
    Resolved = u8::MAX,
}

#[account]
#[derive(InitSpace)]
pub struct InvestigationRequestShare {
    /// The address of the [InvestigationRequest]
    pub investigation_request: Pubkey,
    /// The public key of the user who owns the [ProofRequest]
    pub proof_request_owner: Pubkey,
    /// The address of the [Trustee]
    pub trustee: Pubkey,
    /// Share position
    pub index: u8,
    /// Creation date
    pub created_at: i64,
    /// Revelation date
    pub revealed_at: i64,
    /// Revelation status
    pub status: RevelationStatus,
    /// PDA bump
    pub bump: u8,
    /// Encrypted share
    #[max_len(128)]
    pub share: Vec<u8>,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Default, Eq, PartialEq, Clone, InitSpace)]
pub enum RevelationStatus {
    #[default]
    Pending,
    RevealedByUser,
    RevealedByTrustee,
}

impl InvestigationRequestShare {
    pub const SEED: &'static [u8] = b"investigation-request-share";

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
    /// The [Issuer] used for proof generation
    pub issuer: Pubkey,
    /// Proof request creator
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
    /// Timestamp indicating when the data will no longer be stored
    pub retention_end_date: i64,
    /// Status of the request
    pub status: ProofRequestStatus,
    /// PDA bump
    pub bump: u8,
    /// Proof payload
    pub proof: Option<ProofData>,
    /// Public inputs that are used to verify the `proof`
    #[max_len(0)]
    pub public_inputs: Vec<[u8; 32]>,
}

impl ProofRequest {
    pub const SEED: &'static [u8] = b"proof-request";

    #[inline]
    pub fn space(max_public_inputs: u8) -> usize {
        8 + Self::INIT_SPACE + (max_public_inputs as usize * 32)
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

// #[account]
// #[derive(InitSpace)]
// pub struct ProofRequestHistory {
//     pub proof_request: Pubkey,
//     pub owner: Pubkey,
//     // pub proof: Option<ProofData>,
//     #[max_len(0)]
//     pub public_inputs: Vec<[u8; 32]>,
//     pub proved_at: i64,
//     pub created_at: i64,
// }

#[cfg(test)]
mod test {
    use super::*;
    use crate::utils::num_to_bytes;

    #[test]
    fn test_apply_rules() {
        let policy = Policy {
            service_provider: Default::default(),
            circuit: Default::default(),
            code: "".to_string(),
            name: "".to_string(),
            description: "".to_string(),
            expiration_period: 0,
            retention_period: 0,
            proof_request_count: 0,
            created_at: 0,
            bump: 0,
            rules: vec![
                PolicyRule {
                    key: "minAge".to_string(),
                    value: num_to_bytes(18),
                    label: "".to_string(),
                },
                PolicyRule {
                    key: "maxAge".to_string(),
                    value: num_to_bytes(100),
                    label: "".to_string(),
                },
                PolicyRule {
                    key: "issuerPk.0".to_string(),
                    value: num_to_bytes(1),
                    label: "".to_string(),
                },
                PolicyRule {
                    key: "issuerPk.1".to_string(),
                    value: num_to_bytes(2),
                    label: "".to_string(),
                },
            ],
        };

        let signals = Signals::new(["minAge", "maxAge", "issuerPk[2]"].to_vec());
        let mut public_inputs = vec![[0; 32], [1; 32], [2; 32], [3; 32]];

        policy.apply_rules(&mut public_inputs, &signals);

        for (i, rule) in policy.rules.iter().enumerate() {
            assert_eq!(public_inputs[i], rule.value);
        }
    }
}
