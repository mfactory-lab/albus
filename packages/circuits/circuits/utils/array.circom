pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";

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
