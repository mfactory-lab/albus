//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use solana_program::pubkey::Pubkey;
use crate::generated::types::ProofRequestStatus;
use crate::generated::types::ProofData;
use borsh::BorshSerialize;
use borsh::BorshDeserialize;


#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ProofRequest {
pub discriminator: [u8; 8],
/// The [ServiceProvider] associated with this request
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub service_provider: Pubkey,
/// The [Policy] associated with this request
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub policy: Pubkey,
/// The [Circuit] used for proof generation
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub circuit: Pubkey,
/// The [Issuer] used for proof generation
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub issuer: Pubkey,
/// Proof request creator
#[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::DisplayFromStr>"))]
pub owner: Pubkey,
/// Auto-increment service specific identifier
pub identifier: u64,
/// Timestamp for when the request was created
pub created_at: i64,
/// Timestamp for when the request expires
pub expired_at: i64,
/// Timestamp for when the `proof` was verified
pub verified_at: i64,
/// Timestamp for when the user was added the `proof`
pub proved_at: i64,
/// Timestamp indicating when the data will no longer be stored
pub retention_end_date: i64,
/// Status of the request
pub status: ProofRequestStatus,
/// PDA bump
pub bump: u8,
/// Proof payload
pub proof: Option<ProofData>,
/// Public inputs that are used to verify the `proof`
pub public_inputs: Vec<[u8; 32]>,
}


impl ProofRequest {
  
  
  
  #[inline(always)]
  pub fn from_bytes(data: &[u8]) -> Result<Self, std::io::Error> {
    let mut data = data;
    Self::deserialize(&mut data)
  }
}

impl<'a> TryFrom<&solana_program::account_info::AccountInfo<'a>> for ProofRequest {
  type Error = std::io::Error;

  fn try_from(account_info: &solana_program::account_info::AccountInfo<'a>) -> Result<Self, Self::Error> {
      let mut data: &[u8] = &(*account_info.data).borrow();
      Self::deserialize(&mut data)
  }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountDeserialize for ProofRequest {
    fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
      Ok(Self::deserialize(buf)?)
    }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountSerialize for ProofRequest {}

#[cfg(feature = "anchor")]
impl anchor_lang::Owner for ProofRequest {
    fn owner() -> Pubkey {
      crate::ALBUS_ID
    }
}

#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::IdlBuild for ProofRequest {}


#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::Discriminator for ProofRequest {
  const DISCRIMINATOR: [u8; 8] = [0; 8];
}

