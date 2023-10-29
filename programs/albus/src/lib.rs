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
mod errors;
mod events;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL");

#[cfg(not(feature = "no-entrypoint"))]
solana_security_txt::security_txt! {
    name: "Albus",
    project_url: "https://albus.finance",
    contacts: "email:info@albus.finance,twitter:@AlbusProtocol",
    policy: "https://github.com/mfactory-lab/albus/blob/master/SECURITY.md",
    preferred_languages: "en",
    source_code: "https://github.com/mfactory-lab/albus"
}

#[program]
pub mod albus {
    use super::*;

    // Credentials

    pub fn mint_credential(ctx: Context<MintCredential>, data: MintCredentialData) -> Result<()> {
        mint_credential::handler(ctx, data)
    }

    pub fn update_credential(
        ctx: Context<UpdateCredential>,
        data: UpdateCredentialData,
    ) -> Result<()> {
        update_credential::handler(ctx, data)
    }

    pub fn revoke_credential(ctx: Context<RevokeCredential>) -> Result<()> {
        revoke_credential::handler(ctx)
    }

    // Circuit

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

    // Service Provider

    pub fn create_service_provider(
        ctx: Context<CreateServiceProvider>,
        data: CreateServiceProviderData,
    ) -> Result<()> {
        create_service_provider::handler(ctx, data)
    }

    pub fn update_service_provider<'info>(
        ctx: Context<'_, '_, 'info, 'info, UpdateServiceProvider<'info>>,
        data: UpdateServiceProviderData,
    ) -> Result<()> {
        update_service_provider::handler(ctx, data)
    }

    pub fn delete_service_provider(ctx: Context<DeleteServiceProvider>) -> Result<()> {
        delete_service_provider::handler(ctx)
    }

    // Policy

    pub fn create_policy(ctx: Context<CreatePolicy>, data: CreatePolicyData) -> Result<()> {
        create_policy::handler(ctx, data)
    }

    pub fn update_policy(ctx: Context<UpdatePolicy>, data: UpdatePolicyData) -> Result<()> {
        update_policy::handler(ctx, data)
    }

    pub fn delete_policy(ctx: Context<DeletePolicy>) -> Result<()> {
        delete_policy::handler(ctx)
    }

    // Trustee

    pub fn create_trustee(ctx: Context<CreateTrustee>, data: CreateTrusteeData) -> Result<()> {
        create_trustee::handler(ctx, data)
    }

    pub fn update_trustee(ctx: Context<UpdateTrustee>, data: UpdateTrusteeData) -> Result<()> {
        update_trustee::handler(ctx, data)
    }

    pub fn verify_trustee(ctx: Context<VerifyTrustee>) -> Result<()> {
        verify_trustee::handler(ctx)
    }

    pub fn delete_trustee(ctx: Context<DeleteTrustee>) -> Result<()> {
        delete_trustee::handler(ctx)
    }

    // Proof Request

    pub fn create_proof_request(
        ctx: Context<CreateProofRequest>,
        data: CreateProofRequestData,
    ) -> Result<()> {
        create_proof_request::handler(ctx, data)
    }

    pub fn delete_proof_request(ctx: Context<DeleteProofRequest>) -> Result<()> {
        delete_proof_request::handler(ctx)
    }

    pub fn prove_proof_request(
        ctx: Context<ProveProofRequest>,
        data: ProveProofRequestData,
    ) -> Result<()> {
        prove_proof_request::handler(ctx, data)
    }

    pub fn verify_proof_request(ctx: Context<VerifyProofRequest>) -> Result<()> {
        verify_proof_request::handler(ctx)
    }

    pub fn update_proof_request(
        ctx: Context<UpdateProofRequest>,
        data: UpdateProofRequestData,
    ) -> Result<()> {
        update_proof_request::handler(ctx, data)
    }

    // Investigation

    pub fn create_investigation_request<'info>(
        ctx: Context<'_, '_, 'info, 'info, CreateInvestigationRequest<'info>>,
        data: CreateInvestigationRequestData,
    ) -> Result<()> {
        create_investigation_request::handler(ctx, data)
    }

    pub fn reveal_secret_share(
        ctx: Context<RevealSecretShare>,
        data: RevealSecretShareData,
    ) -> Result<()> {
        reveal_secret_share::handler(ctx, data)
    }

    // Admin

    pub fn admin_close_account(ctx: Context<AdminCloseAccount>) -> Result<()> {
        close_account::close_account(ctx)
    }
}
