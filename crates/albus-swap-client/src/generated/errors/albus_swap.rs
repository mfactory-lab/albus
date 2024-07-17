//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use num_derive::FromPrimitive;
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum AlbusSwapError {
    /// 6000 - Swap account already in use
    #[error("Swap account already in use")]
    AlreadyInUse = 0x1770,
    /// 6001 - Invalid program address generated from bump seed and key
    #[error("Invalid program address generated from bump seed and key")]
    InvalidProgramAddress = 0x1771,
    /// 6002 - Input account owner is not the program address
    #[error("Input account owner is not the program address")]
    InvalidOwner = 0x1772,
    /// 6003 - Output pool account owner cannot be the program address
    #[error("Output pool account owner cannot be the program address")]
    InvalidOutputOwner = 0x1773,
    /// 6004 - Deserialized account is not an SPL Token mint
    #[error("Deserialized account is not an SPL Token mint")]
    ExpectedMint = 0x1774,
    /// 6005 - Deserialized account is not an SPL Token account
    #[error("Deserialized account is not an SPL Token account")]
    ExpectedAccount = 0x1775,
    /// 6006 - Input token account empty
    #[error("Input token account empty")]
    EmptySupply = 0x1776,
    /// 6007 - Pool token mint has a non-zero supply
    #[error("Pool token mint has a non-zero supply")]
    InvalidSupply = 0x1777,
    /// 6008 - Token account has a delegate
    #[error("Token account has a delegate")]
    InvalidDelegate = 0x1778,
    /// 6009 - InvalidInput
    #[error("InvalidInput")]
    InvalidInput = 0x1779,
    /// 6010 - Address of the provided swap token account is incorrect
    #[error("Address of the provided swap token account is incorrect")]
    IncorrectSwapAccount = 0x177A,
    /// 6011 - Address of the provided pool token mint is incorrect
    #[error("Address of the provided pool token mint is incorrect")]
    IncorrectPoolMint = 0x177B,
    /// 6012 - InvalidOutput
    #[error("InvalidOutput")]
    InvalidOutput = 0x177C,
    /// 6013 - General calculation failure due to overflow or underflow
    #[error("General calculation failure due to overflow or underflow")]
    CalculationFailure = 0x177D,
    /// 6014 - Invalid instruction
    #[error("Invalid instruction")]
    InvalidInstruction = 0x177E,
    /// 6015 - Swap input token accounts have the same mint
    #[error("Swap input token accounts have the same mint")]
    RepeatedMint = 0x177F,
    /// 6016 - Swap instruction exceeds desired slippage limit
    #[error("Swap instruction exceeds desired slippage limit")]
    ExceededSlippage = 0x1780,
    /// 6017 - Token account has a close authority
    #[error("Token account has a close authority")]
    InvalidCloseAuthority = 0x1781,
    /// 6018 - Pool token mint has a freeze authority
    #[error("Pool token mint has a freeze authority")]
    InvalidFreezeAuthority = 0x1782,
    /// 6019 - Pool fee token account incorrect
    #[error("Pool fee token account incorrect")]
    IncorrectFeeAccount = 0x1783,
    /// 6020 - Given pool token amount results in zero trading tokens
    #[error("Given pool token amount results in zero trading tokens")]
    ZeroTradingTokens = 0x1784,
    /// 6021 - Fee calculation failed due to overflow, underflow, or unexpected 0
    #[error("Fee calculation failed due to overflow, underflow, or unexpected 0")]
    FeeCalculationFailure = 0x1785,
    /// 6022 - Conversion to u64/u128 failed with an overflow or underflow
    #[error("Conversion to u64/u128 failed with an overflow or underflow")]
    ConversionFailure = 0x1786,
    /// 6023 - The provided fee does not match the program owner's constraints
    #[error("The provided fee does not match the program owner's constraints")]
    InvalidFee = 0x1787,
    /// 6024 - The provided token program does not match the token program expected by the swap
    #[error("The provided token program does not match the token program expected by the swap")]
    IncorrectTokenProgramId = 0x1788,
    /// 6025 - The provided curve type is not supported by the program owner
    #[error("The provided curve type is not supported by the program owner")]
    UnsupportedCurveType = 0x1789,
    /// 6026 - The provided curve parameters are invalid
    #[error("The provided curve parameters are invalid")]
    InvalidCurve = 0x178A,
    /// 6027 - The operation cannot be performed on the given curve
    #[error("The operation cannot be performed on the given curve")]
    UnsupportedCurveOperation = 0x178B,
}

impl solana_program::program_error::PrintProgramError for AlbusSwapError {
    fn print<E>(&self) {
        solana_program::msg!(&self.to_string());
    }
}

