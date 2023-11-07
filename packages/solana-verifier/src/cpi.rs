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

use anchor_lang::{
    context::CpiContext,
    prelude::*,
    solana_program::{account_info::AccountInfo, instruction::Instruction, program::invoke_signed},
};

const VERIFY_IX_DISCRIMINATOR: [u8; 8] = [134, 245, 92, 39, 75, 253, 56, 152];

/// Generates cpi call to Albus program, to verify proof request on-chain
pub fn verify<'info>(
    accounts: VerifyProofRequest<'info>,
    program: AccountInfo<'info>,
) -> Result<()> {
    let ctx = CpiContext::new(program.to_account_info(), accounts);

    let ix = Instruction::new_with_bincode(
        program.key(),
        &VERIFY_IX_DISCRIMINATOR,
        vec![
            AccountMeta::new(ctx.accounts.proof_request.key(), false),
            AccountMeta::new_readonly(ctx.accounts.circuit.key(), false),
            AccountMeta::new(ctx.accounts.authority.key(), true),
            AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
        ],
    );

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
    /// CHECK: account checked in CPI
    pub proof_request: AccountInfo<'info>,
    /// CHECK: account checked in CPI
    pub circuit: AccountInfo<'info>,
    /// CHECK: account checked in CPI
    pub authority: AccountInfo<'info>,
    /// CHECK: account checked in CPI
    pub system_program: AccountInfo<'info>,
}
