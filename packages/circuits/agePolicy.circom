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
  signal input timestamp; // unix timestamp
  signal input minAge;
  signal input maxAge;

  signal input credentialRoot;

  // credential expiration date
  signal input expirationDate; // unix timestamp
  signal input expirationDateKey;
  signal input expirationDateProof[credentialDepth];

  // birthDate claim and proof
  signal input birthDate; // Ymd format. Example: 20010101
  signal input birthDateKey;
  signal input birthDateProof[credentialDepth];

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  signal output encryptedData[adjustToMultiple(1, 3) + 1];
  signal output encryptedShare[shamirN][4];
  signal output userPublicKey[2];

  // Expiration date check
  component isExpValid = LessThan(32);
  isExpValid.in[0] <== timestamp;
  isExpValid.in[1] <== expirationDate;
  isExpValid.out * expirationDate === expirationDate;

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
  component mtpBirthDate = MerkleProof(credentialDepth);
  mtpBirthDate.root <== credentialRoot;
  mtpBirthDate.siblings <== birthDateProof;
  mtpBirthDate.key <== birthDateKey;
  mtpBirthDate.value <== birthDate;

  component mtpExpDate = MerkleProof(credentialDepth);
  mtpExpDate.root <== credentialRoot;
  mtpExpDate.siblings <== expirationDateProof;
  mtpExpDate.key <== expirationDateKey;
  mtpExpDate.value <== expirationDate;

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
  var birth[3] = parseDate(birthDate);
  var current[3] = timestampToDate(timestamp);

  component age = AgeProof();
  age.birthYear <-- birth[0];
  age.birthMonth <-- birth[1];
  age.birthDay <-- birth[2];
  age.currentYear <-- current[0];
  age.currentMonth <-- current[1];
  age.currentDay <-- current[2];
  age.minAge <== minAge;
  age.maxAge <== maxAge;
  age.valid === 1;
}

component main{public [
  timestamp,
  minAge,
  maxAge,
  credentialRoot,
  expirationDate,
  expirationDateKey,
  expirationDateProof,
  birthDateKey,
  birthDateProof,
  issuerPk,
  issuerSignature,
  trusteePublicKey
]} = AgePolicy(4, 3, 2);
