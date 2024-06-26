/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number }
type MaybeErrorWithCode = ErrorWithCode | null | undefined

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map()
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map()

/**
 * AlreadyInUse: 'Swap account already in use'
 *
 * @category Errors
 * @category generated
 */
export class AlreadyInUseError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'AlreadyInUse'
  constructor() {
    super('Swap account already in use')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AlreadyInUseError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new AlreadyInUseError())
createErrorFromNameLookup.set('AlreadyInUse', () => new AlreadyInUseError())

/**
 * InvalidProgramAddress: 'Invalid program address generated from bump seed and key'
 *
 * @category Errors
 * @category generated
 */
export class InvalidProgramAddressError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'InvalidProgramAddress'
  constructor() {
    super('Invalid program address generated from bump seed and key')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidProgramAddressError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new InvalidProgramAddressError())
createErrorFromNameLookup.set(
  'InvalidProgramAddress',
  () => new InvalidProgramAddressError(),
)

/**
 * InvalidOwner: 'Input account owner is not the program address'
 *
 * @category Errors
 * @category generated
 */
export class InvalidOwnerError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'InvalidOwner'
  constructor() {
    super('Input account owner is not the program address')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidOwnerError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new InvalidOwnerError())
createErrorFromNameLookup.set('InvalidOwner', () => new InvalidOwnerError())

/**
 * InvalidOutputOwner: 'Output pool account owner cannot be the program address'
 *
 * @category Errors
 * @category generated
 */
export class InvalidOutputOwnerError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'InvalidOutputOwner'
  constructor() {
    super('Output pool account owner cannot be the program address')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidOutputOwnerError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new InvalidOutputOwnerError())
createErrorFromNameLookup.set(
  'InvalidOutputOwner',
  () => new InvalidOutputOwnerError(),
)

/**
 * ExpectedMint: 'Deserialized account is not an SPL Token mint'
 *
 * @category Errors
 * @category generated
 */
export class ExpectedMintError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'ExpectedMint'
  constructor() {
    super('Deserialized account is not an SPL Token mint')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExpectedMintError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new ExpectedMintError())
createErrorFromNameLookup.set('ExpectedMint', () => new ExpectedMintError())

/**
 * ExpectedAccount: 'Deserialized account is not an SPL Token account'
 *
 * @category Errors
 * @category generated
 */
export class ExpectedAccountError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'ExpectedAccount'
  constructor() {
    super('Deserialized account is not an SPL Token account')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExpectedAccountError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new ExpectedAccountError())
createErrorFromNameLookup.set(
  'ExpectedAccount',
  () => new ExpectedAccountError(),
)

/**
 * EmptySupply: 'Input token account empty'
 *
 * @category Errors
 * @category generated
 */
export class EmptySupplyError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'EmptySupply'
  constructor() {
    super('Input token account empty')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, EmptySupplyError)
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new EmptySupplyError())
createErrorFromNameLookup.set('EmptySupply', () => new EmptySupplyError())

/**
 * InvalidSupply: 'Pool token mint has a non-zero supply'
 *
 * @category Errors
 * @category generated
 */
export class InvalidSupplyError extends Error {
  readonly code: number = 0x1777
  readonly name: string = 'InvalidSupply'
  constructor() {
    super('Pool token mint has a non-zero supply')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidSupplyError)
    }
  }
}

createErrorFromCodeLookup.set(0x1777, () => new InvalidSupplyError())
createErrorFromNameLookup.set('InvalidSupply', () => new InvalidSupplyError())

/**
 * InvalidDelegate: 'Token account has a delegate'
 *
 * @category Errors
 * @category generated
 */
export class InvalidDelegateError extends Error {
  readonly code: number = 0x1778
  readonly name: string = 'InvalidDelegate'
  constructor() {
    super('Token account has a delegate')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidDelegateError)
    }
  }
}

createErrorFromCodeLookup.set(0x1778, () => new InvalidDelegateError())
createErrorFromNameLookup.set(
  'InvalidDelegate',
  () => new InvalidDelegateError(),
)

/**
 * InvalidInput: 'InvalidInput'
 *
 * @category Errors
 * @category generated
 */
export class InvalidInputError extends Error {
  readonly code: number = 0x1779
  readonly name: string = 'InvalidInput'
  constructor() {
    super('InvalidInput')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidInputError)
    }
  }
}

createErrorFromCodeLookup.set(0x1779, () => new InvalidInputError())
createErrorFromNameLookup.set('InvalidInput', () => new InvalidInputError())

/**
 * IncorrectSwapAccount: 'Address of the provided swap token account is incorrect'
 *
 * @category Errors
 * @category generated
 */
export class IncorrectSwapAccountError extends Error {
  readonly code: number = 0x177A
  readonly name: string = 'IncorrectSwapAccount'
  constructor() {
    super('Address of the provided swap token account is incorrect')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncorrectSwapAccountError)
    }
  }
}

createErrorFromCodeLookup.set(0x177A, () => new IncorrectSwapAccountError())
createErrorFromNameLookup.set(
  'IncorrectSwapAccount',
  () => new IncorrectSwapAccountError(),
)

