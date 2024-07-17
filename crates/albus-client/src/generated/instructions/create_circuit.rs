//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct CreateCircuit {
      
              
          pub circuit: solana_program::pubkey::Pubkey,
          
              
          pub authority: solana_program::pubkey::Pubkey,
          
              
          pub system_program: solana_program::pubkey::Pubkey,
      }

impl CreateCircuit {
  pub fn instruction(&self, args: CreateCircuitInstructionArgs) -> solana_program::instruction::Instruction {
    self.instruction_with_remaining_accounts(args, &[])
  }
  #[allow(clippy::vec_init_then_push)]
  pub fn instruction_with_remaining_accounts(&self, args: CreateCircuitInstructionArgs, remaining_accounts: &[solana_program::instruction::AccountMeta]) -> solana_program::instruction::Instruction {
    let mut accounts = Vec::with_capacity(3 + remaining_accounts.len());
                            accounts.push(solana_program::instruction::AccountMeta::new(
            self.circuit,
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
    let mut data = CreateCircuitInstructionData::new().try_to_vec().unwrap();
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
pub struct CreateCircuitInstructionData {
            discriminator: [u8; 8],
                                                      }

impl CreateCircuitInstructionData {
  pub fn new() -> Self {
    Self {
                        discriminator: [35, 7, 152, 132, 75, 65, 176, 162],
                                                                                                                                  }
  }
}

impl Default for CreateCircuitInstructionData {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct CreateCircuitInstructionArgs {
                  pub code: String,
                pub name: String,
                pub description: String,
                pub wasm_uri: String,
                pub zkey_uri: String,
                pub outputs: Vec<String>,
                pub public_signals: Vec<String>,
                pub private_signals: Vec<String>,
      }


/// Instruction builder for `CreateCircuit`.
///
/// ### Accounts:
///
                ///   0. `[writable]` circuit
                      ///   1. `[writable, signer]` authority
                ///   2. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Clone, Debug, Default)]
pub struct CreateCircuitBuilder {
            circuit: Option<solana_program::pubkey::Pubkey>,
                authority: Option<solana_program::pubkey::Pubkey>,
                system_program: Option<solana_program::pubkey::Pubkey>,
                        code: Option<String>,
                name: Option<String>,
                description: Option<String>,
                wasm_uri: Option<String>,
                zkey_uri: Option<String>,
                outputs: Option<Vec<String>>,
                public_signals: Option<Vec<String>>,
                private_signals: Option<Vec<String>>,
        __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CreateCircuitBuilder {
  pub fn new() -> Self {
    Self::default()
  }
            #[inline(always)]
    pub fn circuit(&mut self, circuit: solana_program::pubkey::Pubkey) -> &mut Self {
                        self.circuit = Some(circuit);
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
      pub fn code(&mut self, code: String) -> &mut Self {
        self.code = Some(code);
        self
      }
                #[inline(always)]
      pub fn name(&mut self, name: String) -> &mut Self {
        self.name = Some(name);
        self
      }
                #[inline(always)]
      pub fn description(&mut self, description: String) -> &mut Self {
        self.description = Some(description);
        self
      }
                #[inline(always)]
      pub fn wasm_uri(&mut self, wasm_uri: String) -> &mut Self {
        self.wasm_uri = Some(wasm_uri);
        self
      }
                #[inline(always)]
      pub fn zkey_uri(&mut self, zkey_uri: String) -> &mut Self {
        self.zkey_uri = Some(zkey_uri);
        self
      }
                #[inline(always)]
      pub fn outputs(&mut self, outputs: Vec<String>) -> &mut Self {
        self.outputs = Some(outputs);
        self
      }
                #[inline(always)]
      pub fn public_signals(&mut self, public_signals: Vec<String>) -> &mut Self {
        self.public_signals = Some(public_signals);
        self
      }
                #[inline(always)]
      pub fn private_signals(&mut self, private_signals: Vec<String>) -> &mut Self {
        self.private_signals = Some(private_signals);
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
    let accounts = CreateCircuit {
                              circuit: self.circuit.expect("circuit is not set"),
                                        authority: self.authority.expect("authority is not set"),
                                        system_program: self.system_program.unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
                      };
          let args = CreateCircuitInstructionArgs {
                                                              code: self.code.clone().expect("code is not set"),
                                                                  name: self.name.clone().expect("name is not set"),
                                                                  description: self.description.clone().expect("description is not set"),
                                                                  wasm_uri: self.wasm_uri.clone().expect("wasm_uri is not set"),
                                                                  zkey_uri: self.zkey_uri.clone().expect("zkey_uri is not set"),
                                                                  outputs: self.outputs.clone().expect("outputs is not set"),
                                                                  public_signals: self.public_signals.clone().expect("public_signals is not set"),
                                                                  private_signals: self.private_signals.clone().expect("private_signals is not set"),
                                    };
    
    accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
  }
}

  /// `create_circuit` CPI accounts.
  pub struct CreateCircuitCpiAccounts<'a, 'b> {
          
                    
              pub circuit: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub authority: &'b solana_program::account_info::AccountInfo<'a>,
                
                    
              pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            }

/// `create_circuit` CPI instruction.
pub struct CreateCircuitCpi<'a, 'b> {
  /// The program to invoke.
  pub __program: &'b solana_program::account_info::AccountInfo<'a>,
      
              
          pub circuit: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub authority: &'b solana_program::account_info::AccountInfo<'a>,
          
              
          pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
            /// The arguments for the instruction.
    pub __args: CreateCircuitInstructionArgs,
  }

impl<'a, 'b> CreateCircuitCpi<'a, 'b> {
  pub fn new(
    program: &'b solana_program::account_info::AccountInfo<'a>,
          accounts: CreateCircuitCpiAccounts<'a, 'b>,
              args: CreateCircuitInstructionArgs,
      ) -> Self {
    Self {
      __program: program,
              circuit: accounts.circuit,
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
            *self.circuit.key,
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
    let mut data = CreateCircuitInstructionData::new().try_to_vec().unwrap();
          let mut args = self.__args.try_to_vec().unwrap();
      data.append(&mut args);
    
    let instruction = solana_program::instruction::Instruction {
      program_id: crate::ALBUS_ID,
      accounts,
      data,
    };
    let mut account_infos = Vec::with_capacity(3 + 1 + remaining_accounts.len());
    account_infos.push(self.__program.clone());
                  account_infos.push(self.circuit.clone());
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

/// Instruction builder for `CreateCircuit` via CPI.
///
/// ### Accounts:
///
                ///   0. `[writable]` circuit
                      ///   1. `[writable, signer]` authority
          ///   2. `[]` system_program
#[derive(Clone, Debug)]
pub struct CreateCircuitCpiBuilder<'a, 'b> {
  instruction: Box<CreateCircuitCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CreateCircuitCpiBuilder<'a, 'b> {
  pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
    let instruction = Box::new(CreateCircuitCpiBuilderInstruction {
      __program: program,
              circuit: None,
              authority: None,
              system_program: None,
                                            code: None,
                                name: None,
                                description: None,
                                wasm_uri: None,
                                zkey_uri: None,
                                outputs: None,
                                public_signals: None,
                                private_signals: None,
                    __remaining_accounts: Vec::new(),
    });
    Self { instruction }
  }
      #[inline(always)]
    pub fn circuit(&mut self, circuit: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
                        self.instruction.circuit = Some(circuit);
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
      pub fn code(&mut self, code: String) -> &mut Self {
        self.instruction.code = Some(code);
        self
      }
                #[inline(always)]
      pub fn name(&mut self, name: String) -> &mut Self {
        self.instruction.name = Some(name);
        self
      }
                #[inline(always)]
      pub fn description(&mut self, description: String) -> &mut Self {
        self.instruction.description = Some(description);
        self
      }
                #[inline(always)]
      pub fn wasm_uri(&mut self, wasm_uri: String) -> &mut Self {
        self.instruction.wasm_uri = Some(wasm_uri);
        self
      }
                #[inline(always)]
      pub fn zkey_uri(&mut self, zkey_uri: String) -> &mut Self {
        self.instruction.zkey_uri = Some(zkey_uri);
        self
      }
                #[inline(always)]
      pub fn outputs(&mut self, outputs: Vec<String>) -> &mut Self {
        self.instruction.outputs = Some(outputs);
        self
      }
                #[inline(always)]
      pub fn public_signals(&mut self, public_signals: Vec<String>) -> &mut Self {
        self.instruction.public_signals = Some(public_signals);
        self
      }
                #[inline(always)]
      pub fn private_signals(&mut self, private_signals: Vec<String>) -> &mut Self {
        self.instruction.private_signals = Some(private_signals);
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
          let args = CreateCircuitInstructionArgs {
                                                              code: self.instruction.code.clone().expect("code is not set"),
                                                                  name: self.instruction.name.clone().expect("name is not set"),
                                                                  description: self.instruction.description.clone().expect("description is not set"),
                                                                  wasm_uri: self.instruction.wasm_uri.clone().expect("wasm_uri is not set"),
                                                                  zkey_uri: self.instruction.zkey_uri.clone().expect("zkey_uri is not set"),
                                                                  outputs: self.instruction.outputs.clone().expect("outputs is not set"),
                                                                  public_signals: self.instruction.public_signals.clone().expect("public_signals is not set"),
                                                                  private_signals: self.instruction.private_signals.clone().expect("private_signals is not set"),
                                    };
        let instruction = CreateCircuitCpi {
        __program: self.instruction.__program,
                  
          circuit: self.instruction.circuit.expect("circuit is not set"),
                  
          authority: self.instruction.authority.expect("authority is not set"),
                  
          system_program: self.instruction.system_program.expect("system_program is not set"),
                          __args: args,
            };
    instruction.invoke_signed_with_remaining_accounts(signers_seeds, &self.instruction.__remaining_accounts)
  }
}

#[derive(Clone, Debug)]
struct CreateCircuitCpiBuilderInstruction<'a, 'b> {
  __program: &'b solana_program::account_info::AccountInfo<'a>,
            circuit: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
                        code: Option<String>,
                name: Option<String>,
                description: Option<String>,
                wasm_uri: Option<String>,
                zkey_uri: Option<String>,
                outputs: Option<Vec<String>>,
                public_signals: Option<Vec<String>>,
                private_signals: Option<Vec<String>>,
        /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
  __remaining_accounts: Vec<(&'b solana_program::account_info::AccountInfo<'a>, bool, bool)>,
}

