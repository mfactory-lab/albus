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

import type { IPresentationDefinition } from '@sphereon/pex'
import { PEX } from '@sphereon/pex'
import type { OriginalVerifiableCredential } from '@sphereon/ssi-types'
import type { VerifiableCredential, VerifiablePresentation } from './types'
import { createVerifiablePresentation } from '.'

export type CreatePresentationExchangeOpts = {
  definition: IPresentationDefinition
  credentials: VerifiableCredential[]
  holderSecretKey: number[] | Uint8Array
  holderDid?: string
  challenge?: bigint
  date?: string | Date
}

export async function createPresentationExchange(opts: CreatePresentationExchangeOpts) {
  const res = PexHelper.selectFrom(opts.definition, opts.credentials)

  if (res.areRequiredCredentialsPresent !== 'info') {
    throw new Error('Not all required credentials are present')
  }

  return createVerifiablePresentation({
    credentials: res.verifiableCredential as VerifiableCredential[],
    challenge: opts.challenge,
    holderSecretKey: opts.holderSecretKey,
    holderDid: opts.holderDid,
    date: opts.date,
  })
}

export class PexHelper {
  private static pex = new PEX()

  /**
   * This method validates whether an object is usable as a presentation definition or not.
   */
  static validateDefinition(def: IPresentationDefinition) {
    return PEX.validateDefinition(def)
  }

  /**
   * The selectFrom method is a helper function that helps filter out the verifiable credentials
   * which can not be selected and returns the selectable credentials.
   */
  static selectFrom(def: IPresentationDefinition, creds: VerifiableCredential[]) {
    return this.pex.selectFrom(def, creds as OriginalVerifiableCredential[])
  }

  /**
   * This method helps create an Unsigned Presentation.
   * An Unsigned Presentation after signing becomes a Presentation.
   * And can be sent to the verifier after signing it.
   */
  static presentationFrom(def: IPresentationDefinition, creds: VerifiableCredential[]) {
    return this.pex.presentationFrom(def, creds as OriginalVerifiableCredential[])
  }

  /**
   * The evaluatePresentation compares what is expected from a presentation with a presentationDefinition.
   */
  static evaluatePresentation(def: IPresentationDefinition, vp: VerifiablePresentation) {
    return this.pex.evaluatePresentation(def, vp as any)
  }
}
