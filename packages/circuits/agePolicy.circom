pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/babyjub.circom";
include "utils/date.circom";
include "utils/poseidon.circom";
include "ageProof.circom";
include "encryptionProof.circom";
include "merkleProof.circom";

template AgePolicy(credentialDepth, shamirN, shamirK) {
  // Current timestamp
  signal input timestamp; // unix timestamp

  // Policy params
  signal input minAge;
  signal input maxAge;

  signal input credentialRoot;

  // Credential expiration date
  signal input meta_validUntil; // unix timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  // Birth date
  signal input birthDate; // Ymd format. Example: 20010101
  signal input birthDateKey;
  signal input birthDateProof[credentialDepth];

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
  mtp.siblings <== [birthDateProof, meta_validUntilProof];
  mtp.key <== [birthDateKey, meta_validUntilKey];
  mtp.value <== [birthDate, meta_validUntil];

  // Extracts the user public key from private key
  component upk = BabyPbk();
  upk.in <== userPrivateKey;
  userPublicKey <== [upk.Ax, upk.Ay];

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

  // Age validation
  component age = AgeProof();
  age.currentDate <-- timestampToDate(timestamp);
  age.birthDate <-- numToDate(birthDate);
  age.minAge <== minAge;
  age.maxAge <== maxAge;
  age.valid === 1;
}

component main{public [
  timestamp,
  minAge,
  maxAge,
  credentialRoot,
//  meta_validUntil,
  meta_validUntilKey,
  meta_validUntilProof,
  birthDateKey,
  birthDateProof,
  issuerPk,
  issuerSignature,
  trusteePublicKey
]} = AgePolicy(5, 3, 2);
