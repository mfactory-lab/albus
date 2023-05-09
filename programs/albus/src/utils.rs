use std::str::FromStr;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_memory::sol_memcmp;
use anchor_lang::solana_program::pubkey::PUBKEY_BYTES;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    constants::{AUTHORIZED_AUTHORITY, NFT_SYMBOL_PREFIX},
    AlbusError,
};

const PROOF_SYMBOL_CODE: &str = "P";
const CIRCUIT_SYMBOL_CODE: &str = "C";

/// Checks two pubkeys for equality in a computationally cheap way using `sol_memcmp`
pub fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

/// Check that the `authority` key is authorized
pub fn assert_authorized(authority: &Pubkey) -> Result<()> {
    if !AUTHORIZED_AUTHORITY.is_empty()
        && !AUTHORIZED_AUTHORITY
            .iter()
            .any(|a| Pubkey::from_str(a).unwrap() == *authority)
    {
        Err(AlbusError::Unauthorized.into())
    } else {
        Ok(())
    }
}

fn is_valid_symbol(symbol: &str, code: &str) -> bool {
    symbol.starts_with(&format!("{}-{}", NFT_SYMBOL_PREFIX, code))
}

pub fn assert_valid_proof(account: &AccountInfo) -> Result<Metadata> {
    let metadata = assert_valid_metadata(account, None, None)?;
    if !is_valid_symbol(&metadata.data.symbol, PROOF_SYMBOL_CODE) {
        return Err(AlbusError::InvalidMetadata.into());
    }
    Ok(metadata)
}

pub fn assert_valid_circuit(account: &AccountInfo) -> Result<Metadata> {
    let metadata = assert_valid_metadata(account, None, None)?;
    if !is_valid_symbol(&metadata.data.symbol, CIRCUIT_SYMBOL_CODE) {
        return Err(AlbusError::InvalidMetadata.into());
    }
    Ok(metadata)
}

pub fn assert_valid_metadata(
    account: &AccountInfo,
    authorized_authority: Option<&[Pubkey]>,
    authorized_creator: Option<&Pubkey>,
) -> Result<Metadata> {
    assert_owned_by(account, &mpl_token_metadata::id())?;

    if account.data_is_empty() {
        return Err(AlbusError::InvalidMetadata.into());
    }

    let metadata: Metadata = Metadata::from_account_info(account)?;

    // determine authorized authority
    if let Some(auth) = authorized_authority {
        if !auth.iter().any(|a| a == &metadata.update_authority) {
            return Err(AlbusError::Unauthorized.into());
        }
    } else {
        assert_authorized(&metadata.update_authority)?;
    }

    // determine authorized creator
    if let Some(creator) = authorized_creator {
        match &metadata.data.creators {
            Some(creators) => {
                if !creators.iter().any(|c| c.address == *creator) {
                    return Err(AlbusError::Unauthorized.into());
                }
            }
            None => {
                return Err(AlbusError::Unauthorized.into());
            }
        };
    }

    Ok(metadata)
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
    if account.owner != owner {
        Err(AlbusError::IncorrectOwner.into())
    } else {
        Ok(())
    }
}
