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

import type { F1Field } from './ff'

/**
 * Reconstruct a secret from Shamir's secret sharing.
 * All shares must be in decrypted form.
 *
 * @param field The finite field to use.
 * @param k The minimum number of shares required to reconstruct the secret (defines degree of polynomial).
 * @param shares Shares of the participants to reconstruct the secret.
 *  Each is a 2-tuple containing the share index =x, and the value =y.
 * @returns {string} The reconstructed secret as stringifies a field element.
 */
export function reconstructShamirSecret(field: F1Field, k: number, shares: [number, bigint | string][]): bigint {
  if (shares.length < k) {
    throw new Error('Not enough shares to reconstruct secret')
  }
  // if more than k shares are provided, only the first k are used

  // Check for duplicated indices
  const shareIndices = new Set(shares.map(share => share[0]))
  if (shareIndices.size < shares.length) {
    throw new Error('Share inputs need to be unique')
  }

  // Using the interpolation formula from https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing#Mathematical_formulation
  let sum = field.e(0)
  for (let j = 0; j < k; j++) {
    let product = field.e(1)
    for (let m = 0; m < k; m++) {
      if (m === j) {
        continue
      }
      product = field.mul(
        product,
        field.div(
          field.e(shares[m][0]),
          field.sub(
            field.e(shares[m][0]),
            field.e(shares[j][0]),
          ),
        ),
      )
    }
    sum = field.add(sum, field.mul(field.e(shares[j][1]), product))
  }
  return field.toObject(sum)
}
