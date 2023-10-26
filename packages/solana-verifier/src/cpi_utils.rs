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
use anchor_lang::{
    prelude::*,
    context::CpiContext,
    solana_program::{account_info::AccountInfo, instruction::Instruction, program::invoke_signed},
};

use crate::ALBUS_PROGRAM_ID;

const VERIFY_IX_DISCM: [u8; 8] = [134, 245, 92,  39, 75, 253, 56, 152];

pub type VerificationCpiCtx<'a, 'b, 'c, 'info> = CpiContext<'a, 'b, 'c, 'info, VerifyProofRequest<'info>>;

/// Generates cpi call to Albus program, to verify proof request on-chain
pub fn cpi_verify_call(ctx: VerificationCpiCtx) -> Result<()> {
    let account_metas = vec![
        AccountMeta::new(ctx.accounts.proof_request.key(), false),
        AccountMeta::new_readonly(ctx.accounts.circuit.key(), false),
        AccountMeta::new(ctx.accounts.authority.key(), true),
        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    ];

    let ix = Instruction::new_with_bincode(Pubkey::from_str(ALBUS_PROGRAM_ID).unwrap(), &VERIFY_IX_DISCM, account_metas);

    let account_infos = vec![
        ctx.accounts.proof_request,
        ctx.accounts.circuit,
        ctx.accounts.authority,
        ctx.accounts.system_program,
    ];
    invoke_signed(&ix, &account_infos, ctx.signer_seeds).map_err(Into::into)
}

#[derive(Accounts)]
pub struct VerifyProofRequest<'info> {
    /// CHECK:
    pub proof_request: AccountInfo<'info>,
    /// CHECK:
    pub circuit: AccountInfo<'info>,
    /// CHECK:
    pub authority: AccountInfo<'info>,
    /// CHECK:
    pub system_program: AccountInfo<'info>,
}
