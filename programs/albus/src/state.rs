use anchor_lang::{prelude::*, AnchorDeserialize};

const MAX_SERVICE_CODE_LEN: usize = 16;
const MAX_SERVICE_NAME_LEN: usize = 32;

#[account]
pub struct ServiceProvider {
    /// Service's manager authority
    pub authority: Pubkey,
    /// Unique service code
    pub code: String,
    /// The name of the service
    pub name: String,
    /// Total zkp request
    pub zkp_request_count: u64,
    /// Creation date
    pub created_at: i64,
    /// Bump seed for deriving PDA seeds
    pub bump: u8,
}

impl ServiceProvider {
    pub const SEED: &'static [u8] = b"service-provider";

    pub fn space() -> usize {
        8 + 32 + (4 + MAX_SERVICE_CODE_LEN) + (4 + MAX_SERVICE_NAME_LEN) + 8 + 8 + 1
    }
}

#[account]
pub struct ZKPRequest {
    /// [ServiceProvider] address
    pub service_provider: Pubkey,
    // /// TODO: specific VC issuer
    // pub issuer: Pubkey,
    /// Circuit address
    pub circuit: Pubkey,
    /// Request initiator
    pub owner: Pubkey,
    /// Proof NFT mint address
    pub proof: Option<Pubkey>,
    /// Request creation date
    pub created_at: i64,
    /// Request expiration date
    pub expired_at: i64,
    /// Date the proof was verified
    pub verified_at: i64,
    /// Date the user was added the proof
    pub proved_at: i64,
    /// ZKP request status
    pub status: ZKPRequestStatus,
    /// Bump seed for deriving PDA seeds
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone)]
pub enum ZKPRequestStatus {
    Proved,
    Verified,
    Pending,
    Rejected,
}

impl ZKPRequest {
    pub const SEED: &'static [u8] = b"zkp-request";

    pub fn space() -> usize {
        8 + 32 + 32 + 32 + (1 + 32) + 8 + 8 + 8 + 8 + 1 + 1
    }
}
