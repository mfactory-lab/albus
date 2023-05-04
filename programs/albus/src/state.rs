use anchor_lang::{prelude::*, AnchorDeserialize};

const MAX_SERVICE_CODE_LEN: usize = 16;
const MAX_SERVICE_NAME_LEN: usize = 32;

#[account]
pub struct ServiceProvider {
    /// Authority that manages the service
    pub authority: Pubkey,
    /// Unique code identifying the service
    pub code: String,
    /// Name of the service
    pub name: String,
    /// Total number of zero-knowledge proof requests
    pub zkp_request_count: u64,
    /// Timestamp for when the service was created
    pub created_at: i64,
    /// Bump seed used to derive program-derived account seeds
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
    /// Address of the [ServiceProvider] associated with this request
    pub service_provider: Pubkey,
    // /// TODO: specific VC issuer
    // pub issuer: Pubkey,
    /// Address of the circuit associated with this request
    pub circuit: Pubkey,
    /// Address of the request initiator
    pub owner: Pubkey,
    /// Optional address of the proof NFT mint
    pub proof: Option<Pubkey>,
    /// Timestamp for when the request was created
    pub created_at: i64,
    /// Timestamp for when the request will expire
    pub expired_at: i64,
    /// Timestamp for when the proof was verified
    pub verified_at: i64,
    /// Timestamp for when the user was added to the proof
    pub proved_at: i64,
    /// Status of the ZKP request
    pub status: ZKPRequestStatus,
    /// Bump seed used to derive program-derived account seeds
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Eq, PartialEq, Clone)]
pub enum ZKPRequestStatus {
    #[default]
    Pending,
    Proved,
    Verified,
    Rejected,
}

impl ZKPRequest {
    pub const SEED: &'static [u8] = b"zkp-request";

    pub fn space() -> usize {
        8 + 32 + 32 + 32 + (1 + 32) + 8 + 8 + 8 + 8 + 1 + 1
    }
}
