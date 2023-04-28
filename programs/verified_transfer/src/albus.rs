use anchor_lang::{
    prelude::*,
    solana_program::{account_info::AccountInfo, instruction::Instruction, program::invoke_signed},
};

use crate::{AccountMeta, Accounts};

const VERIFY_IX_DISCM: [u8; 8] = [133, 161, 141, 48, 120, 198, 88, 150];

pub fn verify<'info>(ctx: CpiContext<'_, '_, '_, 'info, Verify<'info>>) -> Result<()> {
    let account_metas = vec![
        AccountMeta::new_readonly(ctx.accounts.zkp_request.key(), false),
        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    ];

    let ix = Instruction::new_with_bincode(ctx.program.key(), &VERIFY_IX_DISCM, account_metas);

    let account_infos = vec![
        ctx.accounts.zkp_request,
        ctx.accounts.system_program,
    ];

    invoke_signed(&ix, &account_infos, ctx.signer_seeds).map_err(Into::into)
}

#[derive(Accounts)]
pub struct Verify<'info> {
    /// CHECK:
    pub zkp_request: AccountInfo<'info>,
    /// CHECK:
    pub system_program: AccountInfo<'info>,
}
