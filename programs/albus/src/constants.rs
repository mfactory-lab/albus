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

use anchor_lang::solana_program::pubkey;
use anchor_lang::solana_program::pubkey::Pubkey;

/// List of root authorities
pub const AUTHORIZED_AUTHORITY: &[Pubkey] = &[
    #[cfg(feature = "testing")]
    pubkey!("4kMtMnYWFbsMc7M3jcdnfCceHaiXmrqaMz2QZQAmn88i"),
    #[cfg(feature = "devnet")]
    pubkey!("5tWk9EZcMpdKzxVGr4ZakZDHdWiqVJkLQ1b3v2vraDeH"),
    pubkey!("AuthxkATW25YDWX4kyDLh5qFMV1VhxKtRC9FBHh2JwZR"),
];

pub const META_VALID_UNTIL_SIGNAL: &str = "meta_validUntil";

/// Issuer signal name used in Albus circuits
pub const ISSUER_PK_SIGNAL: &str = "issuerPk";

/// Timestamp signal name used in Albus circuits
pub const TIMESTAMP_SIGNAL: &str = "timestamp";
pub const TIMESTAMP_THRESHOLD: u16 = 60;

/// Albus NFT symbols begin with this prefix
pub const NFT_SYMBOL_PREFIX: &str = "ALBUS";
pub const CREDENTIAL_SYMBOL_CODE: &str = "DC";
pub const CREDENTIAL_NAME: &str = "Albus Digital Credential";

pub const DEFAULT_SECRET_SHARE_THRESHOLD: u8 = 2;
