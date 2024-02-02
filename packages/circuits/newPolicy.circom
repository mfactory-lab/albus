pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/babyjub.circom";
include "utils/country.circom";
include "utils/date.circom";
include "utils/poseidon.circom";
include "ageProof.circom";
include "encryptionProof.circom";
include "merkleProof.circom";

template Main(credentialDepth, shamirN, shamirK) {
  var totalClaims = 6;

  signal input timestamp;
  signal input config[2];

  // Claims
  signal input meta_validUntil; // timestamp
  signal input givenName; // John
  signal input familyName; // Doe
  signal input birthDate; // 2001-01-02
  signal input country; // USA
  signal input docNumber; // EF122345

  signal input claimsKey;
  signal input claimsProof[totalClaims][credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  // Encrypted claims
  signal output encryptedData[adjustToMultiple(totalClaims-1, 3) + 1];
  // Encrypted secret shares
  signal output encryptedShare[shamirN][4];
//   // User public key, derived from `userPrivateKey`
//   signal output userPublicKey[2];

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
  component mtp = MerkleProof(totalClaims, credentialDepth);
  mtp.root <== credentialRoot;
  mtp.value <== [givenName, familyName, birthDate, country, docNumber, meta_validUntil];
  mtp.key <== Num2Bytes(totalClaims)(claimsKey);
  mtp.siblings <== claimsProof;

  // Expiration check
  var validUntil = Str2Timestamp()(meta_validUntil);
  var isNotExpired = LessThan(32)([timestamp, validUntil]);
  isNotExpired * validUntil === validUntil;

//   // Extracts the user public key from private key
//   component upk = BabyPbk();
//   upk.in <== userPrivateKey;
//   userPublicKey <== [upk.Ax, upk.Ay];

  // Derive secret key
  var secret = Poseidon(3)([userPrivateKey, credentialRoot, timestamp]);

  // Encrypt data and generate trustee shares
  component enc = EncryptionProof(totalClaims-1, shamirN, shamirK);
  enc.data <== [givenName, familyName, birthDate, country, docNumber];
  enc.userPrivateKey <== userPrivateKey;
  enc.trusteePublicKey <== trusteePublicKey;
  enc.nonce <== timestamp;
  enc.secret <== secret;

  encryptedData <== enc.encryptedData;
  encryptedShare <== enc.encryptedShare;

  // Configuration
  component cfg = Config();
  cfg.in <== config[0];

  // Age validation
  component age = AgeProof();
  age.currentDate <-- timestampToDate(timestamp);
  age.birthDate <== ParseDate()(birthDate);
  age.minAge <== cfg.minAge;
  age.maxAge <== cfg.maxAge;
  age.valid === 1;

  // Country validation
  component countryProof = CountryProof(1);
  countryProof.selectionMode <== cfg.selectionMode;
  countryProof.lookup <== [config[1]];
  countryProof.country <== country;
}

// The policy configuration
template Config() {
  signal input in;
  signal output minAge;
  signal output maxAge;
  signal output selectionMode;

  var bits[256] = Num2Bits(256)(in);
  minAge <== Bin2Num(256, 8, 0)(bits);
  maxAge <== Bin2Num(256, 8, 8)(bits);
  selectionMode <== Bin2Num(256, 8, 16)(bits);
}

component main{public [
  timestamp,
  config,
  claimsKey,
  claimsProof,
  issuerPk,
  issuerSignature,
  trusteePublicKey
]} = Main(5, 3, 2);
