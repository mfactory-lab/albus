pragma circom 2.1.4;

include "circomlib/circuits/gates.circom";
include "circomlib/circuits/comparators.circom";

template AgeProof() {
  signal input currentYear;
  signal input currentMonth;
  signal input currentDay;

  signal input birthYear;
  signal input birthMonth;
  signal input birthDay;

  signal input minAge;
  signal input maxAge;

  signal output valid;

  var birth = birthYear * 10000 + birthMonth * 100 + birthDay;
  var current = currentYear * 10000 + currentMonth * 100 + currentDay;

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
