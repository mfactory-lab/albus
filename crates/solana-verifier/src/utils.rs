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

#![allow(dead_code)]

use arrayref::array_ref;
use solana_program::{
    account_info::AccountInfo,
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
};

use crate::constants::{ALBUS_PROGRAM_ID, POLICY_DISCRIMINATOR, PROOF_REQUEST_DISCRIMINATOR};

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

fn is_valid_account(acc: &AccountInfo, discriminator: &[u8]) -> bool {
    let data = acc.data.borrow();
    let disc_bytes = array_ref![data, 0, 8];
    sol_memcmp(disc_bytes, discriminator, 8) == 0
}

pub fn is_valid_policy_account(acc: &AccountInfo) -> bool {
    is_valid_account(acc, POLICY_DISCRIMINATOR)
}

pub fn is_valid_proof_request_account(acc: &AccountInfo) -> bool {
    is_valid_account(acc, PROOF_REQUEST_DISCRIMINATOR)
}

#[test]
fn test_is_valid_account() {
    let key = Pubkey::default();
    let mut lamports = 0;
    let mut data = vec![];
    data.extend_from_slice(POLICY_DISCRIMINATOR);
    let acc = AccountInfo::new(&key, false, true, &mut lamports, &mut data, &key, false, 0);
    assert!(is_valid_account(&acc, POLICY_DISCRIMINATOR));
}
