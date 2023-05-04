use anchor_lang::prelude::*;

use crate::{
    events::ProveEvent,
    state::{ZKPRequest, ZKPRequestStatus},
    utils::assert_valid_proof,
    AlbusError,
};

/// Proves the [ZKPRequest] by validating the proof metadata and updating its status to `Proved`.
/// Returns an error if the request has expired or if the proof metadata is invalid.
pub fn handler(ctx: Context<Prove>) -> Result<()> {
    let proof_metadata = assert_valid_proof(&ctx.accounts.proof_metadata)?;

    // TODO: check that proof has valid circuit ?

    let timestamp = Clock::get()?.unix_timestamp;

    let req = &mut ctx.accounts.zkp_request;

    if req.expired_at > 0 && req.expired_at < timestamp {
        return Err(AlbusError::Expired.into());
    }

    req.status = ZKPRequestStatus::Proved;
    req.proof = Some(proof_metadata.mint);
    req.proved_at = timestamp;
    // reset the verification time if it was previously provided
    req.verified_at = 0;

    emit!(ProveEvent {
        zkp_request: req.key(),
        service_provider: req.service_provider,
        circuit: req.circuit,
        proof: proof_metadata.mint,
        owner: req.owner,
        timestamp,
    });

    msg!("Proved!");

    Ok(())
}

#[derive(Accounts)]
pub struct Prove<'info> {
    #[account(mut)]
    pub zkp_request: Box<Account<'info, ZKPRequest>>,

    /// CHECK: checked inside
    pub proof_metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
