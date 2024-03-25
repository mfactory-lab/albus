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

use crate::state::RevelationStatus;
use crate::*;

#[event]
pub struct CreateProofRequestEvent {
    #[index]
    pub service_provider: Pubkey,
    pub policy: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteProofRequestEvent {
    #[index]
    pub proof_request: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProveEvent {
    #[index]
    pub proof_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VerifyEvent {
    #[index]
    pub proof_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RejectEvent {
    #[index]
    pub proof_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RevealSecretShareEvent {
    pub investigation_request: Pubkey,
    pub proof_request: Pubkey,
    pub proof_request_owner: Pubkey,
    pub authority: Pubkey,
    pub trustee: Pubkey,
    pub status: RevelationStatus,
    pub index: u8,
    pub timestamp: i64,
}

#[event]
pub struct CreateInvestigationRequestEvent {
    pub investigation_request: Pubkey,
    pub proof_request: Pubkey,
    pub proof_request_owner: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteInvestigationRequestEvent {
    pub investigation_request: Pubkey,
    pub proof_request: Pubkey,
    pub proof_request_owner: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct CreateCredentialRequestEvent {
    pub credential_spec: Pubkey,
    pub credential_mint: Pubkey,
    pub owner: Pubkey,
    pub issuer: Pubkey,
    pub uri: String,
    pub timestamp: i64,
}
