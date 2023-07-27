pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/date.circom";
include "ageProof.circom";
include "MerkleProof.circom";

template AgePolicy(credentialDepth) {
  signal input birthDate; // Example: 20020101
  signal input birthDateProof[credentialDepth];
  signal input birthDateKey;

  signal input currentDate; // Example: 20220101
  signal input minAge;
  signal input maxAge;

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Data integrity check
  component smt=MerkleProof(credentialDepth);
  smt.root<==credentialRoot;
  smt.siblings<==birthDateProof;
  smt.key<==birthDateKey;
  smt.value<==birthDate;

  // Issuer signature check
  component eddsa=EdDSAPoseidonVerifier();
  eddsa.enabled<==1;
  eddsa.M<==credentialRoot;
  eddsa.Ax<==issuerPk[0];
  eddsa.Ay<==issuerPk[1];
  eddsa.R8x<==issuerSignature[0];
  eddsa.R8y<==issuerSignature[1];
  eddsa.S<==issuerSignature[2];

//  // Holder signature check

//  signal input challenge;
//  signal input holderPk[2]; // [Ax, Ay]
//  signal input holderSignature[3]; // [R8x, R8y, S]

//  component eddsa=EdDSAPoseidonVerifier();
//  eddsa.enabled<==1;
//  eddsa.M<==challenge;
//  eddsa.Ax<==holderPk[0];
//  eddsa.Ay<==holderPk[1];
//  eddsa.R8x<==holderSignature[0];
//  eddsa.R8y<==holderSignature[1];
//  eddsa.S<==holderSignature[2];

  // Age validation
  component birth=ParseDate();
  birth.date<==birthDate;

  component current=ParseDate();
  current.date<==currentDate;

  component age = AgeProof();
  age.birthYear <== birth.y;
  age.birthMonth <== birth.m;
  age.birthDay <== birth.d;
  age.currentYear <== current.y;
  age.currentMonth <== current.m;
  age.currentDay <== current.d;
  age.minAge <== minAge;
  age.maxAge <== maxAge;
  age.valid === 1;
}

component main{public [
  currentDate,
  minAge,
  maxAge,
  credentialRoot,
  birthDateProof,
  birthDateKey,
  issuerPk,
  issuerSignature
]} = AgePolicy(6); // 2**6 = 64
