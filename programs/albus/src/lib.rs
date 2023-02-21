mod state;

use anchor_lang::prelude::*;

declare_id!("9SfbhzHrx5xczfoiTo2VVpG5oukcS5Schgy2ppLH3zQd");

#[program]
pub mod albus {
    use super::*;

    pub fn init_proof(ctx: Context<InitProof>) -> Result<()> {
        Ok(())
    }

    pub fn verify_proof(ctx: Context<Verify>) -> Result<()> {
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized action")]
    Unauthorized,
}

#[derive(Accounts)]
pub struct InitProof<'info> {
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Verify<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
