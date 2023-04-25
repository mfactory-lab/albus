pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";

// Country numbers
// https://www.iban.com/country-codes

template IsEuropeCountry() {
  signal input country;

  assert(country > 0);

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

component main = IsEuropeCountry();

/* INPUT = {
  "country": 876
} */
