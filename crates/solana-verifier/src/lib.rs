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

mod constants;
#[cfg(feature = "cpi")]
mod cpi;
mod utils;

use crate::constants::{ALBUS_DEV_PROGRAM_ID, ALBUS_PROGRAM_ID, PROOF_REQUEST_DISCRIMINATOR};
use crate::utils::cmp_pubkeys;
use arrayref::array_ref;
use arrayref::array_refs;
use solana_program::{
    account_info::AccountInfo, clock::Clock, msg, program_error::ProgramError, pubkey::Pubkey,
    sysvar::Sysvar,
};

pub struct AlbusVerifier<'a, 'info> {
    /// Proof request address
    proof_request: &'a AccountInfo<'info>,
    /// (optional) Proof request owner's address
    proof_request_owner: Option<Pubkey>,
    /// (optional) Policy address
    policy: Option<Pubkey>,
}

impl<'a, 'info> AlbusVerifier<'a, 'info> {
    pub fn new(proof_request: &'a AccountInfo<'info>) -> AlbusVerifier<'a, 'info> {
        Self {
            proof_request,
            policy: None,
            proof_request_owner: None,
        }
    }

    pub fn check_policy(mut self, addr: Pubkey) -> Self {
        self.policy = Some(addr);
        self
    }

    pub fn check_owner(mut self, addr: Pubkey) -> Self {
        self.proof_request_owner = Some(addr);
        self
    }

    #[cfg(feature = "cpi")]
    fn cpi_call(&self, _ctx: cpi::VerifyProofRequest) -> Result<(), ProgramError> {
        unimplemented!()
    }

    pub fn run(&self) -> Result<(), ProgramError> {
        self.check_program_account(self.proof_request)?;
        self.check_proof_request()?;
        Ok(())
    }

    /// Checks if the provided account is a valid program account
    fn check_program_account(&self, acc: &AccountInfo) -> Result<(), ProgramError> {
        if !cmp_pubkeys(acc.owner, ALBUS_PROGRAM_ID)
            && !cmp_pubkeys(acc.owner, ALBUS_DEV_PROGRAM_ID)
        {
            msg!("AlbusVerifierError: Invalid program account {}", acc.key);
            return Err(ProgramError::IllegalOwner);
        }
        if acc.data_is_empty() {
            msg!("AlbusVerifierError: Program account {} is empty", acc.key);
            return Err(ProgramError::UninitializedAccount);
        }
        Ok(())
    }

    fn check_proof_request(&self) -> Result<(), ProgramError> {
        let data = self.proof_request.data.borrow();
        let data = array_ref![data, 0, 218];

        let (
            discriminator,
            _service,
            policy,
            _circuit,
            _issuer,
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
        ) = array_refs![data, 8, 32, 32, 32, 32, 32, 8, 8, 8, 8, 8, 8, 1, 1];

        if discriminator != PROOF_REQUEST_DISCRIMINATOR {
            msg!("AlbusVerifierError: Invalid proof request discriminator");
            return Err(ProgramError::InvalidAccountData);
        }

        if let Some(key) = self.policy {
            if !cmp_pubkeys(key, policy) {
                msg!("AlbusVerifierError: Invalid proof request policy");
                return Err(ProgramError::InvalidAccountData);
            }
        }

        if let Some(key) = self.proof_request_owner {
            if !cmp_pubkeys(key, owner) {
                msg!("AlbusVerifierError: Invalid proof request owner");
                return Err(ProgramError::InvalidAccountData);
            }
        }

        let expired_at = i64::from_le_bytes(*expired_at);
        let status = ProofRequestStatus::try_from(*status)?;
        let timestamp = Clock::get()?.unix_timestamp;

        if expired_at > 0 && expired_at < timestamp {
            msg!("AlbusVerifierError: Expired!");
            return Err(ProgramError::Custom(VerificationError::Expired as u32));
        }

        match status {
            ProofRequestStatus::Pending => {
                msg!("AlbusVerifierError: Proof request is pending");
                Err(ProgramError::Custom(VerificationError::Pending as u32))
            }
            ProofRequestStatus::Proved => {
                msg!("AlbusVerifierError: Proof request is not verified");
                Err(ProgramError::Custom(VerificationError::NotVerified as u32))
            }
            ProofRequestStatus::Rejected => {
                msg!("AlbusVerifierError: Proof request is rejected");
                Err(ProgramError::Custom(VerificationError::Rejected as u32))
            }
            ProofRequestStatus::Verified => Ok(()),
        }
    }
}

