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

use crate::errors::SwapError;
use crate::state::TokenSwap;
use anchor_lang::prelude::*;
use solana_program::program_memory::sol_memcmp;
use solana_program::pubkey::PUBKEY_BYTES;

/// Checks two pubkeys for equality in a computationally cheap way using `sol_memcmp`
pub fn cmp_pubkeys(a: impl AsRef<[u8]>, b: impl AsRef<[u8]>) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

/// Calculates the authority id by generating a program address.
pub fn authority_id(program_id: &Pubkey, my_info: &Pubkey, bump_seed: u8) -> Result<Pubkey> {
    Pubkey::create_program_address(&[&my_info.to_bytes()[..32], &[bump_seed]], program_id)
        .or(Err(SwapError::InvalidProgramAddress.into()))
}

#[allow(clippy::too_many_arguments)]
pub fn check_accounts(
    token_swap: &TokenSwap,
    program_id: &Pubkey,
    token_swap_info: &AccountInfo,
    authority_info: &AccountInfo,
    token_a_info: &AccountInfo,
    token_b_info: &AccountInfo,
    pool_mint_info: &AccountInfo,
    token_program_info: &AccountInfo,
    user_token_a_info: Option<&AccountInfo>,
    user_token_b_info: Option<&AccountInfo>,
    pool_fee_account_info: Option<&AccountInfo>,
) -> Result<()> {
    if !cmp_pubkeys(token_swap_info.owner, program_id) {
        return Err(ProgramError::IncorrectProgramId.into());
    }
    if !cmp_pubkeys(
        authority_info.key(),
        authority_id(program_id, token_swap_info.key, token_swap.bump_seed)?,
    ) {
        return Err(SwapError::InvalidProgramAddress.into());
    }
    if !cmp_pubkeys(token_a_info.key, token_swap.token_a) {
        return Err(SwapError::IncorrectSwapAccount.into());
    }
    if !cmp_pubkeys(token_b_info.key, token_swap.token_b) {
        return Err(SwapError::IncorrectSwapAccount.into());
    }
    if !cmp_pubkeys(pool_mint_info.key, token_swap.pool_mint) {
        return Err(SwapError::IncorrectPoolMint.into());
    }
    if !cmp_pubkeys(token_program_info.key, token_swap.token_program_id) {
        return Err(SwapError::IncorrectTokenProgramId.into());
    }
    if let Some(user_token_a_info) = user_token_a_info {
        if cmp_pubkeys(token_a_info.key, user_token_a_info.key) {
            return Err(SwapError::InvalidInput.into());
        }
    }
    if let Some(user_token_b_info) = user_token_b_info {
        if cmp_pubkeys(token_b_info.key, user_token_b_info.key) {
            return Err(SwapError::InvalidInput.into());
        }
    }
    if let Some(pool_fee_account_info) = pool_fee_account_info {
        if !cmp_pubkeys(pool_fee_account_info.key, token_swap.pool_fee_account) {
            return Err(SwapError::IncorrectFeeAccount.into());
        }
    }
    Ok(())
}
