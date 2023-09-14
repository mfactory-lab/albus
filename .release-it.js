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

module.exports = {
  // git: {
  //   tagName: 'v${version}',
  //   commitMessage: 'release: cut the v${version} release [skip ci]',
  //   tagAnnotation: 'Release ${tagName}',
  //   requireCleanWorkingDir: false
  // },
  git: false,
  github: {
    release: false,
    releaseName: 'Albus ${version}',
    releaseNotes(context) {
      // Remove the first, redundant line with version and date.
      return context.changelog.split('\n').slice(1).join('\n');
    }
  },
  hooks: {
    'after:bump': 'pnpm install --lockfile-only'
  },
  plugins: {
    '@release-it/conventional-changelog': {
      header: '# Changelog',
      infile: 'CHANGELOG.md',
      preset: {
        name: "conventionalcommits",
        types: [
          { "type": "fix", "section": "🐞 Bug Fixes" },
          { "type": "feat", "section": "🌟 Features" },
          { "type": "infra", "section": "🏗 Internal improvements", "hidden": true },
          { "type": "perf", "section": "⚡️ Performance enhancements" },
          { "type": "chore", "section": "🧼 Chores", "hidden": true },
          { "type": "test", "section": "✅ Test coverage", "hidden": true },
          { "type": "docs", "section": "📚 Documentation" },
          { "type": "refactor", "section": "♻️ Refactors" }
        ]
      }
    },
    '@release-it-plugins/workspaces': {
      skipChecks: true,
      workspaces: [
        'packages/albus-core',
        'packages/albus-sdk'
      ]
    }
  },
  npm: {
    pnpm: true,
    versionArgs: ['--allow-same-version', '--workspaces-update=false'],
    publishArgs: ['--access', 'public'],
    skipChecks: true,
    publish: true
  },
  publishConfig: {
    access: 'public',
    registry: 'https://npm.pkg.github.com',
    // registry: 'https://registry.npmjs.org'
  }
}
