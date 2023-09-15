use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::token::spl_token;
use mpl_token_metadata::{
    instruction::{create_master_edition_v3, create_metadata_accounts_v3},
    state::DataV2,
};

#[allow(clippy::too_many_arguments)]
pub fn mint_nft<'a: 'b, 'b>(
    mint: &AccountInfo<'a>,
    destination: &AccountInfo<'a>,
    authority: &AccountInfo<'a>,
    metadata_account: &AccountInfo<'a>,
    edition_account: Option<&AccountInfo<'a>>,
    payer: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    authority_signer_seeds: Option<&'b [&'b [u8]]>,
    data: DataV2,
) -> Result<()> {
    spl_token_mint_to(TokenMintToParams {
        mint: mint.to_account_info(),
        destination: destination.to_account_info(),
        authority: authority.to_account_info(),
        token_program: token_program.to_account_info(),
        authority_signer_seeds,
        amount: 1,
    })?;

    nft_create_metadata(
        &mint.to_account_info(),
        &authority.to_account_info(),
        &metadata_account.to_account_info(),
        &authority.to_account_info(),
        &payer.to_account_info(),
        &rent.to_account_info(),
        authority_signer_seeds,
        data,
    )?;

    if let Some(edition_account) = edition_account {
        nft_create_master_edition(
            &mint.to_account_info(),
            &metadata_account.to_account_info(),
            &edition_account.to_account_info(),
            &authority.to_account_info(),
            &payer.to_account_info(),
            &rent.to_account_info(),
            authority_signer_seeds,
        )?;
    }

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn nft_create_metadata<'a: 'b, 'b>(
    mint: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    metadata_account: &AccountInfo<'a>,
    metadata_authority: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    authority_signer_seeds: Option<&'b [&'b [u8]]>,
    data: DataV2,
) -> Result<()> {
    let ix = create_metadata_accounts_v3(
        mpl_token_metadata::id(),
        metadata_account.to_account_info().key(),
        mint.to_account_info().key(),
        mint_authority.key(),
        payer.key(),
        metadata_authority.key(),
        data.name,
        data.symbol,
        data.uri,
        data.creators,
        data.seller_fee_basis_points,
        true,
        true,
        data.collection,
        data.uses,
        None,
    );

    let mut seeds: Vec<&[&[u8]]> = vec![];
    if let Some(seed) = authority_signer_seeds {
        seeds.push(seed);
    }

    invoke_signed(
        &ix,
        &[
            metadata_account.to_account_info(),
            mint.to_account_info(),
            mint_authority.to_account_info(),
            payer.to_account_info(),
            metadata_authority.to_account_info(),
            rent.to_account_info(),
        ],
        seeds.as_slice(),
    )
    .map_err(Into::into)
}

#[allow(clippy::too_many_arguments)]
pub fn nft_create_master_edition<'a: 'b, 'b>(
    mint: &AccountInfo<'a>,
    metadata_account: &AccountInfo<'a>,
    edition_account: &AccountInfo<'a>,
    authority: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    authority_signer_seeds: Option<&'b [&'b [u8]]>,
) -> Result<()> {
    let ix = create_master_edition_v3(
        mpl_token_metadata::id(),
        edition_account.key(),
        mint.key(),
        authority.key(),
        authority.key(),
        metadata_account.key(),
        payer.key(),
        Some(0),
    );

    let mut seeds: Vec<&[&[u8]]> = vec![];
    if let Some(seed) = authority_signer_seeds {
        seeds.push(seed);
    }

    invoke_signed(
        &ix,
        &[
            edition_account.to_account_info(),
            metadata_account.to_account_info(),
            mint.to_account_info(),
            authority.to_account_info(),
            payer.to_account_info(),
            // token_program.to_account_info(),
            // metadata_program.to_account_info(),
            // system_program.to_account_info(),
            rent.to_account_info(),
        ],
        seeds.as_slice(),
    )
    .map_err(Into::into)
}

pub fn spl_token_mint_to(params: TokenMintToParams<'_, '_>) -> ProgramResult {
    let TokenMintToParams {
        mint,
        destination,
        authority,
        token_program,
        amount,
        authority_signer_seeds,
    } = params;
    let mut seeds: Vec<&[&[u8]]> = vec![];
    if let Some(seed) = authority_signer_seeds {
        seeds.push(seed);
    }
    invoke_signed(
        &spl_token::instruction::mint_to(
            token_program.key,
            mint.key,
            destination.key,
            authority.key,
            &[],
            amount,
        )?,
        &[mint, destination, authority, token_program],
        seeds.as_slice(),
    )
}

/// TokenMintToParams
pub struct TokenMintToParams<'a: 'b, 'b> {
    /// mint
    pub mint: AccountInfo<'a>,
    /// destination
    pub destination: AccountInfo<'a>,
    /// amount
    pub amount: u64,
    /// authority
    pub authority: AccountInfo<'a>,
    /// authority_signer_seeds
    pub authority_signer_seeds: Option<&'b [&'b [u8]]>,
    /// token_program
    pub token_program: AccountInfo<'a>,
}
