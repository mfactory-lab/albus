use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::{
    events::CreateZKPRequestEvent,
    state::{ServiceProvider, ZKPRequest},
    utils::assert_valid_circuit,
};

pub fn handler(ctx: Context<CreateZKPRequest>, data: CreateZKPRequestData) -> Result<()> {
    let circuit_metadata = assert_valid_circuit(&ctx.accounts.circuit_metadata)?;

    let timestamp = Clock::get()?.unix_timestamp;

    let req = &mut ctx.accounts.zkp_request;
    req.service_provider = ctx.accounts.service_provider.key();
    req.owner = ctx.accounts.authority.key();
    req.proof = None;
    req.circuit = circuit_metadata.mint;
    req.created_at = timestamp;
    if data.expires_in > 0 {
        req.expired_at = timestamp.saturating_add(data.expires_in as i64);
    }
    req.bump = ctx.bumps["zkp_request"];

    let sp = &mut ctx.accounts.service_provider;
    sp.zkp_request_count += 1;

    emit!(CreateZKPRequestEvent {
        service_provider: req.service_provider,
        circuit: req.circuit,
        owner: req.owner,
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateZKPRequestData {
    pub expires_in: u32,
}

#[derive(Accounts)]
pub struct CreateZKPRequest<'info> {
    #[account(mut)]
    pub service_provider: Box<Account<'info, ServiceProvider>>,

    #[account(
        init_if_needed,
        seeds = [
            ZKPRequest::SEED,
            service_provider.key().as_ref(),
            circuit_mint.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
        payer = authority,
        space = ZKPRequest::space()
    )]
    pub zkp_request: Box<Account<'info, ZKPRequest>>,

    #[account(
        constraint = circuit_mint.supply == 1,
        constraint = circuit_mint.decimals == 0,
    )]
    pub circuit_mint: Box<Account<'info, Mint>>,

    /// CHECK: checked in metaplex
    pub circuit_metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
