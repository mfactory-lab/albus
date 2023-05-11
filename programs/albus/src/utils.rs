/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

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
