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
const antfu = require('@antfu/eslint-config').default

module.exports = antfu(
  {
    gitignore: true,
    stylistic: true,
    typescript: true,
    markdown: true,
    yaml: true,
    toml: true,
    vue: false,
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      'pnpm-lock.yaml',
    ],
  }, {
    rules: {
      'antfu/consistent-list-newline': 'off',
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],

      'toml/padding-line-between-pairs': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],

      'curly': ['error', 'all'],

      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',

      'no-console': 'off',
    },
  },
  {
    files: [
      '**/generated/**',
    ],
    rules: {
      'ts/no-use-before-define': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/check-property-names': 'off',
      'jsdoc/require-property-name': 'off',
    },
  },
)
