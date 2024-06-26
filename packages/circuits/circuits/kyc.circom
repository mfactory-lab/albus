pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/babyjub.circom";
include "utils/age.circom";
include "utils/country.circom";
include "utils/date.circom";
include "utils/poseidon.circom";
include "utils/encryptionProof.circom";
include "utils/merkleProof.circom";

template Config() {
  signal input in;
  signal output minAge;
  signal output maxAge;
  signal output countrySelectionMode; // 1 - inclusion, 0 - exclusion

  var bits[256] = Num2Bits(256)(in);
  minAge <== Bin2Num(256, 8, 0)(bits);
  maxAge <== Bin2Num(256, 8, 8)(bits);
  countrySelectionMode <== Bin2Num(256, 8, 16)(bits);
}

template Kyc(credentialDepth, countryLookupSize, shamirN, shamirK) {
  signal input config;
  signal input timestamp;
  signal input countryLookup[countryLookupSize]; // 16 countries per lookup

  // Claims
  signal input givenName; // John
  signal input givenNameKey;
  signal input givenNameProof[credentialDepth];

  signal input familyName; // Doe
  signal input familyNameKey;
  signal input familyNameProof[credentialDepth];

  signal input birthDate; // 2001-01-02
  signal input birthDateKey;
  signal input birthDateProof[credentialDepth];

  signal input country; // US
  signal input countryKey;
  signal input countryProof[credentialDepth];

  signal input docNumber; // EF122345
  signal input docNumberKey;
  signal input docNumberProof[credentialDepth];

  signal input meta_validUntil; // timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  // total used claims in this circuit
  var totalClaims = 6;

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  // Encrypted claims
  signal output encryptedData[adjustToMultiple(totalClaims-1, 3) + 1];
  // Encrypted secret shares
  signal output encryptedShare[shamirN][4];

  // User public key, derived from `userPrivateKey`
  signal output userPublicKey[2];

  // Configuration
  component cfg = Config();
  cfg.in <== config;

  // Extracts the user public key from private key
  component upk = BabyPbk();
  upk.in <== userPrivateKey;
  userPublicKey <== [upk.Ax, upk.Ay];

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
  mtp.key <== [givenNameKey, familyNameKey, birthDateKey, countryKey, docNumberKey, meta_validUntilKey];
  mtp.siblings <== [givenNameProof, familyNameProof, birthDateProof, countryProof, docNumberProof, meta_validUntilProof];

  // Expiration check
  var validUntil = Str2Timestamp()(meta_validUntil);
  var isNotExpired = LessThan(32)([timestamp, validUntil]);
  isNotExpired * validUntil === validUntil;

  // Derive secret key
  var secret = Poseidon(3)([userPrivateKey, credentialRoot, timestamp]);

  // Encrypt data and generate trustee shares
  component enc = EncryptionProof(5, shamirN, shamirK);
  enc.data <== [givenName, familyName, birthDate, country, docNumber];
  enc.userPrivateKey <== userPrivateKey;
  enc.trusteePublicKey <== trusteePublicKey;
  enc.nonce <== timestamp;
  enc.secret <== secret;

  encryptedData <== enc.encryptedData;
  encryptedShare <== enc.encryptedShare;

  // Age validation
  component age = AgeVerifier();
  age.currentDate <-- timestampToDate(timestamp);
  age.birthDate <== ParseDate()(birthDate);
  age.minAge <== cfg.minAge;
  age.maxAge <== cfg.maxAge;

  log(age.currentDate[0], age.currentDate[1], age.currentDate[2]);
  log(age.birthDate[0], age.birthDate[1], age.birthDate[2]);
  log(cfg.minAge);
  log(cfg.maxAge);

  age.valid === 1;

  // Country validation
  component countryCheck = CountryProof(countryLookupSize);
  countryCheck.selectionMode <== cfg.countrySelectionMode;
  countryCheck.lookup <== countryLookup;
  countryCheck.country <== country;
}

// component main{public [
//   config,
//   timestamp,
//   countryLookup,
//   givenNameKey,
//   givenNameProof,
//   familyNameKey,
//   familyNameProof,
//   birthDateKey,
//   birthDateProof,
//   countryKey,
//   countryProof,
//   docNumberKey,
//   docNumberProof,
//   meta_validUntilKey,
//   meta_validUntilProof,
//   credentialRoot,
//   issuerPk,
//   issuerSignature,
//   trusteePublicKey
// ]} = Kyc(5, 2, 3, 2);
