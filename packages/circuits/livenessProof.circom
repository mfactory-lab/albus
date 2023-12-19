pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/date.circom";
include "merkleProof.circom";

template LivenessProof(credentialDepth) {
  signal input timestamp;
  signal input expectedType;

  signal input credentialRoot;

  // Credential expiration date
  signal input meta_validUntil; // unix timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  // liveness type
  signal input type;
  signal input typeKey;
  signal input typeProof[credentialDepth];

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Liveness type check
  type === expectedType;

  // Expiration date check
  component isExpValid = LessThan(32);
  isExpValid.in[0] <== timestamp;
  isExpValid.in[1] <== meta_validUntil;
  // If the expiration date is zero, the validation should be skipped
  isExpValid.out * meta_validUntil === meta_validUntil;

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
  mtp.siblings <== [typeProof, meta_validUntilProof];
  mtp.key <== [typeKey, meta_validUntilKey];
  mtp.value <== [type, meta_validUntil];
}

component main{public [
  timestamp,
  expectedType,
  typeKey,
  typeProof,
  meta_validUntilKey,
  meta_validUntilProof,
  credentialRoot,
  issuerPk,
  issuerSignature
]} = LivenessProof(4);
