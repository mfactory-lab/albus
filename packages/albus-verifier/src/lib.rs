use arrayref::{array_ref, array_refs};
use solana_program::{
    account_info::AccountInfo, clock::Clock, msg, program_error::ProgramError,
    sysvar::Sysvar,
};

pub const DISCRIMINATOR: &'static [u8] = &[196, 177, 30, 25, 231, 233, 97, 178];
pub const SPACE: usize = 8 + 32 + 32 + 32 + (1 + 32) + 8 + 8 + 8 + 8 + 1 + 1;

pub enum ZKPRequestStatus {
    Pending,
    Proved,
    Verified,
    Rejected,
}

impl ZKPRequestStatus {
    pub fn from_bytes(data: &[u8]) -> Result<ZKPRequestStatus, ProgramError> {
        match data.first() {
            Some(0) => Ok(ZKPRequestStatus::Pending),
            Some(1) => Ok(ZKPRequestStatus::Proved),
            Some(2) => Ok(ZKPRequestStatus::Verified),
            Some(3) => Ok(ZKPRequestStatus::Rejected),
            _ => Err(ProgramError::InvalidAccountData),
        }
    }
}

pub fn check_compliant(zkp_request: AccountInfo) -> Result<(), ProgramError> {
    let data = &zkp_request
        .data
        .try_borrow_mut()
        .map_err(|_| ProgramError::InvalidAccountData)?[..];

    let data = array_ref![data, 0, SPACE];

    let (discriminator, _, _, _, _, _, expired_at, _, _, status, _) =
        array_refs![data, 8, 32, 32, 32, 33, 8, 8, 8, 8, 1, 1];

    if discriminator != DISCRIMINATOR {
        return Err(ProgramError::InvalidAccountData);
    }

    let expired_at = i64::from_le_bytes(*expired_at);
    let status = ZKPRequestStatus::from_bytes(status)?;

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
            msg!("Failure: ZKP request status is 'Proved'");
            Err(ProgramError::Custom(2))
        }
        ZKPRequestStatus::Pending => {
            msg!("Failure: ZKP request status is 'Pending'");
            Err(ProgramError::Custom(2))
        }
        ZKPRequestStatus::Rejected => {
            msg!("Failure: ZKP request status is 'Denied'");
            Err(ProgramError::Custom(2))
        }
    }
}