#[repr(u8)]
pub enum VerificationError {
    NotVerified,
    Expired,
    Pending,
    Rejected,
}

#[repr(u8)]
#[derive(Default, Debug, Eq, PartialEq, Clone)]
pub enum ProofRequestStatus {
    #[default]
    Pending,
    Proved,
    Verified,
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

#[cfg(test)]
mod test {
    use solana_program::{account_info::AccountInfo, clock::Clock, pubkey::Pubkey};

    use super::*;

    #[test]
    fn test_verified() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let policy = Pubkey::new_unique();

        assert_eq!(
            AlbusVerifier::new(
                &ProofRequestBuilder::new()
                    .with_status(ProofRequestStatus::Verified)
                    .with_policy(policy)
                    .build()
            )
            .check_policy(policy)
            .run(),
            Ok(())
        );
    }

    #[test]
    fn test_expired() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let policy = Pubkey::new_unique();

        assert_eq!(
            AlbusVerifier::new(
                &ProofRequestBuilder::new()
                    .with_status(ProofRequestStatus::Proved)
                    .with_policy(policy)
                    .with_expired_at(1)
                    .build()
            )
            .check_policy(policy)
            .run(),
            Err(ProgramError::Custom(VerificationError::Expired as u32))
        );
    }

    #[test]
    fn test_ownership() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let owner = Pubkey::new_unique();
        let policy = Pubkey::new_unique();

        assert_eq!(
            AlbusVerifier::new(
                &ProofRequestBuilder::new()
                    .with_status(ProofRequestStatus::Verified)
                    .with_policy(policy)
                    .with_owner(owner)
                    .build()
            )
            .check_policy(policy)
            .check_owner(owner)
            .run(),
            Ok(())
        );

        // invalid owner
        assert_eq!(
            AlbusVerifier::new(
                &ProofRequestBuilder::new()
                    .with_status(ProofRequestStatus::Verified)
                    .with_policy(policy)
                    .with_owner(owner)
                    .build()
            )
            .check_policy(policy)
            .check_owner(Pubkey::new_unique())
            .run(),
            Err(ProgramError::InvalidAccountData)
        );
    }

    struct ProofRequestBuilder {
        expired_at: i64,
        owner: Pubkey,
        issuer: Pubkey,
        policy: Pubkey,
        status: u8,
        // --
        _pk: Pubkey,
        _owner: Pubkey,
        _lamports: u64,
        _data: Vec<u8>,
    }

    impl ProofRequestBuilder {
        pub fn new() -> Self {
            Self {
                expired_at: 0,
                issuer: Default::default(),
                owner: Default::default(),
                policy: Default::default(),
                status: 0,
                _pk: Default::default(),
                _owner: ALBUS_PROGRAM_ID,
                _lamports: 0,
                _data: vec![],
            }
        }

        pub fn with_status(&mut self, status: ProofRequestStatus) -> &mut Self {
            self.status = status as u8;
            self
        }

        pub fn with_issuer(&mut self, addr: Pubkey) -> &mut Self {
            self.issuer = addr;
            self
        }

        pub fn with_owner(&mut self, addr: Pubkey) -> &mut Self {
            self.owner = addr;
            self
        }

        pub fn with_policy(&mut self, addr: Pubkey) -> &mut Self {
            self.policy = addr;
            self
        }

        pub fn with_expired_at(&mut self, timestamp: i64) -> &mut Self {
            self.expired_at = timestamp;
            self
        }

        fn build(&mut self) -> AccountInfo {
            self._data = [
                PROOF_REQUEST_DISCRIMINATOR,
                &Pubkey::new_unique().to_bytes(), //service
                &self.policy.to_bytes(),
                &Pubkey::new_unique().to_bytes(), // circuit
                &self.issuer.to_bytes(),
                &self.owner.to_bytes(),
                &0u64.to_le_bytes(),
                &0i64.to_le_bytes(),
                &self.expired_at.to_le_bytes(),
                &0i64.to_le_bytes(),
                &0i64.to_le_bytes(),
                &0i64.to_le_bytes(),
                &[self.status],
                &0u8.to_le_bytes(), // bump
                &[0u8; 256],        // proof
                &[0u8; 28],         // public_inputs
            ]
            .into_iter()
            .flatten()
            .copied()
            .collect::<Vec<_>>();

            AccountInfo::new(
                &self._pk,
                false,
                true,
                &mut self._lamports,
                &mut self._data,
                &self._owner,
                false,
                0,
            )
        }
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
