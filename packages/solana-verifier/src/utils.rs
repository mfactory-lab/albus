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

use crate::constants::ALBUS_PROGRAM_ID;
use solana_program::program_memory::sol_memcmp;
use solana_program::pubkey::{Pubkey, PUBKEY_BYTES};

/// Checks two pubkeys for equality in a computationally cheap way using `sol_memcmp`
pub fn cmp_pubkeys(a: impl AsRef<[u8]>, b: impl AsRef<[u8]>) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

/// Generates the service provider program address for Albus Protocol
pub fn find_service_provider_address(code: &str) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"service-provider", code.as_bytes()], &ALBUS_PROGRAM_ID)
}

/// Generates the policy program address for Albus Protocol
pub fn find_policy_address(service_provider: &Pubkey, code: &str) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"policy", service_provider.as_ref(), code.as_bytes()],
        &ALBUS_PROGRAM_ID,
    )
}

/// Generates the proof request program address for the Albus protocol
pub fn find_proof_request_address(policy: &Pubkey, user: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"proof-request", policy.as_ref(), user.as_ref()],
        &ALBUS_PROGRAM_ID,
    )
}
