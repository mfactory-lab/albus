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

const NOW_FIELD = 'currentDate'

interface PrepareProofInputProps {
  claims: Record<string, any>
  definitions: Record<string, any>
  requiredFields: string[]
}

export function prepareProofInput({ claims, requiredFields, definitions }: PrepareProofInputProps) {
  const input = {}

  for (const field of requiredFields) {
    if (field === NOW_FIELD) {
      const date = new Date()
      input[field] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
      continue
    }

    if (definitions && definitions[field]) {
      input[field] = definitions[field]
      continue
    }

    input[field] = formatField(field, claims[field])
  }

  return input
}

function formatField(name: string, value: string) {
  if (name === 'country') {
    // TODO: get country number code (https://www.iban.com/country-codes) by iso code
  }
  if (name.endsWith('Date')) {
    const date = String(value).split('-', 3)
    if (date.length < 3) {
      throw new Error(`The \`${name}\` attribute is not a valid date`)
    }
    // TODO: better validation
    return date
  }
  return value
}
