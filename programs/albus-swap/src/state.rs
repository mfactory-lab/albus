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

use anchor_lang::prelude::*;

#[account]
pub struct TokenSwap {
    /// Is the swap initialized, with data written to it
    pub is_initialized: bool,

    /// Bump seed used in program address.
    /// The program address is created deterministically with the bump seed,
    /// swap program id, and swap account pubkey.  This program address has
    /// authority over the swap's token A account, token B account, and pool
    /// token mint.
    pub bump_seed: u8,

    /// Program ID of the tokens being exchanged.
    pub token_program_id: Pubkey,

    /// Token A
    pub token_a: Pubkey,

    /// Token B
    pub token_b: Pubkey,

    /// Pool tokens are issued when A or B tokens are deposited.
    /// Pool tokens can be withdrawn back to the original A or B token.
    pub pool_mint: Pubkey,

    /// Mint information for token A
    pub token_a_mint: Pubkey,
    /// Mint information for token B
    pub token_b_mint: Pubkey,

    /// Pool token account to receive trading and / or withdrawal fees
    pub pool_fee_account: Pubkey,

    /// All fee information
    pub fees: TokenSwapFees,

    /// Swap curve parameters, to be unpacked and used by the SwapCurve, which
    /// calculates swaps, deposits, and withdrawals
    pub curve: TokenSwapCurve,

    /// Albus policy
    pub policy: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TokenSwapFees {
    pub trade_fee_numerator: u64,
    pub trade_fee_denominator: u64,
    pub owner_trade_fee_numerator: u64,
    pub owner_trade_fee_denominator: u64,
    pub owner_withdraw_fee_numerator: u64,
    pub owner_withdraw_fee_denominator: u64,
    pub host_fee_numerator: u64,
    pub host_fee_denominator: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TokenSwapCurve {
    pub curve_type: u8,
    pub curve_parameters: u64,
}
