const os = require('node:os')
const path = require('node:path')

const programName = 'verified_stake_pool'
const programId = 'HN5hBpR28T8Mjkm1CB1D8Hj5z5rHQ7VkD2ZWmZtFk49e'

const programDir = path.join(__dirname, '..', '..', 'programs', 'verified_stake_pool')
const idlGenerator = 'anchor'
const idlDir = path.join(__dirname, 'idl')
const sdkDir = path.join(__dirname, 'src', 'generated')
const binaryInstallDir = path.join(os.homedir(), '.cargo')
// const binaryInstallDir = path.join(__dirname, '.crates')

module.exports = {
  programId,
  programName,
  programDir,
  idlGenerator,
  idlDir,
  sdkDir,
  binaryInstallDir,
}
