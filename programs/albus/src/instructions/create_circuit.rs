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

use crate::state::Circuit;
use crate::utils::assert_authorized;

pub fn handler(ctx: Context<CreateCircuit>, data: CreateCircuitData) -> Result<()> {
    assert_authorized(&ctx.accounts.authority.key())?;

    let timestamp = Clock::get()?.unix_timestamp;

    let circuit = &mut ctx.accounts.circuit;

    circuit.code = data.code;
    circuit.name = data.name;
    circuit.description = data.description;
    circuit.wasm_uri = data.wasm_uri;
    circuit.zkey_uri = data.zkey_uri;
    circuit.created_at = timestamp;
    circuit.private_signals = data.private_signals;
    circuit.public_signals = data.public_signals;
    circuit.bump = ctx.bumps["circuit"];

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCircuitData {
    pub code: String,
    pub name: String,
    pub description: String,
    pub wasm_uri: String,
    pub zkey_uri: String,
    pub private_signals: Vec<String>,
    pub public_signals: Vec<String>,
}

#[derive(Accounts)]
#[instruction(data: CreateCircuitData)]
pub struct CreateCircuit<'info> {
    #[account(
        init,
        seeds = [Circuit::SEED, data.code.as_bytes()],
        bump,
        payer = authority,
        space = Circuit::space(
            Circuit::signals_count(&data.private_signals) +
            Circuit::signals_count(&data.public_signals)
        )
    )]
    pub circuit: Box<Account<'info, Circuit>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
