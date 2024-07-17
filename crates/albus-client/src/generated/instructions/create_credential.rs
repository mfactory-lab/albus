//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

/// Accounts.
pub struct CreateCredential {
      
              
          pub albus_authority: solana_program::pubkey::Pubkey,
                /// Destination token account (required for pNFT).
/// 

    
              
          pub token_account: solana_program::pubkey::Pubkey,
                /// Token record (required for pNFT).
/// 

    
              
          pub token_record: Option<solana_program::pubkey::Pubkey>,
                /// Mint account of the NFT.
/// The account will be initialized if necessary.
/// 
/// Must be a signer if:
/// * the mint account does not exist.
/// 

    
              
          pub mint: solana_program::pubkey::Pubkey,
                /// Metadata account of the NFT.
/// This account must be uninitialized.
/// 

    
              
          pub metadata_account: solana_program::pubkey::Pubkey,
                /// Master edition account of the NFT.
/// The account will be initialized if necessary.
/// 

    
              
          pub edition_account: solana_program::pubkey::Pubkey,
          
              
          pub payer: solana_program::pubkey::Pubkey,
          
              
          pub authority: solana_program::pubkey::Pubkey,
                /// SPL Token program.

    
              
          pub token_program: solana_program::pubkey::Pubkey,
                /// SPL Associated Token program.

    
              
          pub ata_program: solana_program::pubkey::Pubkey,
                /// Token Metadata program.

    
              
          pub metadata_program: solana_program::pubkey::Pubkey,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: solana_program::pubkey::Pubkey,
                /// System program.

    
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl CreateCredential {
  pub fn instruction(&self, args: CreateCredentialInstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: CreateCredentialInstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(13 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.albus_authority,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.token_account,
            false
          ));
                                                      if let Some(token_record) = self.token_record {
              accounts.push(solana_program::instruction::AccountMeta::new(
                token_record,
                false,
              ));
            } else {
              accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::ALBUS_ID,
                false,
              ));
            }
                                                    accounts.push(solana_program::instruction::AccountMeta::new(
            self.mint,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.metadata_account,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.edition_account,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.authority,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.token_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.ata_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.metadata_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.sysvar_instructions,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false
          ));
                      accounts.extend_from_slice(remaining_accounts);
    let mut data = CreateCredentialInstructionData::new().try_to_vec().unwrap();
          let mut args = args.try_to_vec().unwrap();
      data.append(&mut args);
    
    solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    }
  }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CreateCredentialInstructionData {
            discriminator: [u8; 8],
            }

impl CreateCredentialInstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [205, 74, 60, 212, 63, 198, 196, 109],
                                }
  }
}

impl Default for CreateCredentialInstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct CreateCredentialInstructionArgs {
                  pub issuer: Option<Pubkey>,
      }


/// Instruction builder for `CreateCredential`.
///
/// ### Accounts:
///
                ///   0. `[writable]` albus_authority
                ///   1. `[writable]` token_account
                      ///   2. `[writable, optional]` token_record
                      ///   3. `[writable, signer]` mint
                ///   4. `[writable]` metadata_account
                ///   5. `[writable]` edition_account
                      ///   6. `[writable, signer]` payer
                ///   7. `[signer]` authority
                ///   8. `[optional]` token_program (default to `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
                ///   9. `[optional]` ata_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
          ///   10. `[]` metadata_program
                ///   11. `[optional]` sysvar_instructions (default to `Sysvar1nstructions1111111111111111111111111`)
                ///   12. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct CreateCredentialBuilder {
            albus_authority: Option<solana_program::pubkey::Pubkey>,
                token_account: Option<solana_program::pubkey::Pubkey>,
                token_record: Option<solana_program::pubkey::Pubkey>,
                mint: Option<solana_program::pubkey::Pubkey>,
                metadata_account: Option<solana_program::pubkey::Pubkey>,
                edition_account: Option<solana_program::pubkey::Pubkey>,
                payer: Option<solana_program::pubkey::Pubkey>,
                authority: Option<solana_program::pubkey::Pubkey>,
                token_program: Option<solana_program::pubkey::Pubkey>,
                ata_program: Option<solana_program::pubkey::Pubkey>,
                metadata_program: Option<solana_program::pubkey::Pubkey>,
                sysvar_instructions: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        issuer: Option<Pubkey>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CreateCredentialBuilder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.albus_authority = Some(albus_authority);
                    self
    }
            /// Destination token account (required for pNFT).
