const os = require('os')
const path = require('path')

const programName = 'verified_swap'
const programId = '8NHcjkbgyuZzcwryaGJ9zf7JRqKfsHipuNDQdhtk9giR'

const programDir = path.join(__dirname, '..', '..', 'programs', 'verified_swap')
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
