pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/array.circom";
include "utils/date.circom";
include "utils/merkleProof.circom";

template AML(credentialDepth) {
  signal input timestamp; // unix timestamp
  signal input expectedSpecId; // ABC123

  // Claims
  signal input specId;
  signal input specIdKey;
  signal input specIdProof[credentialDepth];

  signal input meta_validUntil; // timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Is valid credential spec
  specId === expectedSpecId;

  // Expiration check
  var validUntil = Str2Timestamp()(meta_validUntil);
  var isNotExpired = LessThan(32)([timestamp, validUntil]);
  // validUntil can be zero
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
  mtp.value <== [specId, meta_validUntil];
  mtp.key <== [specIdKey, meta_validUntilKey];
  mtp.siblings <== [specIdProof, meta_validUntilProof];
}
