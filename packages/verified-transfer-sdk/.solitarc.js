const os = require('os');
const path = require('path');

const programDir = path.join(__dirname, '..', '..', 'programs', 'verified_transfer');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(os.homedir(), '.cargo');
// const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'verified_transfer',
  programId: '4goQchSHCB4zSa3vjn2NdjnWhYuzn3oYSbx1kVwwZdHS',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};
