pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/array.circom";
include "utils/date.circom";
include "utils/merkleProof.circom";

template LivenessProof(credentialDepth, typesN) {
  signal input timestamp;
  signal input expectedType[typesN];

  // Claims
  signal input livenessType; // e.g. SumsubSelfie
  signal input livenessTypeKey;
  signal input livenessTypeProof[credentialDepth];

  signal input meta_validUntil; // unix timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Is valid liveness type
  component res = IN(typesN);
  res.value <== expectedType;
  res.in <== livenessType;
  res.out === 1;

  // Expiration check
  var validUntil = Str2Timestamp()(meta_validUntil);
  var isNotExpired = LessThan(32)([timestamp, validUntil]);
  isNotExpired * validUntil === validUntil;

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
  mtp.value <== [livenessType, meta_validUntil];
  mtp.key <== [livenessTypeKey, meta_validUntilKey];
  mtp.siblings <== [livenessTypeProof, meta_validUntilProof];
}

// component main{public [
//   timestamp,
//   expectedType,
//   typeKey,
//   typeProof,
//   meta_validUntilKey,
//   meta_validUntilProof,
//   credentialRoot,
//   issuerPk,
//   issuerSignature
// ]} = LivenessProof(4);
