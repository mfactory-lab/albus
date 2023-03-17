use std::str::FromStr;

use anyhow::Result;
use mpl_token_metadata::{
    instruction::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mint_new_edition_from_master_edition_via_token, update_metadata_accounts_v2,
    },
    state::{AssetData, CollectionDetails, Data, PrintSupply},
    ID as TOKEN_METADATA_PROGRAM_ID,
};
use solana_sdk::{
    example_mocks::solana_rpc_client::rpc_client::RpcClient,
    pubkey::Pubkey,
    signature::{Keypair, Signature, Signer},
    system_instruction::create_account,
    transaction::Transaction,
};
use spl_token::{
    instruction::{initialize_mint, mint_to},
    ID as TOKEN_PROGRAM_ID,
};

const MINT_LAYOUT: u64 = 82;

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTData {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub creators: Option<Vec<NFTCreator>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTCreator {
    pub address: String,
    pub verified: bool,
    pub share: u8,
}

#[allow(clippy::too_many_arguments)]
pub fn mint(
    client: &RpcClient,
    funder: Keypair,
    receiver: Pubkey,
    nft_data: NFTData,
    immutable: bool,
    primary_sale_happened: bool,
    max_editions: i64,
    sized: bool,
) -> Result<(Signature, Pubkey)> {
    let mint = Keypair::new();

    // Max editions of -1 means infinite supply (max_supply = None)
    // Otherwise max_supply is the number of editions
    let max_supply = if max_editions == -1 {
        None
    } else {
        Some(max_editions as u64)
    };

    // Convert local NFTData type to Metaplex Data type
    let data = convert_local_to_remote_data(nft_data)?;

    // Allocate memory for the account
    let min_rent = client.get_minimum_balance_for_rent_exemption(MINT_LAYOUT as usize)?;

    // Create mint account
    let create_mint_account_ix = create_account(
        &funder.pubkey(),
        &mint.pubkey(),
        min_rent,
        MINT_LAYOUT,
        &TOKEN_PROGRAM_ID,
    );

    // Initialize mint ix
    let init_mint_ix = initialize_mint(
        &TOKEN_PROGRAM_ID,
        &mint.pubkey(),
        &funder.pubkey(),
        Some(&funder.pubkey()),
        0,
    )?;

    // Derive associated token account
    let assoc = get_associated_token_address(&receiver, &mint.pubkey());

    // Create associated account instruction
    let create_assoc_account_ix = create_associated_token_account(
        &funder.pubkey(),
        &receiver,
        &mint.pubkey(),
        &spl_token::ID,
    );

    // Mint to instruction
    let mint_to_ix = mint_to(
        &TOKEN_PROGRAM_ID,
        &mint.pubkey(),
        &assoc,
        &funder.pubkey(),
        &[],
        1,
    )?;

    // Derive metadata account
    let metadata_seeds = &[
        "metadata".as_bytes(),
        &TOKEN_METADATA_PROGRAM_ID.to_bytes(),
        &mint.pubkey().to_bytes(),
    ];
    let (metadata_account, _pda) =
        Pubkey::find_program_address(metadata_seeds, &TOKEN_METADATA_PROGRAM_ID);

    // Derive Master Edition account
    let master_edition_seeds = &[
        "metadata".as_bytes(),
        &TOKEN_METADATA_PROGRAM_ID.to_bytes(),
        &mint.pubkey().to_bytes(),
        "edition".as_bytes(),
    ];
    let (master_edition_account, _pda) =
        Pubkey::find_program_address(master_edition_seeds, &TOKEN_METADATA_PROGRAM_ID);

    let collection_details = if sized {
        Some(CollectionDetails::V1 { size: 0 })
    } else {
        None
    };

    let create_metadata_account_ix = create_metadata_accounts_v3(
        TOKEN_METADATA_PROGRAM_ID,
        metadata_account,
        mint.pubkey(),
        funder.pubkey(),
        funder.pubkey(),
        funder.pubkey(),
        data.name,
        data.symbol,
        data.uri,
        data.creators,
        data.seller_fee_basis_points,
        true,
        !immutable,
        None,
        None,
        collection_details,
    );

    let create_master_edition_account_ix = create_master_edition_v3(
        TOKEN_METADATA_PROGRAM_ID,
        master_edition_account,
        mint.pubkey(),
        funder.pubkey(),
        funder.pubkey(),
        metadata_account,
        funder.pubkey(),
        max_supply,
    );

    let mut instructions = vec![
        create_mint_account_ix,
        init_mint_ix,
        create_assoc_account_ix,
        mint_to_ix,
        create_metadata_account_ix,
        create_master_edition_account_ix,
    ];

    if primary_sale_happened {
        let ix = update_metadata_accounts_v2(
            TOKEN_METADATA_PROGRAM_ID,
            metadata_account,
            funder.pubkey(),
            None,
            None,
            Some(true),
            None,
        );
        instructions.push(ix);
    }

    let recent_blockhash = client.get_latest_blockhash()?;
    let tx = Transaction::new_signed_with_payer(
        &instructions,
        Some(&funder.pubkey()),
        &[&funder, &mint],
        recent_blockhash,
    );

    // Send tx with retries.
    let res = retry(
        Exponential::from_millis_with_factor(250, 2.0).take(3),
        || client.send_and_confirm_transaction(&tx),
    );
    let sig = res?;

    Ok((sig, mint.pubkey()))
}

pub fn convert_local_to_remote_data(local: NFTData) -> Result<Data> {
    let creators = match local.creators {
        Some(nft_creators) => Some(
            nft_creators
                .iter()
                .map(convert_creator)
                .collect::<Result<Vec<_>>>()?,
        ),
        _ => None,
    };

    let data = Data {
        name: local.name,
        symbol: local.symbol,
        uri: local.uri,
        seller_fee_basis_points: local.seller_fee_basis_points,
        creators,
    };
    Ok(data)
}
