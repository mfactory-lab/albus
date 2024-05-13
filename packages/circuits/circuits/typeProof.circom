pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/array.circom";
include "utils/binary.circom";
include "utils/date.circom";
include "utils/merkleProof.circom";

template TypeProof(credentialDepth, typesN) {
  signal input timestamp; // unix timestamp
  signal input expectedType[typesN];

  // Claims
  signal input meta_type;
  signal input meta_validUntil;

  signal input claimsKey;
  signal input claimsProof[2][credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Is valid credential type
  component res = IN(typesN);
  res.value <== expectedType;
  res.in <== meta_type;
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
  mtp.value <== [meta_type, meta_validUntil];
  mtp.key <== Num2Bytes(2)(claimsKey);
  mtp.siblings <== claimsProof;
}
