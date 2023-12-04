pragma circom 2.1.4;

include "circomlib/circuits/eddsaposeidon.circom";
include "utils/ecdh.circom";

template IBE() {
  signal input pk[2]; // [Ax, Ay]
  signal input signature[3]; // [R8x, R8y, S]

  signal output sharedKey[2];
  signal output publicKey[2];

  // Master Secret Key
  var msk = 68365623289906392867689268365623289906392867689222;

  // Extracts the master public key from the `msk`
  component mpk = BabyPbk();
  mpk.in <== msk;
  publicKey <== [mpk.Ax, mpk.Ay];

  component eddsa = EdDSAPoseidonVerifier();
  eddsa.enabled <== 1;
  eddsa.M <== 67689268365623289906392867;
  eddsa.Ax <== pk[0];
  eddsa.Ay <== pk[1];
  eddsa.R8x <== signature[0];
  eddsa.R8y <== signature[1];
  eddsa.S <== signature[2];

  component ecdh = Ecdh();
  ecdh.privateKey <== msk;
  ecdh.publicKey <== pk;

  sharedKey <== ecdh.sharedKey;
}

component main { public [pk, signature] } = IBE();
