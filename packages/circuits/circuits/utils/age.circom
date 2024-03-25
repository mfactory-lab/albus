pragma circom 2.1.6;

include "circomlib/circuits/gates.circom";
include "circomlib/circuits/comparators.circom";
include "date.circom";

template AgeVerifier() {
  signal input currentDate[3]; // [Y,m,d]
  signal input birthDate[3]; // [Y,m,d]
  signal input minAge;
  signal input maxAge;
  signal output valid;

  var current = dateToNum(currentDate);
  var birth = dateToNum(birthDate);

  component isGreater = GreaterEqThan(32);
  isGreater.in[0] <== current;
  isGreater.in[1] <-- minAge > 0 ? birth + minAge * 10000 : current;

  component isLess = LessEqThan(32);
  isLess.in[0] <== current;
  isLess.in[1] <-- maxAge > 0 ? birth + maxAge * 10000 : current;

  component result = AND();
  result.a <== isGreater.out;
  result.b <== isLess.out;

  valid <== result.out;
}
