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

import { DEFAULT_CONTEXT, DEFAULT_VC_TYPE, DEFAULT_VP_TYPE } from '../credential'
import type { W3CCredential, W3CPresentation } from '../types'

export function validateCredentialPayload(payload: W3CCredential): void {
  validateContext(payload['@context'])
  validateVcType(payload.type)
  validateCredentialSubject(payload.credentialSubject)
  if (payload.issuanceDate) {
    validateTimestamp(payload.issuanceDate)
  }
  if (payload.expirationDate) {
    validateTimestamp(payload.expirationDate)
  }
  if (payload.validFrom) {
    validateTimestamp(payload.validFrom)
  }
  if (payload.validUntil) {
    validateTimestamp(payload.validUntil)
  }
}

export function validatePresentationPayload(payload: W3CPresentation): void {
  validateContext(payload['@context'])
  validateVpType(payload.type)
  if (payload.verifiableCredential) {
    if (Array.isArray(payload.verifiableCredential)) {
      for (const vc of payload.verifiableCredential) {
        validateCredentialPayload(vc)
      }
    } else {
      validateCredentialPayload(payload.verifiableCredential)
    }
  }
  if (payload.expirationDate) {
    validateTimestamp(payload.expirationDate)
  }
}

// The main scenario we want to guard against is having a timestamp in milliseconds
// instead of seconds (ex: from new Date().getTime()).
// We will check the number of digits and assume that any number with 12 or more
// digits is a millisecond timestamp.
// 10 digits max is 9999999999 -> 11/20/2286 @ 5:46pm (UTC)
// 11 digits max is 99999999999 -> 11/16/5138 @ 9:46am (UTC)
// 12 digits max is 999999999999 -> 09/27/33658 @ 1:46am (UTC)
function validateTimestamp(value: number | string): void {
  if (typeof value === 'number') {
    if (!(Number.isInteger(value) && value < 100000000000)) {
      throw new TypeError(`"${value}" is not a unix timestamp in seconds`)
    }
  } else if (typeof value === 'string') {
    validateTimestamp(Math.floor(new Date(value).valueOf() / 1000))
  } else if (!isDateObject(value)) {
    throw new TypeError(`"${value}" is not a valid time`)
  }
}

function validateContext(value: string | string[]): void {
  const input = asArray(value)
  if (input.length < 1 || !input.includes(DEFAULT_CONTEXT)) {
    throw new TypeError(`@context is missing default context "${DEFAULT_CONTEXT}"`)
  }
}

function validateVcType(value: string | string[]): void {
  const input = asArray(value)
  if (input.length < 1 || !input.includes(DEFAULT_VC_TYPE)) {
    throw new TypeError(`type is missing default "${DEFAULT_VC_TYPE}"`)
  }
}

function validateVpType(value: string | string[]): void {
  const input = asArray(value)
  if (input.length < 1 || !input.includes(DEFAULT_VP_TYPE)) {
    throw new TypeError(`type is missing default "${DEFAULT_VP_TYPE}"`)
  }
}

function validateCredentialSubject(value: Record<string, any>): void {
  if (Object.keys(value).length === 0) {
    throw new TypeError('credentialSubject must not be empty')
  }
}

function isDateObject(input: any): input is Date {
  return input && !Number.isNaN(input) && Object.prototype.toString.call(input) === '[object Date]'
}

function asArray(arg: any | any[]): any[] {
  return Array.isArray(arg) ? arg : [arg]
}
