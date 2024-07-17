//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct RequestCredential {
      
              
          pub credential_request: solana_program::pubkey::Pubkey,
          
              
          pub credential_spec: solana_program::pubkey::Pubkey,
                /// Mint account of the NFT.
/// 

    
              
          pub credential_mint: solana_program::pubkey::Pubkey,
          
              
          pub credential_metadata: solana_program::pubkey::Pubkey,
          
              
          pub credential_token: solana_program::pubkey::Pubkey,
          
              
          pub credential_owner: solana_program::pubkey::Pubkey,
          
              
          pub issuer: solana_program::pubkey::Pubkey,
          
              
          pub authority: solana_program::pubkey::Pubkey,
          
              
          pub albus_authority: solana_program::pubkey::Pubkey,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: solana_program::pubkey::Pubkey,
                /// Token Metadata program.
/// 

    
              
          pub metadata_program: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl RequestCredential {
  pub fn instruction(&self, args: RequestCredentialInstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: RequestCredentialInstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(12 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.credential_request,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.credential_spec,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.credential_mint,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.credential_metadata,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.credential_token,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.credential_owner,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.issuer,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.authority,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.albus_authority,
            false
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
    let mut data = RequestCredentialInstructionData::new().try_to_vec().unwrap();
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
pub struct RequestCredentialInstructionData {
            discriminator: [u8; 8],
            }

impl RequestCredentialInstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [250, 55, 225, 61, 98, 70, 116, 139],
                                }
  }
}

impl Default for RequestCredentialInstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct RequestCredentialInstructionArgs {
                  pub uri: String,
      }


/// Instruction builder for `RequestCredential`.
///
/// ### Accounts:
///
                ///   0. `[writable]` credential_request
                ///   1. `[writable]` credential_spec
          ///   2. `[]` credential_mint
                ///   3. `[writable]` credential_metadata
          ///   4. `[]` credential_token
                ///   5. `[signer]` credential_owner
          ///   6. `[]` issuer
                      ///   7. `[writable, signer]` authority
                ///   8. `[writable]` albus_authority
                ///   9. `[optional]` sysvar_instructions (default to `Sysvar1nstructions1111111111111111111111111`)
          ///   10. `[]` metadata_program
                ///   11. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct RequestCredentialBuilder {
            credential_request: Option<solana_program::pubkey::Pubkey>,
                credential_spec: Option<solana_program::pubkey::Pubkey>,
                credential_mint: Option<solana_program::pubkey::Pubkey>,
                credential_metadata: Option<solana_program::pubkey::Pubkey>,
                credential_token: Option<solana_program::pubkey::Pubkey>,
                credential_owner: Option<solana_program::pubkey::Pubkey>,
                issuer: Option<solana_program::pubkey::Pubkey>,
                authority: Option<solana_program::pubkey::Pubkey>,
                albus_authority: Option<solana_program::pubkey::Pubkey>,
                sysvar_instructions: Option<solana_program::pubkey::Pubkey>,
                metadata_program: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        uri: Option<String>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl RequestCredentialBuilder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn credential_request(&mut self, credential_request: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_request = Some(credential_request);
                    self
    }
            #[inline(always)]
    pub fn credential_spec(&mut self, credential_spec: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_spec = Some(credential_spec);
                    self
    }
            /// Mint account of the NFT.
