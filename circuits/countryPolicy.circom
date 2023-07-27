pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "MerkleProof.circom";

// Country numbers
// https://www.iban.com/country-codes

template CountryPolicy(credentialDepth) {
  signal input country;
  signal input countryProof[credentialDepth];
  signal input countryKey;

  signal input credentialRoot;

  signal input issuerPk[2]; // [Ax, Ay]
  signal input issuerSignature[3]; // [R8x, R8y, S]

  // Data integrity check
  component smt=MerkleProof(credentialDepth);
  smt.root<==credentialRoot;
  smt.siblings<==countryProof;
  smt.key<==countryKey;
  smt.value<==country;

  // Issuer signature check
  component eddsa=EdDSAPoseidonVerifier();
  eddsa.enabled<==1;
  eddsa.M<==credentialRoot;
  eddsa.Ax<==issuerPk[0];
  eddsa.Ay<==issuerPk[1];
  eddsa.R8x<==issuerSignature[0];
  eddsa.R8y<==issuerSignature[1];
  eddsa.S<==issuerSignature[2];

  var country_count = 36;

  var europe_country_codes[country_count] = [
    40, 56, 100, 191, 203, 208, 233, 246, 348, 352, 372, 428, 440, 442, 470, 498, 528, 578,
    616, 620, 642, 703, 705, 724, 752, 756, 826, 831, 832, 833, 834, 840, 858, 860, 876,
    894
  ];

  component x = IN(country_count);
  x.in <== country;
  x.value <== europe_country_codes;
  x.out === 1;
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

component main = CountryPolicy(6);

/* INPUT = {
  "country": 876
} */
