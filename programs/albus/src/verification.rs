use anchor_lang::prelude::*;

use crate::{state::{ZKPRequest, ZKPRequestStatus}};

pub fn check(zkp_request: AccountInfo) -> bool {
    let req = ZKPRequest::try_from_slice(zkp_request.data.take()).unwrap();

    match req.status {
        ZKPRequestStatus::Verified => true,
        _ => false
    }
}
