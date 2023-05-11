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

import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

export function downloadFile(url: string, filePath: string) {
  return new Promise((resolve, reject) => {
    filePath = path.resolve(filePath)
    fetch(url, {
      method: 'GET',
    })
      .then((response) => {
        const writer = fs.createWriteStream(filePath)
        if (response.body) {
          response.body.pipe(writer)
          response.body.on('end', resolve)
          response.body.on('error', reject)
        } else {
          throw new Error(
          `Unable to retrieve docker-compose file - ${response.status}`,
          )
        }
      })
      .catch((err) => {
        throw err
      })
  })
}
