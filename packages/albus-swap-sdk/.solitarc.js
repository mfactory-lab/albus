const os = require('node:os')
const path = require('node:path')

const programName = 'albus_swap'
const programId = 'ASWfaoztykN8Lz1P2uwuvwWR61SvFrvn6acM1sJpxKtq'

const programDir = path.join(__dirname, '..', '..', 'programs', 'albus-swap')
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
