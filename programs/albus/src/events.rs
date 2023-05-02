use crate::*;

#[event]
pub struct CreateZKPRequestEvent {
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteZKPRequestEvent {
    #[index]
    pub zkp_request: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProveEvent {
    #[index]
    pub zkp_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub proof: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VerifyEvent {
    #[index]
    pub zkp_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RejectEvent {
    #[index]
    pub zkp_request: Pubkey,
    #[index]
    pub service_provider: Pubkey,
    pub circuit: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}
