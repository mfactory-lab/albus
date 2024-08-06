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

use solana_program::{pubkey, pubkey::Pubkey};

pub const ALBUS_PROGRAM_ID: Pubkey = pubkey!("ALBUSbdydS2qoQXXeFfr4mqc9LFw5xWmUMdB4tcscHhi");
pub const ALBUS_DEV_PROGRAM_ID: Pubkey = pubkey!("ALBSoqJrZeZZ423xWme5nozNcozCtMvDWTZZmQLMT3fp");

pub const POLICY_DISCRIMINATOR: &[u8] = &[222, 135, 7, 163, 235, 177, 33, 68];
pub const PROOF_REQUEST_DISCRIMINATOR: &[u8] = &[78, 10, 176, 254, 231, 33, 111, 224];

#[allow(dead_code)]
pub const VERIFY_IX_DISCRIMINATOR: [u8; 8] = [134, 245, 92, 39, 75, 253, 56, 152];
