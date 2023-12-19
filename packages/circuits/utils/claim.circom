pragma circom 2.1.6;

template getFlagsValue(from, size) {
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

template getAgeRange() {
  signal input in
  signal output min;
  signal output max;

  component bits = Num2Bits(256);
  bits.in = in

  component _min = Bits2Num(8);
  for (var i=0; i<8; i++) {
    _min.in[i] <== bits.out[i];
  }
  min <== _min.out;

  component _max = Bits2Num(8);
  for (var i=0; i<8; i++) {
    _max.in[i] <== bits.out[8 + i];
  }
  max <== _max.out;
}