/**
 * IncorrectPoolMint: 'Address of the provided pool token mint is incorrect'
 *
 * @category Errors
 * @category generated
 */
export class IncorrectPoolMintError extends Error {
  readonly code: number = 0x177B
  readonly name: string = 'IncorrectPoolMint'
  constructor() {
    super('Address of the provided pool token mint is incorrect')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncorrectPoolMintError)
    }
  }
}

createErrorFromCodeLookup.set(0x177B, () => new IncorrectPoolMintError())
createErrorFromNameLookup.set(
  'IncorrectPoolMint',
  () => new IncorrectPoolMintError(),
)

/**
 * InvalidOutput: 'InvalidOutput'
 *
 * @category Errors
 * @category generated
 */
export class InvalidOutputError extends Error {
  readonly code: number = 0x177C
  readonly name: string = 'InvalidOutput'
  constructor() {
    super('InvalidOutput')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidOutputError)
    }
  }
}

createErrorFromCodeLookup.set(0x177C, () => new InvalidOutputError())
createErrorFromNameLookup.set('InvalidOutput', () => new InvalidOutputError())

/**
 * CalculationFailure: 'General calculation failure due to overflow or underflow'
 *
 * @category Errors
 * @category generated
 */
export class CalculationFailureError extends Error {
  readonly code: number = 0x177D
  readonly name: string = 'CalculationFailure'
  constructor() {
    super('General calculation failure due to overflow or underflow')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, CalculationFailureError)
    }
  }
}

createErrorFromCodeLookup.set(0x177D, () => new CalculationFailureError())
createErrorFromNameLookup.set(
  'CalculationFailure',
  () => new CalculationFailureError(),
)

/**
 * InvalidInstruction: 'Invalid instruction'
 *
 * @category Errors
 * @category generated
 */
export class InvalidInstructionError extends Error {
  readonly code: number = 0x177E
  readonly name: string = 'InvalidInstruction'
  constructor() {
    super('Invalid instruction')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidInstructionError)
    }
  }
}

createErrorFromCodeLookup.set(0x177E, () => new InvalidInstructionError())
createErrorFromNameLookup.set(
  'InvalidInstruction',
  () => new InvalidInstructionError(),
)

/**
 * RepeatedMint: 'Swap input token accounts have the same mint'
 *
 * @category Errors
 * @category generated
 */
export class RepeatedMintError extends Error {
  readonly code: number = 0x177F
  readonly name: string = 'RepeatedMint'
  constructor() {
    super('Swap input token accounts have the same mint')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, RepeatedMintError)
    }
  }
}

createErrorFromCodeLookup.set(0x177F, () => new RepeatedMintError())
createErrorFromNameLookup.set('RepeatedMint', () => new RepeatedMintError())

/**
 * ExceededSlippage: 'Swap instruction exceeds desired slippage limit'
 *
 * @category Errors
 * @category generated
 */
export class ExceededSlippageError extends Error {
  readonly code: number = 0x1780
  readonly name: string = 'ExceededSlippage'
  constructor() {
    super('Swap instruction exceeds desired slippage limit')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExceededSlippageError)
    }
  }
}

createErrorFromCodeLookup.set(0x1780, () => new ExceededSlippageError())
createErrorFromNameLookup.set(
  'ExceededSlippage',
  () => new ExceededSlippageError(),
)

/**
 * InvalidCloseAuthority: 'Token account has a close authority'
 *
 * @category Errors
 * @category generated
 */
export class InvalidCloseAuthorityError extends Error {
  readonly code: number = 0x1781
  readonly name: string = 'InvalidCloseAuthority'
  constructor() {
    super('Token account has a close authority')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidCloseAuthorityError)
    }
  }
}

createErrorFromCodeLookup.set(0x1781, () => new InvalidCloseAuthorityError())
createErrorFromNameLookup.set(
  'InvalidCloseAuthority',
  () => new InvalidCloseAuthorityError(),
)

/**
 * InvalidFreezeAuthority: 'Pool token mint has a freeze authority'
 *
 * @category Errors
 * @category generated
 */
export class InvalidFreezeAuthorityError extends Error {
  readonly code: number = 0x1782
  readonly name: string = 'InvalidFreezeAuthority'
  constructor() {
    super('Pool token mint has a freeze authority')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidFreezeAuthorityError)
    }
  }
}

createErrorFromCodeLookup.set(0x1782, () => new InvalidFreezeAuthorityError())
createErrorFromNameLookup.set(
  'InvalidFreezeAuthority',
  () => new InvalidFreezeAuthorityError(),
)

/**
 * IncorrectFeeAccount: 'Pool fee token account incorrect'
 *
 * @category Errors
 * @category generated
 */
export class IncorrectFeeAccountError extends Error {
  readonly code: number = 0x1783
  readonly name: string = 'IncorrectFeeAccount'
  constructor() {
    super('Pool fee token account incorrect')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncorrectFeeAccountError)
    }
  }
}

createErrorFromCodeLookup.set(0x1783, () => new IncorrectFeeAccountError())
createErrorFromNameLookup.set(
  'IncorrectFeeAccount',
  () => new IncorrectFeeAccountError(),
)

