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

const os = require('os');
const path = require('path');

const programName = 'albus'
// const programId = 'ALBUSePbQQtw6WavFNyALeyL4ekBADRE28PQJovDDZQz'
const programId = 'ALBs64hsiHgdg53mvd4bcvNZLfDRhctSVaP7PwAPpsZL'

const programDir = path.join(__dirname, '..', '..', 'programs', programName)
const idlGenerator = 'anchor'
const idlDir = path.join(__dirname, 'src/idl')
const sdkDir = path.join(__dirname, 'src', 'generated')
const binaryInstallDir = path.join(os.homedir(), '.cargo')

module.exports = {
  programId,
  programName,
  programDir,
  idlGenerator,
  idlDir,
  sdkDir,
  binaryInstallDir
}
