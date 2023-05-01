mod albus;

use anchor_lang::prelude::*;

declare_id!("4goQchSHCB4zSa3vjn2NdjnWhYuzn3oYSbx1kVwwZdHS");

#[program]
pub mod verified_transfer {
    use anchor_lang::system_program;
    use anchor_spl::token;
    use super::*;

    pub fn transfer(
        ctx: Context<VerifiedTransfer>,
        amount: u64,
    ) -> Result<()> {
        albus::verify(
            CpiContext::new(
                ctx.accounts.albus_program.to_account_info(),
                albus::Verify {
                    zkp_request: ctx.accounts.zkp_request.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
            ),
        )?;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.sender.to_account_info(),
                    to: ctx.accounts.receiver.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn spl_transfer(
        ctx: Context<VerifiedSplTransfer>,
        amount: u64,
    ) -> Result<()> {
        albus::verify(
            CpiContext::new(
                ctx.accounts.albus_program.to_account_info(),
                albus::Verify {
                    zkp_request: ctx.accounts.zkp_request.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
            ),
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.source.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.sender.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    #[derive(Accounts)]
    pub struct VerifiedTransfer<'info> {
        #[account(mut)]
        pub sender: Signer<'info>,

        /// CHECK: no needs to check, only for transfer
        #[account(mut)]
        pub receiver: AccountInfo<'info>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK: Albus program
        pub albus_program: AccountInfo<'info>,

        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct VerifiedSplTransfer<'info> {
        #[account(mut)]
        pub sender: Signer<'info>,

        /// CHECK: no needs to check, only for transfer
        #[account(mut)]
        pub receiver: AccountInfo<'info>,

        /// CHECK: token mint address
        pub token_mint: Box<Account<'info, token::Mint>>,

        #[account(
            mut,
            associated_token::mint = token_mint,
            associated_token::authority = sender,
        )]
        pub source: Account<'info, token::TokenAccount>,

        #[account(
            mut,
            associated_token::mint = token_mint,
            associated_token::authority = receiver,
        )]
        pub destination: Account<'info, token::TokenAccount>,

        /// CHECK: Albus ZKP request
        pub zkp_request: AccountInfo<'info>,

        /// CHECK: Albus program
        pub albus_program: AccountInfo<'info>,

        pub token_program: Program<'info, token::Token>,

        pub system_program: Program<'info, System>,
    }
}