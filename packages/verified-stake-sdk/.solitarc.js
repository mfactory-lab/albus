const os = require('node:os')
const path = require('node:path')

const programName = 'verified_stake'
const programId = 'CMev81L3acPrcTTevCFGdcNQnDypMGzuiAUgo8NBZJzr'

const programDir = path.join(__dirname, '..', '..', 'programs', 'verified_stake')
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
