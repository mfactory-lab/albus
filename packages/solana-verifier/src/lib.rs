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

use std::str::FromStr;

use arrayref::array_ref;
use arrayref::array_refs;
use solana_program::{
    account_info::AccountInfo,
    clock::Clock,
    msg,
    program_error::ProgramError,
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
    sysvar::Sysvar,
};

pub const ALBUS_PROGRAM_ID: &str = "ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL";
pub const PROOF_REQUEST_DISCRIMINATOR: &[u8] = &[78, 10, 176, 254, 231, 33, 111, 224];

/// Returns the address of the Albus program.
#[inline]
pub fn program_id() -> Pubkey {
    Pubkey::from_str(ALBUS_PROGRAM_ID).unwrap()
}

#[repr(u8)]
#[derive(Default, Eq, PartialEq, Clone)]
pub enum ProofRequestStatus {
    #[default]
    Pending,
    Proved,
    Verified,
    Rejected,
}

#[repr(u8)]
pub enum VerificationError {
    NotVerified,
    Expired,
    Pending,
    Rejected,
}

impl TryFrom<u8> for ProofRequestStatus {
    type Error = ProgramError;

    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Self::Pending),
            1 => Ok(Self::Proved),
            2 => Ok(Self::Verified),
            3 => Ok(Self::Rejected),
            _ => Err(ProgramError::InvalidAccountData),
        }
    }
}

pub fn check_compliant(
    proof_request: &AccountInfo,
    proof_request_owner: Option<Pubkey>,
) -> Result<(), ProgramError> {
    if sol_memcmp(
        proof_request.owner.as_ref(),
        program_id().as_ref(),
        PUBKEY_BYTES,
    ) != 0
    {
        return Err(ProgramError::IllegalOwner);
    }

    if proof_request.data_is_empty() {
        msg!("Error: ProofRequest account is empty");
        return Err(ProgramError::UninitializedAccount);
    }

    let data = proof_request.data.borrow();
    let data = array_ref![data, 0, 186];

    let (
        discriminator,
        _service,
        _policy,
        _circuit,
        owner,
        _identifier,
        _created_at,
        expired_at,
        _verified_at,
        _proved_at,
        _retention_end_date,
        [status],
        _bump,
        // _proof,
        // _public_inputs,
    ) = array_refs![data, 8, 32, 32, 32, 32, 8, 8, 8, 8, 8, 8, 1, 1];

    if discriminator != PROOF_REQUEST_DISCRIMINATOR {
        msg!("Error: Invalid account discriminator");
        return Err(ProgramError::InvalidAccountData);
    }

    if let Some(key) = proof_request_owner {
        if sol_memcmp(key.as_ref(), owner, PUBKEY_BYTES) != 0 {
            msg!("Error: Invalid request owner");
            return Err(ProgramError::InvalidAccountData);
        }
    }

    let expired_at = i64::from_le_bytes(*expired_at);
    let status = ProofRequestStatus::try_from(*status)?;
    let timestamp = Clock::get()?.unix_timestamp;

    if expired_at > 0 && expired_at < timestamp {
        msg!("Expired!");
        return Err(ProgramError::Custom(VerificationError::Expired as u32));
    }

    match status {
        ProofRequestStatus::Pending => {
            msg!("Error: Proof request is pending");
            Err(ProgramError::Custom(VerificationError::Pending as u32))
        }
        ProofRequestStatus::Proved => {
            msg!("Error: Proof request is not verified");
            Err(ProgramError::Custom(VerificationError::NotVerified as u32))
        }
        ProofRequestStatus::Rejected => {
            msg!("Error: Proof request is rejected");
            Err(ProgramError::Custom(VerificationError::Rejected as u32))
        }
        ProofRequestStatus::Verified => {
            msg!("Verified!");
            Ok(())
        }
    }
}

/// Generates the service provider program address for Albus Protocol
pub fn find_service_provider_address(program_id: &Pubkey, code: &str) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"service-provider", code.as_bytes()], program_id)
}

/// Generates the proof request program address for the Albus protocol
pub fn find_proof_request_address(
    program_id: &Pubkey,
    policy: &Pubkey,
    user: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"proof-request", &policy.to_bytes(), &user.to_bytes()],
        program_id,
    )
}

#[cfg(test)]
mod test {
    use solana_program::{account_info::AccountInfo, clock::Clock, pubkey::Pubkey};

    use super::*;

    #[test]
    fn test_verified() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let program_id = program_id();
        let addr = Pubkey::new_unique();
        let user = Pubkey::new_unique();
        let lamp = &mut 0;
        let mut data = get_proof_request(ProofRequestStatus::Verified, 0, user);

        let acc = AccountInfo::new(
            &addr,
            false,
            false,
            lamp,
            data.as_mut_slice(),
            &program_id,
            false,
            0,
        );

        assert_eq!(check_compliant(&acc, Some(user)), Ok(()));
    }

    #[test]
    fn test_expired() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let program_id = program_id();
        let addr = Pubkey::new_unique();
        let lamports = &mut 0;
        let mut data = get_proof_request(ProofRequestStatus::Proved, 1, Pubkey::new_unique());

        let acc = AccountInfo::new(
            &addr,
            false,
            false,
            lamports,
            data.as_mut_slice(),
            &program_id,
            false,
            0,
        );

        assert_eq!(
            check_compliant(&acc, None),
            Err(ProgramError::Custom(VerificationError::Expired as u32))
        );
    }

    #[test]
    fn test_ownership() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let program_id = program_id();
        let addr = Pubkey::new_unique();
        let owner = Pubkey::new_unique();
        let lamports = &mut 0;
        let mut data = get_proof_request(ProofRequestStatus::Verified, 0, owner);

        let acc = AccountInfo::new(
            &addr,
            false,
            false,
            lamports,
            data.as_mut_slice(),
            &program_id,
            false,
            0,
        );

        // valid owner
        assert_eq!(check_compliant(&acc, Some(owner)), Ok(()));

        // invalid owner
        assert_eq!(
            check_compliant(&acc, Some(Pubkey::new_unique())),
            Err(ProgramError::InvalidAccountData)
        );
    }

    fn get_proof_request(status: ProofRequestStatus, expired_at: i64, owner: Pubkey) -> Vec<u8> {
        [
            PROOF_REQUEST_DISCRIMINATOR,
            &Pubkey::new_unique().to_bytes(),
            &Pubkey::new_unique().to_bytes(),
            &Pubkey::new_unique().to_bytes(),
            &owner.to_bytes(),
            &0i64.to_le_bytes(),
            &0i64.to_le_bytes(),
            &expired_at.to_le_bytes(),
            &0i64.to_le_bytes(),
            &0i64.to_le_bytes(),
            &0i64.to_le_bytes(),
            &(status as u8).to_le_bytes(),
            &0u8.to_le_bytes(),
            &[0u8; 256],
            &[0u8; 28],
        ]
        .into_iter()
        .flatten()
        .copied()
        .collect::<Vec<_>>()
    }

    struct SyscallStubs {}
    impl solana_program::program_stubs::SyscallStubs for SyscallStubs {
        fn sol_get_clock_sysvar(&self, var_addr: *mut u8) -> u64 {
            unsafe {
                *(var_addr as *mut _ as *mut Clock) = Clock {
                    slot: 1,
                    epoch_start_timestamp: 2,
                    epoch: 3,
                    leader_schedule_epoch: 4,
                    unix_timestamp: 5,
                };
            }
            solana_program::entrypoint::SUCCESS
        }
    }
}
