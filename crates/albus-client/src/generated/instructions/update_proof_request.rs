//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use crate::generated::types::ProofRequestStatus;

/// Accounts.
pub struct UpdateProofRequest {
      
              
          pub proof_request: solana_program::pubkey::Pubkey,
          
              
          pub authority: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl UpdateProofRequest {
  pub fn instruction(&self, args: UpdateProofRequestInstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: UpdateProofRequestInstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(3 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.proof_request,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            self.authority,
            true
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false
          ));
                      accounts.extend_from_slice(remaining_accounts);
    let mut data = UpdateProofRequestInstructionData::new().try_to_vec().unwrap();
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
pub struct UpdateProofRequestInstructionData {
            discriminator: [u8; 8],
            }

impl UpdateProofRequestInstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [248, 138, 24, 233, 171, 52, 72, 43],
                                }
  }
}

impl Default for UpdateProofRequestInstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct UpdateProofRequestInstructionArgs {
                  pub status: ProofRequestStatus,
      }


/// Instruction builder for `UpdateProofRequest`.
///
/// ### Accounts:
///
                ///   0. `[writable]` proof_request
                      ///   1. `[writable, signer]` authority
                ///   2. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct UpdateProofRequestBuilder {
            proof_request: Option<solana_program::pubkey::Pubkey>,
                authority: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        status: Option<ProofRequestStatus>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl UpdateProofRequestBuilder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn proof_request(&mut self, proof_request: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.proof_request = Some(proof_request);
                    self
    }
            #[inline(always)]
    pub fn authority(&mut self, authority: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.authority = Some(authority);
                    self
    }
            /// `[optional account, default to '11111111111111111111111111111111']`
#[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn status(&mut self, status: ProofRequestStatus) -> &mut Self {
        self.status = Some(status);
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
    let accounts = UpdateProofRequest {
                              proof_request: self.proof_request.expect("proof_request is not set"),
                                        authority: self.authority.expect("authority is not set"),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = UpdateProofRequestInstructionArgs {
                                                              status: self.status.clone().expect("status is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `update_proof_request` CPI accounts.
  pub struct UpdateProofRequestCpiAccounts<'a, 'b> {
          
                    
              pub proof_request: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `update_proof_request` CPI instruction.
pub struct UpdateProofRequestCpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub proof_request: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub authority: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: UpdateProofRequestInstructionArgs,
  }

impl<'a, 'b> UpdateProofRequestCpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: UpdateProofRequestCpiAccounts<'a, 'b>,
              args: UpdateProofRequestInstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              proof_request: accounts.proof_request,
              authority: accounts.authority,
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
    let mut accounts = Vec::with_capacity(3 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            *self.proof_request.key,
            false
          ));
                                          accounts.push(solana_program::instruction::AccountMeta::new(
            *self.authority.key,
            true
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
    let mut data = UpdateProofRequestInstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(3 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.proof_request.clone());
                        account_infos.push(self.authority.clone());
                        account_infos.push(self.system_program.clone());
              remaining_accounts.iter().for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

    if signers_seeds.is_empty() {
      solana_program::program::invoke(&instruction, &account_infos)
    } else {
      solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
    }
  }
}

/// Instruction builder for `UpdateProofRequest` via CPI.
///
/// ### Accounts:
///
                ///   0. `[writable]` proof_request
                      ///   1. `[writable, signer]` authority
          ///   2. `[]` system_program
#[derive(Clone, Debug)]
pub struct UpdateProofRequestCpiBuilder<'a, 'b> {
  instruction: Box<UpdateProofRequestCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> UpdateProofRequestCpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(UpdateProofRequestCpiBuilderInstruction {
      __program: program,
              proof_request: None,
              authority: None,
              system_program: None,
                                            status: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn proof_request(&mut self, proof_request: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.proof_request = Some(proof_request);
                    self
    }
      #[inline(always)]
    pub fn authority(&mut self, authority: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.authority = Some(authority);
                    self
    }
      #[inline(always)]
    pub fn system_program(&mut self, system_program: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.system_program = Some(system_program);
                    self
    }
                    #[inline(always)]
      pub fn status(&mut self, status: ProofRequestStatus) -> &mut Self {
        self.instruction.status = Some(status);
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
          let args = UpdateProofRequestInstructionArgs {
                                                              status: self.instruction.status.clone().expect("status is not set"),
                                    };
        let instruction = UpdateProofRequestCpi {
        __program: self.instruction.__program,
                  
          proof_request: self.instruction.proof_request.expect("proof_request is not set"),
                  
          authority: self.instruction.authority.expect("authority is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct UpdateProofRequestCpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            proof_request: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        status: Option<ProofRequestStatus>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

