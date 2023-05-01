mod constants;
mod events;
mod instructions;
mod state;
mod utils;
pub mod verification;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("5dAMQUdhhsMwS8m7zVhKzVxiDNEHkTdCZ28dowCmVsj5");

#[program]
pub mod albus {

    use super::*;

    pub fn add_service_provider(
        ctx: Context<AddServiceProvider>,
        data: AddServiceProviderData,
    ) -> Result<()> {
        add_service_provider::handler(ctx, data)
    }

    pub fn delete_service_provider(ctx: Context<DeleteServiceProvider>) -> Result<()> {
        delete_service_provider::handler(ctx)
    }

    pub fn create_zkp_request(
        ctx: Context<CreateZKPRequest>,
        data: CreateZKPRequestData,
    ) -> Result<()> {
        create_zkp_request::handler(ctx, data)
    }

    pub fn delete_zkp_request(ctx: Context<DeleteZKPRequest>) -> Result<()> {
        delete_zkp_request::handler(ctx)
    }

    pub fn prove(ctx: Context<Prove>) -> Result<()> {
        prove::handler(ctx)
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
