pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/babyjub.circom";
include "utils/age.circom";
include "utils/binary.circom";
include "utils/date.circom";
include "utils/poseidon.circom";
include "utils/encryptionProof.circom";
include "utils/merkleProof.circom";

template AgeProof(credentialDepth, shamirN, shamirK) {
  signal input timestamp; // unix timestamp
  signal input ageRange;

  // Claims
  signal input birthDate; // 2001-01-02
  signal input meta_validUntil; // timestamp

  signal input claimsKey;
  signal input claimsProof[2][credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  // Encrypted claims
  signal output encryptedData[adjustToMultiple(1, 3) + 1];
  // Encrypted secret shares
  signal output encryptedShare[shamirN][4];
  // User public key, derived from `userPrivateKey`
  signal output userPublicKey[2];

  // Extracts the user public key from private key
  component upk = BabyPbk();
  upk.in <== userPrivateKey;
  userPublicKey <== [upk.Ax, upk.Ay];

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
  mtp.value <== [birthDate, meta_validUntil];
  mtp.key <== Num2Bytes(2)(claimsKey);
  mtp.siblings <== claimsProof;

  // Derive secret key
  component secret = Poseidon(3);
  secret.inputs <== [userPrivateKey, credentialRoot, timestamp];

  // Encrypt data and trustee shares
  component enc = EncryptionProof(1, shamirN, shamirK);
  enc.userPrivateKey <== userPrivateKey;
  enc.trusteePublicKey <== trusteePublicKey;
  enc.secret <== secret.out;
  enc.nonce <== timestamp;
  enc.data <== [birthDate];

  encryptedData <== enc.encryptedData;
  encryptedShare <== enc.encryptedShare;

  // Age Range
  component range = AgeRange();
  range.in <== ageRange;

  // Age validation
  component age = AgeVerifier();
  age.currentDate <-- timestampToDate(timestamp);
  age.birthDate <== ParseDate()(birthDate);
  age.minAge <== range.minAge;
  age.maxAge <== range.maxAge;
  age.valid === 1;
}
