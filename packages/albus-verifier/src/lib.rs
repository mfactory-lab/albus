use arrayref::array_refs;
use solana_program::program_memory::sol_memcmp;
use solana_program::pubkey::{Pubkey, PUBKEY_BYTES};
use solana_program::{
    account_info::AccountInfo, clock::Clock, msg, program_error::ProgramError, sysvar::Sysvar,
};

pub const ZKP_REQUEST_DISCRIMINATOR: &[u8] = &[196, 177, 30, 25, 231, 233, 97, 178];

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

    let (discriminator, _, _, owner, _, _, expired_at, _, _, [status], _) =
        array_refs![data, 8, 32, 32, 32, 33, 8, 8, 8, 8, 1, 1];

    if discriminator != ZKP_REQUEST_DISCRIMINATOR {
        msg!("Error: Invalid account discriminator!");
        return Err(ProgramError::InvalidAccountData);
    }

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
            msg!("Error: ZKP request is Pending");
            Err(ProgramError::Custom(3))
        }
        ZKPRequestStatus::Rejected => {
            msg!("Error: ZKP request is Rejected");
            Err(ProgramError::Custom(4))
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

        let addr = Pubkey::new_unique();
        let owner = Pubkey::new_unique();
        let lamp = &mut 0;
        let mut data = get_zkp_request(ZKPRequestStatus::Verified, 0, owner);

        let acc = AccountInfo::new(
            &addr,
            false,
            false,
            lamp,
            data.as_mut_slice(),
            &addr,
            false,
            0,
        );

        assert_eq!(check_compliant(&acc, Some(owner)), Ok(()));
    }

    #[test]
    fn test_expired() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

        let addr = Pubkey::new_unique();
        let lamports = &mut 0;
        let mut data = get_zkp_request(ZKPRequestStatus::Proved, 1, Pubkey::new_unique());

        let acc = AccountInfo::new(
            &addr,
            false,
            false,
            lamports,
            data.as_mut_slice(),
            &addr,
            false,
            0,
        );

        assert_eq!(check_compliant(&acc, None), Err(ProgramError::Custom(1)));
    }

    #[test]
    fn test_ownership() {
        solana_program::program_stubs::set_syscall_stubs(Box::new(SyscallStubs {}));

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
            &addr,
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
