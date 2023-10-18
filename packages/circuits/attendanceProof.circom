pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/date.circom";
include "merkleProof.circom";

template AttendanceProof(credentialDepth) {
  signal input expectedEvent;
  signal input expectedDate; // unix timestamp

  signal input event;
  signal input eventKey;
  signal input eventProof[credentialDepth];

  signal input date; // unix timestamp
  signal input dateKey;
  signal input dateProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  event === expectedEvent;

  component eq = IsEqual();
  eq.in[0] <-- dateToNum(timestampToDate(date));
  eq.in[1] <-- dateToNum(timestampToDate(expectedDate));
  expectedDate * eq.out === expectedDate;

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
  mtp.siblings <== [eventProof, dateProof];
  mtp.key <== [eventKey, dateKey];
  mtp.value <== [event, date];
}

component main{public [
  expectedEvent,
  expectedDate,
//  event,
  eventKey,
  eventProof,
//  date,
  dateKey,
  dateProof,
  credentialRoot,
  issuerPk,
  issuerSignature
]} = AttendanceProof(4);
