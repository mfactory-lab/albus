/*
 * This file is part of Albus code.
 *
 * Copyright (c) 2023, jFactory GmbH
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
 * The developer of this program can be contacted at <info@jfactory.ch>.
 */

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
 * Unauthorized: 'Unauthorized action'
 *
 * @category Errors
 * @category generated
 */
export class UnauthorizedError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'Unauthorized'
  constructor() {
    super('Unauthorized action')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnauthorizedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new UnauthorizedError())
createErrorFromNameLookup.set('Unauthorized', () => new UnauthorizedError())

/**
 * Unverified: 'Unverified'
 *
 * @category Errors
 * @category generated
 */
export class UnverifiedError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'Unverified'
  constructor() {
    super('Unverified')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnverifiedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new UnverifiedError())
createErrorFromNameLookup.set('Unverified', () => new UnverifiedError())

/**
 * Unproved: 'Unproved'
 *
 * @category Errors
 * @category generated
 */
export class UnprovedError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'Unproved'
  constructor() {
    super('Unproved')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnprovedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new UnprovedError())
createErrorFromNameLookup.set('Unproved', () => new UnprovedError())

/**
 * Expired: 'Expired'
 *
 * @category Errors
 * @category generated
 */
export class ExpiredError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'Expired'
  constructor() {
    super('Expired')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExpiredError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new ExpiredError())
createErrorFromNameLookup.set('Expired', () => new ExpiredError())

/**
 * WrongData: 'Wrong data'
 *
 * @category Errors
 * @category generated
 */
export class WrongDataError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'WrongData'
  constructor() {
    super('Wrong data')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, WrongDataError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new WrongDataError())
createErrorFromNameLookup.set('WrongData', () => new WrongDataError())

/**
 * IncorrectOwner: 'Incorrect owner'
 *
 * @category Errors
 * @category generated
 */
export class IncorrectOwnerError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'IncorrectOwner'
  constructor() {
    super('Incorrect owner')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, IncorrectOwnerError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new IncorrectOwnerError())
createErrorFromNameLookup.set('IncorrectOwner', () => new IncorrectOwnerError())

/**
 * InvalidMetadata: 'Invalid metadata'
 *
 * @category Errors
 * @category generated
 */
export class InvalidMetadataError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'InvalidMetadata'
  constructor() {
    super('Invalid metadata')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidMetadataError)
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new InvalidMetadataError())
createErrorFromNameLookup.set(
  'InvalidMetadata',
  () => new InvalidMetadataError(),
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
