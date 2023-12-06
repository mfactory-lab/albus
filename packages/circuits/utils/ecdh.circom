pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/escalarmulany.circom";

template Ecdh() {
  signal input privateKey;
  signal input publicKey[2];

  signal output sharedKey[2];

  component privBits = Num2Bits(253);
  privBits.in <== privateKey;

  component mulFix = EscalarMulAny(253);
  mulFix.p[0] <== publicKey[0];
  mulFix.p[1] <== publicKey[1];

  for (var i = 0; i < 253; i++) {
    mulFix.e[i] <== privBits.out[i];
  }

  sharedKey[0] <== mulFix.out[0];
  sharedKey[1] <== mulFix.out[1];
}
