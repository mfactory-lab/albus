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

use anchor_lang::{prelude::*, AnchorDeserialize};

const MAX_SERVICE_CODE_LEN: usize = 16;
const MAX_SERVICE_NAME_LEN: usize = 32;

#[account]
pub struct ServiceProvider {
    /// Authority that manages the service
    pub authority: Pubkey,
    /// Unique code identifying the service
    pub code: String,
    /// Name of the service
    pub name: String,
    /// Total number of proof requests
    pub proof_request_count: u64,
    /// Timestamp for when the service was created
    pub created_at: i64,
    // /// TODO:
    // pub status: u8,
    /// Bump seed used to derive program-derived account seeds
    pub bump: u8,
    // /// Predefined input for circuits
    // /// {"age": {"minAge": 18, "maxAge": 100"}}
    // pub rules: HashMap<Pubkey, HashMap<String, Vec<u8>>>,
}

impl ServiceProvider {
    pub const SEED: &'static [u8] = b"service-provider";

    pub fn space() -> usize {
        8 + 32 + (4 + MAX_SERVICE_CODE_LEN) + (4 + MAX_SERVICE_NAME_LEN) + 8 + 8 + 1
    }
}

#[account]
pub struct ProofRequest {
    /// Address of the [ServiceProvider] associated with this request
    pub service_provider: Pubkey,
    /// Address of the circuit associated with this request
    pub circuit: Pubkey,
    /// Address of the request initiator
    pub owner: Pubkey,
    /// Timestamp for when the request was created
    pub created_at: i64,
    /// Timestamp for when the request will expire
    pub expired_at: i64,
    /// Timestamp for when the proof was verified
    pub verified_at: i64,
    /// Timestamp for when the user was added to the proof
    pub proved_at: i64,
    /// Status of the request
    pub status: ProofRequestStatus,
    /// Bump seed used to derive program-derived account seeds
    pub bump: u8,
    /// Proof itself
    pub proof: Option<Proof>,
}

impl ProofRequest {
    pub const SEED: &'static [u8] = b"proof-request";

    pub fn space() -> usize {
        8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + (1 + 24)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Proof {
    pub protocol: String,
    pub curve: String,
    pub pi_a: Vec<String>,
    pub pi_b: Vec<Vec<String>>,
    pub pi_c: Vec<String>,
    // pub pi_a: [[u8; 32]; 3],
    // pub pi_b: [[[u8; 32]; 2]; 3],
    // pub pi_c: [[u8; 32]; 3],
    pub public_inputs: Vec<String>,
}

impl Proof {
    pub fn space(&self) -> usize {
        (4 + self.protocol.len())
            + (4 + self.curve.len())
            + pi_size(&self.pi_a)
            + (4 + self.pi_b.iter().map(|p| pi_size(p)).sum::<usize>())
            + pi_size(&self.pi_c)
            + pi_size(&self.public_inputs)
    }
}

fn pi_size(data: &[String]) -> usize {
    4 + (data.iter().fold(0, |mut s, p| {
        s += 4 + p.len();
        s
    }))
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Default, Eq, PartialEq, Clone)]
pub enum ProofRequestStatus {
    #[default]
    Pending,
    Proved,
    Verified,
    Rejected,
}

#[test]
fn test_proof_space() {
    let proof = Proof {
        protocol: "groth16".to_string(),
        curve: "bn128".to_string(),
        pi_a: vec![
            "4688465976390849813258766614874268793015562393908521426678896850698555295377"
                .to_string(),
            "5203302727358091972134489987774942965622107014647584381609747750500688800419"
                .to_string(),
            "1".to_string(),
        ],
        pi_b: vec![
            vec![
                "19100277836905026624939775520998807986886756133116001533707896920384169794537"
                    .to_string(),
                "20845943990358232545602432281011291671960605406348147106935789163866131884190"
                    .to_string(),
            ],
            vec![
                "9550979632776995462322201809577428314107186866427252237457450171793417063766"
                    .to_string(),
                "12473350078107351578656027664820450318597805912302701634643037322816555142082"
                    .to_string(),
            ],
            vec!["1".to_string(), "0".to_string()],
        ],
        pi_c: vec![
            "3368898346418249388382544753485388607144585282610758032560453819156280723300"
                .to_string(),
            "4321128949903528883011131762909256214873510011327154174450532321111046247789"
                .to_string(),
            "1".to_string(),
        ],
        public_inputs: vec![
            "2023".to_string(),
            "6".to_string(),
            "13".to_string(),
            "18".to_string(),
            "120".to_string(),
        ],
    };

    // println!("{:?}", proof.space());

    assert_eq!(proof.space(), 743);
}
