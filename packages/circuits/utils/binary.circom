pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";

// inSize - in bytes
// outSize - in bytes
template Bin2Num(inSize, outSize, from) {
    signal input in[inSize];
    signal output out;
    var lc1=0;
    var e2 = 1;
    for (var i = 0; i<outSize; i++) {
        lc1 += in[from + i] * e2;
        e2 = e2 + e2;
    }
    lc1 ==> out;
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
