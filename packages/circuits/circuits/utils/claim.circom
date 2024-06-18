pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";

template getFlags(from, N) {
  signal input in;
  signal output out[N];
  component bits = Num2Bits(256 - from);
  bits.in <== in;
  component flags[N];
  for (var i=0; i<N; i++) {
    flags[i] = Bits2Num(8);
    for (var j=0; j<8; j++) {
      flags[i].in[j] <== bits.out[from + i * 8 + j];
    }
    out[i] <== flags[i].out;
  }
}

template getPackedValue(from, size) {
  signal input in;
  signal output out;
  component bits = Num2Bits(256);
  bits.in <== in;
  component value = Bits2Num(size);
  for (var i=0; i<size; i++) {
    value.in[i] <== bits.out[from + i];
  }
  out <== value.out;
}
