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

use crate::state::{Policy, PolicyRule, ServiceProvider};

pub fn handler(ctx: Context<UpdatePolicy>, data: UpdatePolicyData) -> Result<()> {
    let policy = &mut ctx.accounts.policy;

    if let Some(name) = data.name {
        policy.name = name;
    }

    if let Some(description) = data.description {
        policy.description = description;
    }

    if let Some(expiration_period) = data.expiration_period {
        policy.expiration_period = expiration_period;
    }

    if let Some(retention_period) = data.retention_period {
        policy.retention_period = retention_period;
    }

    if let Some(retention_period) = data.retention_period {
        policy.retention_period = retention_period;
    }

    if let Some(rules) = data.rules {
        policy.rules = rules;
    }

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePolicyData {
    pub name: Option<String>,
    pub description: Option<String>,
    pub expiration_period: Option<u32>,
    pub retention_period: Option<u32>,
    pub rules: Option<Vec<PolicyRule>>,
}

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    #[account(mut, has_one = service_provider)]
    pub policy: Box<Account<'info, Policy>>,

    #[account(mut, has_one = authority)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
