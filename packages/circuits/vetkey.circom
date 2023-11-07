pragma circom 2.1.4;

include "utils/ecdh.circom";

// Verifiable Encrypted Threshold Keys
// IBE
template VETKeys() {
  signal input mSk; // master secret key
  signal input tPk; // transport public key

  signal input uPk[2]; // [Ax, Ay]
  signal input signature[3]; // [R8x, R8y, S]

  // Auth
  component eddsa = EdDSAPoseidonVerifier();
  eddsa.enabled <== 1;
  eddsa.M <== mSk;
  eddsa.Ax <== uPk[0];
  eddsa.Ay <== uPk[1];
  eddsa.R8x <== signature[0];
  eddsa.R8y <== signature[1];
  eddsa.S <== signature[2];
}
