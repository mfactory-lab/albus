pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/country.circom";
include "utils/date.circom";
include "utils/merkleProof.circom";

template ResidenceProof(credentialDepth, lookupN) {
  signal input timestamp; // unix timestamp
  signal input selectionMode; // 1 - inclusion, 0 - exclusion
  signal input countryLookup[lookupN]; // 16 countries per lookup

  signal input country; // US
  signal input countryKey;
  signal input countryProof[credentialDepth];

  signal input meta_validUntil; // unix timestamp
  signal input meta_validUntilKey;
  signal input meta_validUntilProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  assert(selectionMode <= 1);

  // Expiration check
  var validUntil = Str2Timestamp()(meta_validUntil);
  var isNotExpired = LessThan(32)([timestamp, validUntil]);
  isNotExpired * validUntil === validUntil;

  // Data integrity check
  component mtp = MerkleProof(2, credentialDepth);
  mtp.root <== credentialRoot;
  mtp.value <== [country, meta_validUntil];
  mtp.key <== [countryKey, meta_validUntilKey];
  mtp.siblings <== [countryProof, meta_validUntilProof];

  // Issuer signature check
  component eddsa = EdDSAPoseidonVerifier();
  eddsa.enabled <== 1;
  eddsa.M <== credentialRoot;
  eddsa.Ax <== issuerPk[0];
  eddsa.Ay <== issuerPk[1];
  eddsa.R8x <== issuerSignature[0];
  eddsa.R8y <== issuerSignature[1];
  eddsa.S <== issuerSignature[2];

  // Country validation
  component countryCheck = CountryProof(lookupN);
  countryCheck.selectionMode <== selectionMode;
  countryCheck.lookup <== countryLookup;
  countryCheck.country <== country;
}

// component main{public [
//   timestamp,
//   selectionMode,
//   countryLookup,
//   credentialRoot,
//   countryKey,
//   countryProof,
//   meta_validUntilKey,
//   meta_validUntilProof,
//   issuerPk,
//   issuerSignature
// ]} = CountryPolicy(5, 2);
//
// /* INPUT = {
//   "country": 876
// } */
