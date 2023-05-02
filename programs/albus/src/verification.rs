use anchor_lang::prelude::*;

use crate::{
    state::{ZKPRequest, ZKPRequestStatus},
    AlbusError,
};

pub fn check(zkp_request: AccountInfo) -> Result<()> {
    let mut data = &zkp_request
        .data
        .try_borrow_mut()
        .map_err(|_| ErrorCode::AccountDidNotDeserialize)?[..];
    let req = ZKPRequest::try_deserialize(&mut data)?;

    let timestamp = Clock::get()?.unix_timestamp;

    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    match req.status {
        ZKPRequestStatus::Verified => {
            msg!("Verified!");
            Ok(())
        }
        ZKPRequestStatus::Proved => {
            msg!("Failure: ZKP request status is 'Proved'");
            Err(AlbusError::Unverified.into())
        }
        ZKPRequestStatus::Pending => {
            msg!("Failure: ZKP request status is 'Pending'");
            Err(AlbusError::Unverified.into())
        }
        ZKPRequestStatus::Denied => {
            msg!("Failure: ZKP request status is 'Denied'");
            Err(AlbusError::Unverified.into())
        }
    }
}
