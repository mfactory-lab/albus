use std::str::FromStr;

use anchor_lang::prelude::*;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    constants::{AUTHORIZED_AUTHORITY, NFT_SYMBOL_PREFIX},
    AlbusError,
};

pub fn assert_valid_proof(account: &AccountInfo) -> Result<Metadata> {
    let metadata = assert_valid_metadata(account, None, None)?;
    if metadata.data.symbol != format!("{}-P", NFT_SYMBOL_PREFIX) {
        return Err(AlbusError::InvalidMetadata.into());
    }
    Ok(metadata)
}

pub fn assert_valid_circuit(account: &AccountInfo) -> Result<Metadata> {
    let metadata = assert_valid_metadata(account, None, None)?;
    if metadata.data.symbol != format!("{}-C", NFT_SYMBOL_PREFIX) {
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
    // check predefined authorities
    } else if !AUTHORIZED_AUTHORITY.is_empty()
        && !AUTHORIZED_AUTHORITY
            .iter()
            .any(|a| Pubkey::from_str(a).unwrap() == metadata.update_authority)
    {
        return Err(AlbusError::Unauthorized.into());
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
