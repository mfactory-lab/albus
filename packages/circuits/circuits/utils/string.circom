pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";

/**
 * Converts ASCII to numbers from 0-9
 */
template AsciiToNum(N) {
  signal input in[N];
  signal output out;
  var temp = 0;
  for (var i = 0; i < N; i++) {
    if (in[i] >= 48) {
      temp *= 10;
      temp += in[i] - 48;
    }
  }
  out <-- temp;
}

/**
 * Retrieve ASCII from bits array
 */
template BitsToAscii(from, N) {
  signal input in[256];
  signal output out;
  signal bytes[N];
  component b2n[N];
  for (var i=0; i<N; i++) {
    b2n[i] = Bits2Num(8);
    for (var j=0; j<8; j++) {
      b2n[i].in[j] <== in[from + i * 8 + j];
    }
    bytes[N - 1 - i] <-- b2n[i].out;
  }
  out <== AsciiToNum(N)(bytes);
}