/**
 * ZeroTradingTokens: 'Given pool token amount results in zero trading tokens'
 *
 * @category Errors
 * @category generated
 */
export class ZeroTradingTokensError extends Error {
  readonly code: number = 0x1784
  readonly name: string = 'ZeroTradingTokens'
  constructor() {
    super('Given pool token amount results in zero trading tokens')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ZeroTradingTokensError)
    }
  }
}

createErrorFromCodeLookup.set(0x1784, () => new ZeroTradingTokensError())
createErrorFromNameLookup.set(
  'ZeroTradingTokens',
  () => new ZeroTradingTokensError(),
)

/**
 * FeeCalculationFailure: 'Fee calculation failed due to overflow, underflow, or unexpected 0'
 *
 * @category Errors
 * @category generated
 */
export class FeeCalculationFailureError extends Error {
  readonly code: number = 0x1785
  readonly name: string = 'FeeCalculationFailure'
  constructor() {
    super('Fee calculation failed due to overflow, underflow, or unexpected 0')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, FeeCalculationFailureError)
    }
  }
}

createErrorFromCodeLookup.set(0x1785, () => new FeeCalculationFailureError())
createErrorFromNameLookup.set(
  'FeeCalculationFailure',
  () => new FeeCalculationFailureError(),
)

/**
 * ConversionFailure: 'Conversion to u64/u128 failed with an overflow or underflow'
 *
 * @category Errors
 * @category generated
 */
export class ConversionFailureError extends Error {
  readonly code: number = 0x1786
  readonly name: string = 'ConversionFailure'
  constructor() {
    super('Conversion to u64/u128 failed with an overflow or underflow')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ConversionFailureError)
    }
  }
}

createErrorFromCodeLookup.set(0x1786, () => new ConversionFailureError())
createErrorFromNameLookup.set(
  'ConversionFailure',
  () => new ConversionFailureError(),
)

/**
 * InvalidFee: 'The provided fee does not match the program owner's constraints'
 *
 * @category Errors
 * @category generated
 */
export class InvalidFeeError extends Error {
  readonly code: number = 0x1787
  readonly name: string = 'InvalidFee'
  constructor() {
    super('The provided fee does not match the program owner\'s constraints')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidFeeError)
    }
  }
}

createErrorFromCodeLookup.set(0x1787, () => new InvalidFeeError())
createErrorFromNameLookup.set('InvalidFee', () => new InvalidFeeError())

/**
 * IncorrectTokenProgramId: 'The provided token program does not match the token program expected by the swap'
 *
 * @category Errors
 * @category generated
 */
export class IncorrectTokenProgramIdError extends Error {
  readonly code: number = 0x1788
  readonly name: string = 'IncorrectTokenProgramId'
  constructor() {
    super(
      'The provided token program does not match the token program expected by the swap',
    )
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncorrectTokenProgramIdError)
    }
  }
}

createErrorFromCodeLookup.set(0x1788, () => new IncorrectTokenProgramIdError())
createErrorFromNameLookup.set(
  'IncorrectTokenProgramId',
  () => new IncorrectTokenProgramIdError(),
)

/**
 * UnsupportedCurveType: 'The provided curve type is not supported by the program owner'
 *
 * @category Errors
 * @category generated
 */
export class UnsupportedCurveTypeError extends Error {
  readonly code: number = 0x1789
  readonly name: string = 'UnsupportedCurveType'
  constructor() {
    super('The provided curve type is not supported by the program owner')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnsupportedCurveTypeError)
    }
  }
}

createErrorFromCodeLookup.set(0x1789, () => new UnsupportedCurveTypeError())
createErrorFromNameLookup.set(
  'UnsupportedCurveType',
  () => new UnsupportedCurveTypeError(),
)

/**
 * InvalidCurve: 'The provided curve parameters are invalid'
 *
 * @category Errors
 * @category generated
 */
export class InvalidCurveError extends Error {
  readonly code: number = 0x178A
  readonly name: string = 'InvalidCurve'
  constructor() {
    super('The provided curve parameters are invalid')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidCurveError)
    }
  }
}

createErrorFromCodeLookup.set(0x178A, () => new InvalidCurveError())
createErrorFromNameLookup.set('InvalidCurve', () => new InvalidCurveError())

/**
 * UnsupportedCurveOperation: 'The operation cannot be performed on the given curve'
 *
 * @category Errors
 * @category generated
 */
export class UnsupportedCurveOperationError extends Error {
  readonly code: number = 0x178B
  readonly name: string = 'UnsupportedCurveOperation'
  constructor() {
    super('The operation cannot be performed on the given curve')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnsupportedCurveOperationError)
    }
  }
}

createErrorFromCodeLookup.set(
  0x178B,
  () => new UnsupportedCurveOperationError(),
)
createErrorFromNameLookup.set(
  'UnsupportedCurveOperation',
  () => new UnsupportedCurveOperationError(),
)

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code)
  return createError != null ? createError() : null
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name)
  return createError != null ? createError() : null
}
