pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/date.circom";
include "merkleProof.circom";

template LivenessProof(credentialDepth) {
  signal input timestamp;
  signal input expectedStatus;

  signal input status;
  signal input statusKey;
  signal input statusProof[credentialDepth];

  signal input expirationDate; // unix timestamp
  signal input expirationDateKey;
  signal input expirationDateProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Liveness status check
  status === expectedStatus;

  // Expiration date check
  component isExpValid = LessThan(32);
  isExpValid.in[0] <== timestamp;
  isExpValid.in[1] <== expirationDate;
  // If the expiration date is zero, the validation should be skipped
  isExpValid.out * expirationDate === expirationDate;

  // Issuer signature check
  component eddsa = EdDSAPoseidonVerifier();
  eddsa.enabled <== 1;
  eddsa.M <== credentialRoot;
  eddsa.Ax <== issuerPk[0];
  eddsa.Ay <== issuerPk[1];
  eddsa.R8x <== issuerSignature[0];
  eddsa.R8y <== issuerSignature[1];
  eddsa.S <== issuerSignature[2];

  // Data integrity check
  component mtp = MerkleProof(2, credentialDepth);
  mtp.root <== credentialRoot;
  mtp.siblings <== [statusProof, expirationDateProof];
  mtp.key <== [statusKey, expirationDateKey];
  mtp.value <== [status, expirationDate];
}

component main{public [
  timestamp,
  expectedStatus,
  statusKey,
  statusProof,
  expirationDateKey,
  expirationDateProof,
  credentialRoot,
  issuerPk,
  issuerSignature
]} = LivenessProof(2);