/// 
#[inline(always)]
    pub fn token_account(&mut self, token_account: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.token_account = Some(token_account);
                    self
    }
            /// `[optional account]`
/// Token record (required for pNFT).
/// 
#[inline(always)]
    pub fn token_record(&mut self, token_record: Option<solana_program::pubkey::Pubkey>) -> &mut Self {
                        self.token_record = token_record;
                    self
    }
            /// Mint account of the NFT.
/// The account will be initialized if necessary.
/// 
/// Must be a signer if:
/// * the mint account does not exist.
/// 
#[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.mint = Some(mint);
                    self
    }
            /// Metadata account of the NFT.
/// This account must be uninitialized.
/// 
#[inline(always)]
    pub fn metadata_account(&mut self, metadata_account: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.metadata_account = Some(metadata_account);
                    self
    }
            /// Master edition account of the NFT.
/// The account will be initialized if necessary.
/// 
#[inline(always)]
    pub fn edition_account(&mut self, edition_account: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.edition_account = Some(edition_account);
                    self
    }
            #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.payer = Some(payer);
                    self
    }
            #[inline(always)]
    pub fn authority(&mut self, authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.authority = Some(authority);
                    self
    }
            /// `[optional account, default to 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']`
/// SPL Token program.
#[inline(always)]
    pub fn token_program(&mut self, token_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.token_program = Some(token_program);
                    self
    }
            /// `[optional account, default to 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL']`
/// SPL Associated Token program.
#[inline(always)]
    pub fn ata_program(&mut self, ata_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.ata_program = Some(ata_program);
                    self
    }
            /// Token Metadata program.
#[inline(always)]
    pub fn metadata_program(&mut self, metadata_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.metadata_program = Some(metadata_program);
                    self
    }
            /// `[optional account, default to 'Sysvar1nstructions1111111111111111111111111']`
/// Instructions sysvar account.
/// 
#[inline(always)]
    pub fn sysvar_instructions(&mut self, sysvar_instructions: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.sysvar_instructions = Some(sysvar_instructions);
                    self
    }
            /// `[optional account, default to '11111111111111111111111111111111']`
/// System program.
#[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.system_program = Some(system_program);
                    self
    }
                    /// `[optional argument]`
