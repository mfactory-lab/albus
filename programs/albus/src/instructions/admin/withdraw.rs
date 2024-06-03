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

use crate::{utils::assert_authorized, ID};
use anchor_lang::{prelude::*, system_program};

pub fn handler(ctx: Context<AdminWithdraw>) -> Result<()> {
    assert_authorized(ctx.accounts.authority.key)?;

    let signer_seeds = [ID.as_ref(), &[ctx.bumps.albus_authority]];

    let amount = ctx.accounts.albus_authority.get_lamports();

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.albus_authority.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
        )
        .with_signer(&[&signer_seeds[..]]),
        amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct AdminWithdraw<'info> {
    /// CHECK:
    #[account(mut, seeds = [ID.as_ref()], bump)]
    pub albus_authority: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
