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

mod constants;
mod events;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz");

#[program]
pub mod albus {
    use super::*;

    pub fn delete_account(ctx: Context<DeleteAccount>) -> Result<()> {
        delete_account::handler(ctx)
    }

    pub fn create_circuit(ctx: Context<CreateCircuit>, data: CreateCircuitData) -> Result<()> {
        create_circuit::handler(ctx, data)
    }

    pub fn update_circuit_vk(
        ctx: Context<UpdateCircuitVk>,
        data: UpdateCircuitVkData,
    ) -> Result<()> {
        update_circuit_vk::handler(ctx, data)
    }

    pub fn delete_circuit(ctx: Context<DeleteCircuit>) -> Result<()> {
        delete_circuit::handler(ctx)
    }

    pub fn create_service_provider(
        ctx: Context<CreateServiceProvider>,
        data: CreateServiceProviderData,
    ) -> Result<()> {
        add_service_provider::handler(ctx, data)
    }

    pub fn delete_service_provider(ctx: Context<DeleteServiceProvider>) -> Result<()> {
        delete_service_provider::handler(ctx)
    }

    pub fn create_policy(ctx: Context<CreatePolicy>, data: CreatePolicyData) -> Result<()> {
        create_policy::handler(ctx, data)
    }

    pub fn delete_policy(ctx: Context<DeletePolicy>) -> Result<()> {
        delete_policy::handler(ctx)
    }

    pub fn create_proof_request(
        ctx: Context<CreateProofRequest>,
        data: CreateProofRequestData,
    ) -> Result<()> {
        create_proof_request::handler(ctx, data)
    }

    pub fn delete_proof_request(ctx: Context<DeleteProofRequest>) -> Result<()> {
        delete_proof_request::handler(ctx)
    }

    pub fn prove(ctx: Context<Prove>, data: ProveData) -> Result<()> {
        prove::handler(ctx, data)
    }

    pub fn verify(ctx: Context<Verify>, data: VerifyData) -> Result<()> {
        verify::handler(ctx, data)
    }
}

#[error_code]
pub enum AlbusError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Unverified")]
    Unverified,
    #[msg("Unproved")]
    Unproved,
    #[msg("Expired")]
    Expired,
    #[msg("Wrong data")]
    WrongData,
    #[msg("Incorrect owner")]
    IncorrectOwner,
    #[msg("Invalid metadata")]
    InvalidMetadata,
}
