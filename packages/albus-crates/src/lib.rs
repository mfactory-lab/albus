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

pub const ALBUS_PROGRAM_ID: &str = "ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz";
pub const ZKP_REQUEST_DISCRIMINATOR: &[u8] = &[196, 177, 30, 25, 231, 233, 97, 178];

/// Returns the address of the Albus program.
pub fn program_id() -> Pubkey {
    Pubkey::from_str(ALBUS_PROGRAM_ID).unwrap()
}

#[repr(u8)]
pub enum ZKPRequestStatus {
    Pending,
    Proved,
    Verified,
    Rejected,
}

impl TryFrom<u8> for ZKPRequestStatus {
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
    zkp_request: &AccountInfo,
    zkp_request_owner: Option<Pubkey>,
) -> Result<(), ProgramError> {
    let data = &zkp_request
        .data
        .take()
        .try_into()
        .map_err(|_| ProgramError::InvalidAccountData)?;

    let albus_program_id =
        Pubkey::from_str(ALBUS_PROGRAM_ID).map_err(|_| ProgramError::IncorrectProgramId)?;

    // Assert the account is owned by albus program
    if sol_memcmp(
        zkp_request.owner.as_ref(),
        albus_program_id.as_ref(),
        PUBKEY_BYTES,
    ) != 0
    {
        return Err(ProgramError::IllegalOwner);
    }

    let (discriminator, _, _, owner, _, _, expired_at, _, _, [status], _) =
        array_refs![data, 8, 32, 32, 32, 33, 8, 8, 8, 8, 1, 1];

    if discriminator != ZKP_REQUEST_DISCRIMINATOR {
        msg!("Error: Invalid account discriminator!");
        return Err(ProgramError::InvalidAccountData);
    }

    // Checks if the provided `zkp_request_owner` is equal to zkp request's `owner`.
    if let Some(key) = zkp_request_owner {
        if sol_memcmp(key.as_ref(), owner, PUBKEY_BYTES) != 0 {
            msg!("Error: Invalid request owner!");
            return Err(ProgramError::InvalidAccountData);
        }
    }

    let expired_at = i64::from_le_bytes(*expired_at);
    let status = ZKPRequestStatus::try_from(*status)?;
    let timestamp = Clock::get()?.unix_timestamp;

    if expired_at > 0 && expired_at < timestamp {
        msg!("Expired!");
        return Err(ProgramError::Custom(1));
    }

    match status {
        ZKPRequestStatus::Verified => {
            msg!("Verified!");
            Ok(())
        }
        ZKPRequestStatus::Proved => {
            msg!("Error: ZKP request is proved");
            Err(ProgramError::Custom(2))
        }
        ZKPRequestStatus::Pending => {
            msg!("Error: ZKP request is pending");
            Err(ProgramError::Custom(3))
        }
        ZKPRequestStatus::Rejected => {
            msg!("Error: ZKP request is rejected");
            Err(ProgramError::Custom(4))
        }
    }
}

/// Generates the service provider program address for the Albus protocol
pub fn find_service_provider_address(program_id: &Pubkey, code: &str) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"service-provider", code.as_bytes()], program_id)
}

/// Generates the zkp request program address for the Albus protocol
pub fn find_zkp_request_address(
    program_id: &Pubkey,
    service_provider: &Pubkey,
    circuit: &Pubkey,
    user: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            b"zkp-request",
            &service_provider.to_bytes(),
            &circuit.to_bytes(),
            &user.to_bytes(),
        ],
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
        let mut data = get_zkp_request(ZKPRequestStatus::Verified, 0, user);

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
        let mut data = get_zkp_request(ZKPRequestStatus::Proved, 1, Pubkey::new_unique());

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

        assert_eq!(check_compliant(&acc, None), Err(ProgramError::Custom(1)));
    }

    #[test]
    fn test_ownership() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let program_id = program_id();
        let addr = Pubkey::new_unique();
        let owner = Pubkey::new_unique();
        let lamports = &mut 0;
        let mut data = get_zkp_request(ZKPRequestStatus::Verified, 0, owner);

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

    fn get_zkp_request(status: ZKPRequestStatus, expired_at: i64, owner: Pubkey) -> Vec<u8> {
        [
            ZKP_REQUEST_DISCRIMINATOR,
            &Pubkey::new_unique().to_bytes(),
            &Pubkey::new_unique().to_bytes(),
            &owner.to_bytes(),
            &[1],
            &Pubkey::new_unique().to_bytes(),
            &0i64.to_le_bytes(),
            &expired_at.to_le_bytes(),
            &0i64.to_le_bytes(),
            &0i64.to_le_bytes(),
            &(status as u8).to_le_bytes(),
            &0u8.to_le_bytes(),
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
