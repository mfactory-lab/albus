//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct UpdateCredential {
      
              
          pub albus_authority: solana_program::pubkey::Pubkey,
                /// (Optional) Credential issuer.

    
              
          pub issuer: Option<solana_program::pubkey::Pubkey>,
                /// Mint account of the NFT.
/// 

    
              
          pub mint: solana_program::pubkey::Pubkey,
                /// Metadata account of the NFT.

    
              
          pub metadata_account: solana_program::pubkey::Pubkey,
          
              
          pub authority: solana_program::pubkey::Pubkey,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: solana_program::pubkey::Pubkey,
                /// Token Metadata program.
/// 

    
              
          pub metadata_program: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl UpdateCredential {
  pub fn instruction(&self, args: UpdateCredentialInstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: UpdateCredentialInstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(8 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.albus_authority,
            false
          ));
                                                      if let Some(issuer) = self.issuer {
              accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                issuer,
                false,
              ));
            } else {
              accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::ALBUS_ID,
                false,
              ));
            }
                                                    accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.metadata_account,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.authority,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.sysvar_instructions,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.metadata_program,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false
          ));
                      accounts.extend_from_slice(remaining_accounts);
    let mut data = UpdateCredentialInstructionData::new().try_to_vec().unwrap();
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
pub struct UpdateCredentialInstructionData {
            discriminator: [u8; 8],
                  }

impl UpdateCredentialInstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [96, 104, 180, 182, 200, 19, 178, 1],
                                              }
  }
}

impl Default for UpdateCredentialInstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct UpdateCredentialInstructionArgs {
                  pub name: Option<String>,
                pub uri: String,
      }


/// Instruction builder for `UpdateCredential`.
///
/// ### Accounts:
///
                ///   0. `[writable]` albus_authority
                ///   1. `[optional]` issuer
          ///   2. `[]` mint
                ///   3. `[writable]` metadata_account
                      ///   4. `[writable, signer]` authority
                ///   5. `[optional]` sysvar_instructions (default to `Sysvar1nstructions1111111111111111111111111`)
          ///   6. `[]` metadata_program
                ///   7. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct UpdateCredentialBuilder {
            albus_authority: Option<solana_program::pubkey::Pubkey>,
                issuer: Option<solana_program::pubkey::Pubkey>,
                mint: Option<solana_program::pubkey::Pubkey>,
                metadata_account: Option<solana_program::pubkey::Pubkey>,
                authority: Option<solana_program::pubkey::Pubkey>,
                sysvar_instructions: Option<solana_program::pubkey::Pubkey>,
                metadata_program: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        name: Option<String>,
                uri: Option<String>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl UpdateCredentialBuilder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.albus_authority = Some(albus_authority);
                    self
    }
            /// `[optional account]`
/// (Optional) Credential issuer.
#[inline(always)]
    pub fn issuer(&mut self, issuer: Option<solana_program::pubkey::Pubkey>) -> &mut Self {
                        self.issuer = issuer;
                    self
    }
            /// Mint account of the NFT.
/// 
#[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.mint = Some(mint);
                    self
    }
            /// Metadata account of the NFT.
#[inline(always)]
    pub fn metadata_account(&mut self, metadata_account: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.metadata_account = Some(metadata_account);
                    self
    }
            #[inline(always)]
    pub fn authority(&mut self, authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.authority = Some(authority);
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
            /// Token Metadata program.
/// 
#[inline(always)]
    pub fn metadata_program(&mut self, metadata_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.metadata_program = Some(metadata_program);
                    self
    }
            /// `[optional account, default to '11111111111111111111111111111111']`
#[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.system_program = Some(system_program);
                    self
    }
                    /// `[optional argument]`
