/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, mFactory GmbH
 *
 * Albus is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Albus is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Albus code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@albus.finance>.
 */

use anchor_lang::error_code;

#[error_code]
pub enum SwapError {
    // 0.
    // The account cannot be initialized because it is already being used.
    #[msg("Swap account already in use")]
    AlreadyInUse,
    // The program address provided doesn't match the value generated by the program.
    #[msg("Invalid program address generated from bump seed and key")]
    InvalidProgramAddress,
    // The owner of the input isn't set to the program address generated by the program.
    #[msg("Input account owner is not the program address")]
    InvalidOwner,
    // The owner of the pool token output is set to the program address generated by the program.
    #[msg("Output pool account owner cannot be the program address")]
    InvalidOutputOwner,
    // The deserialization of the account returned something besides State::Mint.
    #[msg("Deserialized account is not an SPL Token mint")]
    ExpectedMint,

    // 5.
    // The deserialization of the account returned something besides State::Account.
    #[msg("Deserialized account is not an SPL Token account")]
    ExpectedAccount,
    // The input token account is empty.
    #[msg("Input token account empty")]
    EmptySupply,
    // The pool token mint has a non-zero supply.
    #[msg("Pool token mint has a non-zero supply")]
    InvalidSupply,
    // The provided token account has a delegate.
    #[msg("Token account has a delegate")]
    InvalidDelegate,
    // The input token is invalid for swap.
    #[msg("InvalidInput")]
    InvalidInput,

    // 10.
    // Address of the provided swap token account is incorrect.
    #[msg("Address of the provided swap token account is incorrect")]
    IncorrectSwapAccount,
    // Address of the provided pool token mint is incorrect
    #[msg("Address of the provided pool token mint is incorrect")]
    IncorrectPoolMint,
    // The output token is invalid for swap.
    #[msg("InvalidOutput")]
    InvalidOutput,
    // General calculation failure due to overflow or underflow
    #[msg("General calculation failure due to overflow or underflow")]
    CalculationFailure,
    // Invalid instruction number passed in.
    #[msg("Invalid instruction")]
    InvalidInstruction,

    // 15.
    // Swap input token accounts have the same mint
    #[msg("Swap input token accounts have the same mint")]
    RepeatedMint,
    // Swap instruction exceeds desired slippage limit
    #[msg("Swap instruction exceeds desired slippage limit")]
    ExceededSlippage,
    // The provided token account has a close authority.
    #[msg("Token account has a close authority")]
    InvalidCloseAuthority,
    // The pool token mint has a freeze authority.
    #[msg("Pool token mint has a freeze authority")]
    InvalidFreezeAuthority,
    // The pool fee token account is incorrect
    #[msg("Pool fee token account incorrect")]
    IncorrectFeeAccount,

    // 20.
    // Given pool token amount results in zero trading tokens
    #[msg("Given pool token amount results in zero trading tokens")]
    ZeroTradingTokens,
    // The fee calculation failed due to overflow, underflow, or unexpected 0
    #[msg("Fee calculation failed due to overflow, underflow, or unexpected 0")]
    FeeCalculationFailure,
    // ConversionFailure
    #[msg("Conversion to u64 failed with an overflow or underflow")]
    ConversionFailure,
    // The provided fee does not match the program owner's constraints
    #[msg("The provided fee does not match the program owner's constraints")]
    InvalidFee,
    // The provided token program does not match the token program expected by the swap
    #[msg("The provided token program does not match the token program expected by the swap")]
    IncorrectTokenProgramId,

    // 25.
    // The provided curve type is not supported by the program owner
    #[msg("The provided curve type is not supported by the program owner")]
    UnsupportedCurveType,
    // The provided curve parameters are invalid
    #[msg("The provided curve parameters are invalid")]
    InvalidCurve,
    // The operation cannot be performed on the given curve
    #[msg("The operation cannot be performed on the given curve")]
    UnsupportedCurveOperation,
}