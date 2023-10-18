const os = require('os')
const path = require('path')

const programName = 'albus_transfer'
const programId = 'J4pyN7p9dAovEQKoZJV1jUbM3FrCBPLCS2dyiRUnwi5c'

const programDir = path.join(__dirname, '..', '..', 'programs', 'albus-transfer')
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
