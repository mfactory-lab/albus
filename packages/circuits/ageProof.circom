pragma circom 2.1.4;

include "circomlib/circuits/gates.circom";
include "circomlib/circuits/comparators.circom";
include "utils/date.circom";

template AgeProof() {
  signal input currentDate[3];
  signal input birthDate[3];
  signal input minAge;
  signal input maxAge;
  signal output valid;

  var current = dateToNum(currentDate);
  var birth = dateToNum(birthDate);

  component isGreater = GreaterEqThan(32);
  isGreater.in[0] <== current;
  isGreater.in[1] <== birth + minAge * 10000;

  component isLess = LessEqThan(32);
  isLess.in[0] <== current;
  isLess.in[1] <== birth + maxAge * 10000;

  component result = AND();
  result.a <== isGreater.out;
  result.b <== isLess.out;

  valid <== result.out;
}