#[inline(always)]
      pub fn issuer(&mut self, issuer: Pubkey) -> &mut Self {
        self.issuer = Some(issuer);
        self
      }
        /// Add an aditional account to the instruction.
  #[inline(always)]
  pub fn add_remaining_account(&mut self, account: solana_program::instruction::AccountMeta) -> &mut Self {
    self.__remaining_accounts.push(account);
    self
  }
  /// Add additional accounts to the instruction.
  #[inline(always)]
  pub fn add_remaining_accounts(&mut self, accounts: &[solana_program::instruction::AccountMeta]) -> &mut Self {
    self.__remaining_accounts.extend_from_slice(accounts);
    self
  }
  #[allow(clippy::clone_on_copy)]
  pub fn instruction(&self) -> solana_program::instruction::Instruction {
    let accounts = CreateCredential {
                              albus_authority: self.albus_authority.expect("albus_authority is not set"),
                                        token_account: self.token_account.expect("token_account is not set"),
                                        token_record: self.token_record,
                                        mint: self.mint.expect("mint is not set"),
                                        metadata_account: self.metadata_account.expect("metadata_account is not set"),
                                        edition_account: self.edition_account.expect("edition_account is not set"),
                                        payer: self.payer.expect("payer is not set"),
                                        authority: self.authority.expect("authority is not set"),
                                        token_program: self.token_program.unwrap_or(solana_program::pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")),
                                        ata_program: self.ata_program.unwrap_or(solana_program::pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")),
                                        metadata_program: self.metadata_program.expect("metadata_program is not set"),
                                        sysvar_instructions: self.sysvar_instructions.unwrap_or(solana_program::pubkey!("Sysvar1nstructions1111111111111111111111111")),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = CreateCredentialInstructionArgs {
                                                              issuer: self.issuer.clone(),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `create_credential` CPI accounts.
  pub struct CreateCredentialCpiAccounts<'a, 'b> {
          
                    
              pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Destination token account (required for pNFT).
/// 

      
                    
              pub token_account: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Token record (required for pNFT).
/// 

      
                    
              pub token_record: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        /// Mint account of the NFT.
/// The account will be initialized if necessary.
/// 
/// Must be a signer if:
/// * the mint account does not exist.
/// 

      
                    
              pub mint: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Metadata account of the NFT.
/// This account must be uninitialized.
/// 

      
                    
              pub metadata_account: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Master edition account of the NFT.
/// The account will be initialized if necessary.
/// 

      
                    
              pub edition_account: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub payer: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                        /// SPL Token program.

      
                    
              pub token_program: &'b solana_program::account_info::AccountInfo<'a>,
                        /// SPL Associated Token program.

      
                    
              pub ata_program: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Token Metadata program.

      
                    
              pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Instructions sysvar account.
/// 

      
                    
              pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                        /// System program.

      
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `create_credential` CPI instruction.
pub struct CreateCredentialCpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                /// Destination token account (required for pNFT).
/// 

    
              
          pub token_account: &'b solana_program::account_info::AccountInfo<'a>,
                /// Token record (required for pNFT).
/// 

    
              
          pub token_record: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                /// Mint account of the NFT.
/// The account will be initialized if necessary.
/// 
/// Must be a signer if:
/// * the mint account does not exist.
/// 

    
              
          pub mint: &'b solana_program::account_info::AccountInfo<'a>,
                /// Metadata account of the NFT.
/// This account must be uninitialized.
/// 

    
              
          pub metadata_account: &'b solana_program::account_info::AccountInfo<'a>,
                /// Master edition account of the NFT.
/// The account will be initialized if necessary.
/// 

    
              
          pub edition_account: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub payer: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                /// SPL Token program.

    
              
          pub token_program: &'b solana_program::account_info::AccountInfo<'a>,
                /// SPL Associated Token program.

    
              
          pub ata_program: &'b solana_program::account_info::AccountInfo<'a>,
                /// Token Metadata program.

    
              
          pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                /// System program.

    
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: CreateCredentialInstructionArgs,
  }

impl<'a, 'b> CreateCredentialCpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: CreateCredentialCpiAccounts<'a, 'b>,
              args: CreateCredentialInstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              albus_authority: accounts.albus_authority,
              token_account: accounts.token_account,
              token_record: accounts.token_record,
              mint: accounts.mint,
              metadata_account: accounts.metadata_account,
              edition_account: accounts.edition_account,
              payer: accounts.payer,
              authority: accounts.authority,
              token_program: accounts.token_program,
              ata_program: accounts.ata_program,
              metadata_program: accounts.metadata_program,
              sysvar_instructions: accounts.sysvar_instructions,
              system_program: accounts.system_program,
                    __args: args,
          }
  }
  #[inline(always)]
  pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(&[], &[])
  }
  #[inline(always)]
  pub fn invoke_with_remaining_accounts(&self, remaining_accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(&[], remaining_accounts)
  }
  #[inline(always)]
  pub fn invoke_signed(&self, signers_seeds: &[&[&[u8]]]) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed_with_remaining_accounts(signers_seeds, &[])
  }
  #[allow(clippy::clone_on_copy)]
  #[allow(clippy::vec_init_then_push)]
  pub fn invoke_signed_with_remaining_accounts(
    &self,
    signers_seeds: &[&[&[u8]]],
    remaining_accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]
  ) -> solana_program::entrypoint::ProgramResult {
    let mut accounts = Vec::with_capacity(13 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.albus_authority.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.token_account.key,
            false
          ));
                                          if let Some(token_record) = self.token_record {
            accounts.push(solana_program::instruction::AccountMeta::new(
              *token_record.key,
              false,
            ));
          } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
              crate::ALBUS_ID,
              false,
            ));
          }
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.mint.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.metadata_account.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.edition_account.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.authority.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.token_program.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.ata_program.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.metadata_program.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.sysvar_instructions.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false
          ));
                      remaining_accounts.iter().for_each(|remaining_account| {
      accounts.push(solana_program::instruction::AccountMeta {
          pubkey: *remaining_account.0.key,
          is_signer: remaining_account.1,
          is_writable: remaining_account.2,
      })
    });
    let mut data = CreateCredentialInstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(13 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.albus_authority.clone());
                        account_infos.push(self.token_account.clone());
                        if let Some(token_record) = self.token_record {
          account_infos.push(token_record.clone());
        }
                        account_infos.push(self.mint.clone());
                        account_infos.push(self.metadata_account.clone());
                        account_infos.push(self.edition_account.clone());
                        account_infos.push(self.payer.clone());
                        account_infos.push(self.authority.clone());
                        account_infos.push(self.token_program.clone());
                        account_infos.push(self.ata_program.clone());
                        account_infos.push(self.metadata_program.clone());
                        account_infos.push(self.sysvar_instructions.clone());
                        account_infos.push(self.system_program.clone());
              remaining_accounts.iter().for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

    if signers_seeds.is_empty() {
      solana_program::program::invoke(&instruction, &account_infos)
    } else {
      solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
    }
  }
}

