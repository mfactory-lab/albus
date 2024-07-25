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

use crate::errors::AlbusError;
use crate::state::{Circuit, ServiceProvider};
use crate::state::{Policy, PolicyRule};

pub fn handler(ctx: Context<CreatePolicy>, data: CreatePolicyData) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    let service = &mut ctx.accounts.service_provider;
    service.policy_count += 1;

    let policy = &mut ctx.accounts.policy;
    policy.service_provider = service.key();
    policy.circuit = ctx.accounts.circuit.key();
    policy.code = data.code;
    policy.name = data.name;
    policy.description = data.description;
    policy.rules = data.rules;
    policy.expiration_period = data.expiration_period;
    policy.retention_period = data.retention_period;
    policy.created_at = timestamp;
    policy.bump = ctx.bumps.policy;

    Ok(())
}

/// Data required to create a new proof request
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreatePolicyData {
    pub code: String,
    pub name: String,
    pub description: String,
    pub expiration_period: u32,
    pub retention_period: u32,
    pub rules: Vec<PolicyRule>,
}

#[derive(Accounts)]
#[instruction(data: CreatePolicyData)]
pub struct CreatePolicy<'info> {
    #[account(mut, has_one = authority @ AlbusError::Unauthorized)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    pub circuit: Box<Account<'info, Circuit>>,

    #[account(
        init,
        seeds = [
            Policy::SEED,
            service_provider.key().as_ref(),
            data.code.as_bytes()
        ],
        bump,
        payer = authority,
        space = Policy::space(data.rules.len())
    )]
    pub policy: Box<Account<'info, Policy>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
