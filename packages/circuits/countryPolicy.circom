pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";
include "MerkleProof.circom";
include "utils/country.circom";

template CountryPolicy(credentialDepth, lookupN) {
  signal input selectionMode; // 1 - inclusion, 0 - exclusion
  signal input countryLookup[lookupN]; // every field has max 32 country ids

  signal input country; // poseidon(ISO-3)
  signal input countryKey;
  signal input countryProof[credentialDepth];

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  var lookupSize = 32;

  assert(selectionMode <= 1);

  // Data integrity check
  component mtp = MerkleProof(1, credentialDepth);
  mtp.root <== credentialRoot;
  mtp.siblings <== [countryProof];
  mtp.key <== [countryKey];
  mtp.value <== [country];

  // Issuer signature check
  component eddsa=EdDSAPoseidonVerifier();
  eddsa.enabled<==1;
  eddsa.M<==credentialRoot;
  eddsa.Ax<==issuerPk[0];
  eddsa.Ay<==issuerPk[1];
  eddsa.R8x<==issuerSignature[0];
  eddsa.R8y<==issuerSignature[1];
  eddsa.S<==issuerSignature[2];

  component res = IN(lookupSize * lookupN);
  component countrySet[lookupN];

  for (var i = 0; i < lookupN; i++) {
    countrySet[i] = Num2Bytes(lookupSize);
    countrySet[i].in <== countryLookup[i];
    for (var j = 0; j < lookupSize; j++) {
      res.value[i * lookupSize + j] <== countrySet[i].out[j];
    }
  }

  component countryIndex = CountryIndexLookup();
  countryIndex.in <== country;

  res.in <== countryIndex.out;
  res.out === 1 * selectionMode;
}

template Num2Bytes(n) {
  signal input in; // < 2 ^ (8 * 31)
  signal output out[n]; // each out is < 64

  component nbytes = Num2Bits(8 * n);
  nbytes.in <== in;
  component bytes[n];

  for (var i = 0; i < n; i++) {
    // Witness gen out
    out[i] <-- (in >> (i * 8)) % 256;
    // Constrain bits to match
    bytes[i] = Num2Bits(8);
    bytes[i].in <== out[i];
    for (var j = 0; j < 8; j++) {
        nbytes.out[i * 8 + j] === bytes[i].out[j];
    }
  }
}

template IN (n) {
  signal input in;
  signal input value[n];
  signal output out;

  component eq[n];
  signal count[n+1];
  count[0] <== 0;

  for (var i=0; i<n; i++) {
    eq[i] = IsEqual();
    eq[i].in[0] <== in;
    eq[i].in[1] <== value[i];
    count[i+1] <== count[i] + eq[i].out;
  }

  component gt = GreaterThan(252);
  gt.in[0] <== count[n];
  gt.in[1] <== 0;

  out <== gt.out; // 1 - if in signal in the list, 0 - if it is not
}

component main{public [
  selectionMode,
  countryLookup,
  credentialRoot,
  countryKey,
  countryProof,
  issuerPk,
  issuerSignature
]} = CountryPolicy(5, 2);

/* INPUT = {
  "country": 876
} */
