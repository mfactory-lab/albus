pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/date.circom";
include "utils/merkleProof.circom";

template AttendanceProof(credentialDepth) {
  signal input expectedEvent;
  signal input expectedDateFrom;
  signal input expectedDateTo;

  // Claims
  signal input event; // event id
  signal input eventKey;
  signal input eventProof[credentialDepth];

  signal input meta_validFrom; // unix timestamp
  signal input meta_validFromKey;
  signal input meta_validFromProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  event === expectedEvent;

  // Event date validation
  var validFrom = Str2Timestamp()(meta_validFrom);
  var date = dateToNum(timestampToDate(validFrom));

  component isGreater = GreaterEqThan(32);
  isGreater.in[0] <-- date;
  isGreater.in[1] <-- dateToNum(timestampToDate(expectedDateFrom));
  expectedDateFrom * isGreater.out === expectedDateFrom;

  component isLess = LessEqThan(32);
  isLess.in[0] <-- date;
  isLess.in[1] <-- dateToNum(timestampToDate(expectedDateTo));
  expectedDateTo * isLess.out === expectedDateTo;

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
  mtp.value <== [event, meta_validFrom];
  mtp.key <== [eventKey, meta_validFromKey];
  mtp.siblings <== [eventProof, meta_validFromProof];
}

// component main{public [
//   expectedEvent,
//   expectedDateFrom,
//   expectedDateTo,
//   eventKey,
//   eventProof,
//   meta_validFromKey,
//   meta_validFromProof,
//   credentialRoot,
//   issuerPk,
//   issuerSignature
// ]} = AttendanceProof(4);