/// Instruction builder for `CreateCredential` via CPI.
///
/// ### Accounts:
///
                ///   0. `[writable]` albus_authority
                ///   1. `[writable]` token_account
                      ///   2. `[writable, optional]` token_record
                      ///   3. `[writable, signer]` mint
                ///   4. `[writable]` metadata_account
                ///   5. `[writable]` edition_account
                      ///   6. `[writable, signer]` payer
                ///   7. `[signer]` authority
          ///   8. `[]` token_program
          ///   9. `[]` ata_program
          ///   10. `[]` metadata_program
          ///   11. `[]` sysvar_instructions
          ///   12. `[]` system_program
#[derive(Clone, Debug)]
pub struct CreateCredentialCpiBuilder<'a, 'b> {
  instruction: Box<CreateCredentialCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CreateCredentialCpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(CreateCredentialCpiBuilderInstruction {
      __program: program,
              albus_authority: None,
              token_account: None,
              token_record: None,
              mint: None,
              metadata_account: None,
              edition_account: None,
              payer: None,
              authority: None,
              token_program: None,
              ata_program: None,
              metadata_program: None,
              sysvar_instructions: None,
              system_program: None,
                                            issuer: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.albus_authority = Some(albus_authority);
                    self
    }
      /// Destination token account (required for pNFT).
/// 
#[inline(always)]
    pub fn token_account(&mut self, token_account: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.token_account = Some(token_account);
                    self
    }
      /// `[optional account]`
/// Token record (required for pNFT).
/// 
#[inline(always)]
    pub fn token_record(&mut self, token_record: Option<&'b solana_program::account_info::AccountInfo<'a>>) -> &mut Self {
                        self.instruction.token_record = token_record;
                    self
    }
      /// Mint account of the NFT.
/// The account will be initialized if necessary.
/// 
/// Must be a signer if:
/// * the mint account does not exist.
/// 
#[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.mint = Some(mint);
                    self
    }
      /// Metadata account of the NFT.
/// This account must be uninitialized.
/// 
#[inline(always)]
    pub fn metadata_account(&mut self, metadata_account: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.metadata_account = Some(metadata_account);
                    self
    }
      /// Master edition account of the NFT.
/// The account will be initialized if necessary.
/// 
#[inline(always)]
    pub fn edition_account(&mut self, edition_account: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.edition_account = Some(edition_account);
                    self
    }
      #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.payer = Some(payer);
                    self
    }
      #[inline(always)]
    pub fn authority(&mut self, authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.authority = Some(authority);
                    self
    }
      /// SPL Token program.
