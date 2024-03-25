pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "utils/binary.circom";
include "utils/country.circom";
include "utils/merkleProof.circom";

template ResidenceProof(credentialDepth, lookupN) {
  signal input selectionMode; // 1 - inclusion, 0 - exclusion
  signal input countryLookup[lookupN]; // 16 countries per lookup

  signal input country; // US

  signal input claimsKey;
  signal input claimsProof[1][credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  assert(selectionMode <= 1);

  // Data integrity check
  component mtp = MerkleProof(1, credentialDepth);
  mtp.root <== credentialRoot;
  mtp.value <== [country];
  mtp.key <== Num2Bytes(1)(claimsKey);
  mtp.siblings <== claimsProof;

  // Issuer signature check
  component eddsa=EdDSAPoseidonVerifier();
  eddsa.enabled<==1;
  eddsa.M<==credentialRoot;
  eddsa.Ax<==issuerPk[0];
  eddsa.Ay<==issuerPk[1];
  eddsa.R8x<==issuerSignature[0];
  eddsa.R8y<==issuerSignature[1];
  eddsa.S<==issuerSignature[2];

  // Country validation
  component countryProof = CountryProof(lookupN);
  countryProof.selectionMode <== selectionMode;
  countryProof.lookup <== countryLookup;
  countryProof.country <== country;
}

// component main{public [
//   selectionMode,
//   countryLookup,
//   credentialRoot,
//   countryKey,
//   countryProof,
//   issuerPk,
//   issuerSignature
// ]} = CountryPolicy(5, 2);
//
// /* INPUT = {
//   "country": 876
// } */