#[inline(always)]
      pub fn name(&mut self, name: String) -> &mut Self {
        self.name = Some(name);
        self
      }
                #[inline(always)]
      pub fn uri(&mut self, uri: String) -> &mut Self {
        self.uri = Some(uri);
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
    let accounts = UpdateCredential {
                              albus_authority: self.albus_authority.expect("albus_authority is not set"),
                                        issuer: self.issuer,
                                        mint: self.mint.expect("mint is not set"),
                                        metadata_account: self.metadata_account.expect("metadata_account is not set"),
                                        authority: self.authority.expect("authority is not set"),
                                        sysvar_instructions: self.sysvar_instructions.unwrap_or(solana_program::pubkey!("Sysvar1nstructions1111111111111111111111111")),
                                        metadata_program: self.metadata_program.expect("metadata_program is not set"),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = UpdateCredentialInstructionArgs {
                                                              name: self.name.clone(),
                                                                  uri: self.uri.clone().expect("uri is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `update_credential` CPI accounts.
  pub struct UpdateCredentialCpiAccounts<'a, 'b> {
          
                    
              pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                        /// (Optional) Credential issuer.

      
                    
              pub issuer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        /// Mint account of the NFT.
/// 

      
                    
              pub mint: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Metadata account of the NFT.

      
                    
              pub metadata_account: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Instructions sysvar account.
/// 

      
                    
              pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Token Metadata program.
/// 

      
                    
              pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `update_credential` CPI instruction.
pub struct UpdateCredentialCpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                /// (Optional) Credential issuer.

    
              
          pub issuer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                /// Mint account of the NFT.
/// 

    
              
          pub mint: &'b solana_program::account_info::AccountInfo<'a>,
                /// Metadata account of the NFT.

    
              
          pub metadata_account: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                /// Token Metadata program.
/// 

    
              
          pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: UpdateCredentialInstructionArgs,
  }

impl<'a, 'b> UpdateCredentialCpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: UpdateCredentialCpiAccounts<'a, 'b>,
              args: UpdateCredentialInstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              albus_authority: accounts.albus_authority,
              issuer: accounts.issuer,
              mint: accounts.mint,
              metadata_account: accounts.metadata_account,
              authority: accounts.authority,
              sysvar_instructions: accounts.sysvar_instructions,
              metadata_program: accounts.metadata_program,
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
    let mut accounts = Vec::with_capacity(8 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.albus_authority.key,
            false
          ));
                                          if let Some(issuer) = self.issuer {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
              *issuer.key,
              false,
            ));
          } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
              crate::ALBUS_ID,
              false,
            ));
          }
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.metadata_account.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.authority.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.sysvar_instructions.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.metadata_program.key,
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
    let mut data = UpdateCredentialInstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(8 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.albus_authority.clone());
                        if let Some(issuer) = self.issuer {
          account_infos.push(issuer.clone());
        }
                        account_infos.push(self.mint.clone());
                        account_infos.push(self.metadata_account.clone());
                        account_infos.push(self.authority.clone());
                        account_infos.push(self.sysvar_instructions.clone());
                        account_infos.push(self.metadata_program.clone());
                        account_infos.push(self.system_program.clone());
              remaining_accounts.iter().for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

    if signers_seeds.is_empty() {
      solana_program::program::invoke(&instruction, &account_infos)
    } else {
      solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
    }
  }
}

/// Instruction builder for `UpdateCredential` via CPI.
///
/// ### Accounts:
///
                ///   0. `[writable]` albus_authority
                ///   1. `[optional]` issuer
          ///   2. `[]` mint
                ///   3. `[writable]` metadata_account
                      ///   4. `[writable, signer]` authority
          ///   5. `[]` sysvar_instructions
          ///   6. `[]` metadata_program
          ///   7. `[]` system_program
#[derive(Clone, Debug)]
pub struct UpdateCredentialCpiBuilder<'a, 'b> {
  instruction: Box<UpdateCredentialCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> UpdateCredentialCpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(UpdateCredentialCpiBuilderInstruction {
      __program: program,
              albus_authority: None,
              issuer: None,
              mint: None,
              metadata_account: None,
              authority: None,
              sysvar_instructions: None,
              metadata_program: None,
              system_program: None,
                                            name: None,
                                uri: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.albus_authority = Some(albus_authority);
                    self
    }
      /// `[optional account]`
/// (Optional) Credential issuer.
#[inline(always)]
    pub fn issuer(&mut self, issuer: Option<&'b solana_program::account_info::AccountInfo<'a>>) -> &mut Self {
                        self.instruction.issuer = issuer;
                    self
    }
      /// Mint account of the NFT.
/// 
#[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.mint = Some(mint);
                    self
    }
      /// Metadata account of the NFT.
#[inline(always)]
    pub fn metadata_account(&mut self, metadata_account: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.metadata_account = Some(metadata_account);
                    self
    }
      #[inline(always)]
    pub fn authority(&mut self, authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.authority = Some(authority);
                    self
    }
      /// Instructions sysvar account.
/// 
#[inline(always)]
    pub fn sysvar_instructions(&mut self, sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.sysvar_instructions = Some(sysvar_instructions);
                    self
    }
      /// Token Metadata program.
/// 
#[inline(always)]
    pub fn metadata_program(&mut self, metadata_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.metadata_program = Some(metadata_program);
                    self
    }
      #[inline(always)]
    pub fn system_program(&mut self, system_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.system_program = Some(system_program);
                    self
    }
                    /// `[optional argument]`
#[inline(always)]
      pub fn name(&mut self, name: String) -> &mut Self {
        self.instruction.name = Some(name);
        self
      }
                #[inline(always)]
      pub fn uri(&mut self, uri: String) -> &mut Self {
        self.instruction.uri = Some(uri);
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
          let args = UpdateCredentialInstructionArgs {
                                                              name: self.instruction.name.clone(),
                                                                  uri: self.instruction.uri.clone().expect("uri is not set"),
                                    };
        let instruction = UpdateCredentialCpi {
        __program: self.instruction.__program,
                  
          albus_authority: self.instruction.albus_authority.expect("albus_authority is not set"),
                  
          issuer: self.instruction.issuer,
                  
          mint: self.instruction.mint.expect("mint is not set"),
                  
          metadata_account: self.instruction.metadata_account.expect("metadata_account is not set"),
                  
          authority: self.instruction.authority.expect("authority is not set"),
                  
          sysvar_instructions: self.instruction.sysvar_instructions.expect("sysvar_instructions is not set"),
                  
          metadata_program: self.instruction.metadata_program.expect("metadata_program is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct UpdateCredentialCpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            albus_authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                issuer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                metadata_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                sysvar_instructions: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                metadata_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        name: Option<String>,
                uri: Option<String>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