#[inline(always)]
    pub fn token_program(&mut self, token_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.token_program = Some(token_program);
                    self
    }
      /// SPL Associated Token program.
#[inline(always)]
    pub fn ata_program(&mut self, ata_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.ata_program = Some(ata_program);
                    self
    }
      /// Token Metadata program.
#[inline(always)]
    pub fn metadata_program(&mut self, metadata_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.metadata_program = Some(metadata_program);
                    self
    }
      /// Instructions sysvar account.
/// 
#[inline(always)]
    pub fn sysvar_instructions(&mut self, sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.sysvar_instructions = Some(sysvar_instructions);
                    self
    }
      /// System program.
#[inline(always)]
    pub fn system_program(&mut self, system_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.system_program = Some(system_program);
                    self
    }
                    /// `[optional argument]`
#[inline(always)]
      pub fn issuer(&mut self, issuer: Pubkey) -> &mut Self {
        self.instruction.issuer = Some(issuer);
        self
      }
        /// Add an additional account to the instruction.
  #[inline(always)]
  pub fn add_remaining_account(&mut self, account: &'b solana_program::account_info::AccountInfo<'a>, is_writable: bool, is_signer: bool) -> &mut Self {
    self.instruction.__remaining_accounts.push((account, is_writable, is_signer));
    self
  }
  /// Add additional accounts to the instruction.
  ///
  /// Each account is represented by a tuple of the `AccountInfo`, a `bool` indicating whether the account is writable or not,
  /// and a `bool` indicating whether the account is a signer or not.
  #[inline(always)]
  pub fn add_remaining_accounts(&mut self, accounts: &[(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)]) -> &mut Self {
    self.instruction.__remaining_accounts.extend_from_slice(accounts);
    self
  }
  #[inline(always)]
  pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
    self.invoke_signed(&[])
  }
  #[allow(clippy::clone_on_copy)]
  #[allow(clippy::vec_init_then_push)]
  pub fn invoke_signed(&self, signers_seeds: &[&[&[u8]]]) -> solana_program::entrypoint::ProgramResult {
          let args = CreateCredentialInstructionArgs {
                                                              issuer: self.instruction.issuer.clone(),
                                    };
        let instruction = CreateCredentialCpi {
        __program: self.instruction.__program,
                  
          albus_authority: self.instruction.albus_authority.expect("albus_authority is not set"),
                  
          token_account: self.instruction.token_account.expect("token_account is not set"),
                  
          token_record: self.instruction.token_record,
                  
          mint: self.instruction.mint.expect("mint is not set"),
                  
          metadata_account: self.instruction.metadata_account.expect("metadata_account is not set"),
                  
          edition_account: self.instruction.edition_account.expect("edition_account is not set"),
                  
          payer: self.instruction.payer.expect("payer is not set"),
                  
          authority: self.instruction.authority.expect("authority is not set"),
                  
          token_program: self.instruction.token_program.expect("token_program is not set"),
                  
          ata_program: self.instruction.ata_program.expect("ata_program is not set"),
                  
          metadata_program: self.instruction.metadata_program.expect("metadata_program is not set"),
                  
          sysvar_instructions: self.instruction.sysvar_instructions.expect("sysvar_instructions is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct CreateCredentialCpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            albus_authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                token_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                token_record: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                metadata_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                edition_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                ata_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                metadata_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                sysvar_instructions: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        issuer: Option<Pubkey>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

