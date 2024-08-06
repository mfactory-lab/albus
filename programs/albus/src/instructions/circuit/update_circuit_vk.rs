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

use crate::{state::Circuit, utils::assert_authorized};

pub fn handler(ctx: Context<UpdateCircuitVk>, data: UpdateCircuitVkData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let circuit = &mut ctx.accounts.circuit;

    if let Some(alpha) = data.alpha {
        circuit.vk.alpha = alpha;
    }

    if let Some(beta) = data.beta {
        circuit.vk.beta = beta;
    }

    if let Some(gamma) = data.gamma {
        circuit.vk.gamma = gamma;
    }

    if let Some(delta) = data.delta {
        circuit.vk.delta = delta;
    }

    if let Some(ic) = data.ic {
        if data.extend_ic {
            circuit.vk.ic.extend(ic);
        } else {
            circuit.vk.ic = ic;
        }
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCircuitVkData {
    pub alpha: Option<[u8; 64]>,
    pub beta: Option<[u8; 128]>,
    pub gamma: Option<[u8; 128]>,
    pub delta: Option<[u8; 128]>,
    pub ic: Option<Vec<[u8; 64]>>,
    pub extend_ic: bool,
}

#[derive(Accounts)]
pub struct UpdateCircuitVk<'info> {
    #[account(mut)]
    pub circuit: Box<Account<'info, Circuit>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