/// 
#[inline(always)]
    pub fn credential_mint(&mut self, credential_mint: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_mint = Some(credential_mint);
                    self
    }
            #[inline(always)]
    pub fn credential_metadata(&mut self, credential_metadata: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_metadata = Some(credential_metadata);
                    self
    }
            #[inline(always)]
    pub fn credential_token(&mut self, credential_token: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_token = Some(credential_token);
                    self
    }
            #[inline(always)]
    pub fn credential_owner(&mut self, credential_owner: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.credential_owner = Some(credential_owner);
                    self
    }
            #[inline(always)]
    pub fn issuer(&mut self, issuer: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.issuer = Some(issuer);
                    self
    }
            #[inline(always)]
    pub fn authority(&mut self, authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.authority = Some(authority);
                    self
    }
            #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.albus_authority = Some(albus_authority);
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
    let accounts = RequestCredential {
                              credential_request: self.credential_request.expect("credential_request is not set"),
                                        credential_spec: self.credential_spec.expect("credential_spec is not set"),
                                        credential_mint: self.credential_mint.expect("credential_mint is not set"),
                                        credential_metadata: self.credential_metadata.expect("credential_metadata is not set"),
                                        credential_token: self.credential_token.expect("credential_token is not set"),
                                        credential_owner: self.credential_owner.expect("credential_owner is not set"),
                                        issuer: self.issuer.expect("issuer is not set"),
                                        authority: self.authority.expect("authority is not set"),
                                        albus_authority: self.albus_authority.expect("albus_authority is not set"),
                                        sysvar_instructions: self.sysvar_instructions.unwrap_or(solana_program::pubkey!("Sysvar1nstructions1111111111111111111111111")),
                                        metadata_program: self.metadata_program.expect("metadata_program is not set"),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = RequestCredentialInstructionArgs {
                                                              uri: self.uri.clone().expect("uri is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `request_credential` CPI accounts.
  pub struct RequestCredentialCpiAccounts<'a, 'b> {
          
                    
              pub credential_request: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub credential_spec: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Mint account of the NFT.
/// 

      
                    
              pub credential_mint: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub credential_metadata: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub credential_token: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub credential_owner: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub issuer: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Instructions sysvar account.
/// 

      
                    
              pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                        /// Token Metadata program.
/// 

      
                    
              pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `request_credential` CPI instruction.
pub struct RequestCredentialCpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub credential_request: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub credential_spec: &'b solana_program::account_info::AccountInfo<'a>,
                /// Mint account of the NFT.
/// 

    
              
          pub credential_mint: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub credential_metadata: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub credential_token: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub credential_owner: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub issuer: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub authority: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub albus_authority: &'b solana_program::account_info::AccountInfo<'a>,
                /// Instructions sysvar account.
/// 

    
              
          pub sysvar_instructions: &'b solana_program::account_info::AccountInfo<'a>,
                /// Token Metadata program.
/// 

    
              
          pub metadata_program: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: RequestCredentialInstructionArgs,
  }

impl<'a, 'b> RequestCredentialCpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: RequestCredentialCpiAccounts<'a, 'b>,
              args: RequestCredentialInstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              credential_request: accounts.credential_request,
              credential_spec: accounts.credential_spec,
              credential_mint: accounts.credential_mint,
              credential_metadata: accounts.credential_metadata,
              credential_token: accounts.credential_token,
              credential_owner: accounts.credential_owner,
              issuer: accounts.issuer,
              authority: accounts.authority,
              albus_authority: accounts.albus_authority,
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
    let mut accounts = Vec::with_capacity(12 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.credential_request.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.credential_spec.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.credential_mint.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.credential_metadata.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.credential_token.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.credential_owner.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.issuer.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.authority.key,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.albus_authority.key,
            false
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
    let mut data = RequestCredentialInstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(12 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.credential_request.clone());
                        account_infos.push(self.credential_spec.clone());
                        account_infos.push(self.credential_mint.clone());
                        account_infos.push(self.credential_metadata.clone());
                        account_infos.push(self.credential_token.clone());
                        account_infos.push(self.credential_owner.clone());
                        account_infos.push(self.issuer.clone());
                        account_infos.push(self.authority.clone());
                        account_infos.push(self.albus_authority.clone());
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

/// Instruction builder for `RequestCredential` via CPI.
///
/// ### Accounts:
///
                ///   0. `[writable]` credential_request
                ///   1. `[writable]` credential_spec
          ///   2. `[]` credential_mint
                ///   3. `[writable]` credential_metadata
          ///   4. `[]` credential_token
                ///   5. `[signer]` credential_owner
          ///   6. `[]` issuer
                      ///   7. `[writable, signer]` authority
                ///   8. `[writable]` albus_authority
          ///   9. `[]` sysvar_instructions
          ///   10. `[]` metadata_program
          ///   11. `[]` system_program
#[derive(Clone, Debug)]
pub struct RequestCredentialCpiBuilder<'a, 'b> {
  instruction: Box<RequestCredentialCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> RequestCredentialCpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(RequestCredentialCpiBuilderInstruction {
      __program: program,
              credential_request: None,
              credential_spec: None,
              credential_mint: None,
              credential_metadata: None,
              credential_token: None,
              credential_owner: None,
              issuer: None,
              authority: None,
              albus_authority: None,
              sysvar_instructions: None,
              metadata_program: None,
              system_program: None,
                                            uri: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn credential_request(&mut self, credential_request: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_request = Some(credential_request);
                    self
    }
      #[inline(always)]
    pub fn credential_spec(&mut self, credential_spec: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_spec = Some(credential_spec);
                    self
    }
      /// Mint account of the NFT.
/// 
#[inline(always)]
    pub fn credential_mint(&mut self, credential_mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_mint = Some(credential_mint);
                    self
    }
      #[inline(always)]
    pub fn credential_metadata(&mut self, credential_metadata: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_metadata = Some(credential_metadata);
                    self
    }
      #[inline(always)]
    pub fn credential_token(&mut self, credential_token: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_token = Some(credential_token);
                    self
    }
      #[inline(always)]
    pub fn credential_owner(&mut self, credential_owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.credential_owner = Some(credential_owner);
                    self
    }
      #[inline(always)]
    pub fn issuer(&mut self, issuer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.issuer = Some(issuer);
                    self
    }
      #[inline(always)]
    pub fn authority(&mut self, authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.authority = Some(authority);
                    self
    }
      #[inline(always)]
    pub fn albus_authority(&mut self, albus_authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.albus_authority = Some(albus_authority);
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
          let args = RequestCredentialInstructionArgs {
                                                              uri: self.instruction.uri.clone().expect("uri is not set"),
                                    };
        let instruction = RequestCredentialCpi {
        __program: self.instruction.__program,
                  
          credential_request: self.instruction.credential_request.expect("credential_request is not set"),
                  
          credential_spec: self.instruction.credential_spec.expect("credential_spec is not set"),
                  
          credential_mint: self.instruction.credential_mint.expect("credential_mint is not set"),
                  
          credential_metadata: self.instruction.credential_metadata.expect("credential_metadata is not set"),
                  
          credential_token: self.instruction.credential_token.expect("credential_token is not set"),
                  
          credential_owner: self.instruction.credential_owner.expect("credential_owner is not set"),
                  
          issuer: self.instruction.issuer.expect("issuer is not set"),
                  
          authority: self.instruction.authority.expect("authority is not set"),
                  
          albus_authority: self.instruction.albus_authority.expect("albus_authority is not set"),
                  
          sysvar_instructions: self.instruction.sysvar_instructions.expect("sysvar_instructions is not set"),
                  
          metadata_program: self.instruction.metadata_program.expect("metadata_program is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct RequestCredentialCpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            credential_request: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                credential_spec: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                credential_mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                credential_metadata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                credential_token: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                credential_owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                issuer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                albus_authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                sysvar_instructions: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                metadata_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        uri: Option<String>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

