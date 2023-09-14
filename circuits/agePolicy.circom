pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/babyjub.circom";
include "utils/date.circom";
include "utils/poseidon.circom";
include "ageProof.circom";
include "encryptionProof.circom";
include "merkleProof.circom";

template AgePolicy(credentialDepth, shamirN, shamirK) {
  signal input currentDate; // Example: 20220101
  signal input minAge;
  signal input maxAge;

  signal input credentialRoot;

  signal input birthDate; // Example: 20020101
  signal input birthDateProof[credentialDepth];
  signal input birthDateKey;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

//  signal input secret;
//  signal input nonce;
  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  signal output encryptedData[adjustToMultiple(1, 3) + 1];
  signal output encryptedShare[shamirN][4];
  signal output userPublicKey[2];

  // extracts the user public key from private key
  component upk = BabyPbk();
  upk.in <== userPrivateKey;
  userPublicKey <== [upk.Ax, upk.Ay];

  // Data integrity check
  component smt = MerkleProof(credentialDepth);
  smt.root <== credentialRoot;
  smt.siblings <== birthDateProof;
  smt.key <== birthDateKey;
  smt.value <== birthDate;

  // Issuer signature check
  component eddsa = EdDSAPoseidonVerifier();
  eddsa.enabled <== 1;
  eddsa.M <== credentialRoot;
  eddsa.Ax <== issuerPk[0];
  eddsa.Ay <== issuerPk[1];
  eddsa.R8x <== issuerSignature[0];
  eddsa.R8y <== issuerSignature[1];
  eddsa.S <== issuerSignature[2];

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

  // Derive secret key
  component secret = Poseidon(4);
  secret.inputs[0] <== userPrivateKey;
  secret.inputs[1] <== credentialRoot;
  secret.inputs[2] <== currentDate;
  secret.inputs[3] <== birthDate;

  // Encrypt data and trustee shares
  component enc = EncryptionProof(1, shamirN, shamirK);
  enc.userPrivateKey <== userPrivateKey;
  enc.trusteePublicKey <== trusteePublicKey;
  enc.secret <== secret.out;
  enc.nonce <== currentDate;
  enc.data <== [birthDate];

  encryptedData <== enc.encryptedData;
  encryptedShare <== enc.encryptedShare;

  // Age validation
  component birth = ParseDate();
  birth.date <== birthDate;

  component current = ParseDate();
  current.date <== currentDate;

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
  issuerSignature,
  trusteePublicKey
]} = AgePolicy(6, 3, 2);
