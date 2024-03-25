pragma circom 2.1.6;

include "ecdh.circom";
include "poseidon.circom";
include "shamirSecretSharing.circom";

template EncryptionProof(N, shamirN, shamirK) {
  signal input userPrivateKey;
  signal input trusteePublicKey[shamirN][2];

  signal input nonce;
  signal input secret;
  signal input data[N];

  signal output encryptedData[adjustToMultiple(N, 3) + 1];
  signal output encryptedShare[shamirN][4];

  // generate salt
  component salt = Poseidon(2);
  salt.inputs[0] <== userPrivateKey;
  salt.inputs[1] <== nonce;

  // distribute secret into multiple shares, one for each trustee
  component shamir = ShamirSecretSharing(shamirN, shamirK);
  shamir.secret <== secret;
  shamir.salt <== salt.out;

  // encrypt data with secret
  component dataEnc = PoseidonEncrypt(N);
  dataEnc.message <== data;
  dataEnc.nonce <== nonce;
  dataEnc.key <== [secret, secret];

  encryptedData <== dataEnc.ciphertext;

  component ecdh[shamirN];
  component share[shamirN];

  // encrypt shamir shares for each of the receiving trustee
  for (var i = 0; i < shamirN; i++) {
    // derive the symmetric encryption key
    ecdh[i] = Ecdh();
    ecdh[i].privateKey <== userPrivateKey;
    ecdh[i].publicKey <== trusteePublicKey[i];

    share[i] = PoseidonEncrypt(1);
    share[i].message[0] <== shamir.shares[i];
    share[i].nonce <== nonce;
    share[i].key <== ecdh[i].sharedKey;

    for (var j = 0; j < 4; j++) {
      encryptedShare[i][j] <== share[i].ciphertext[j];
    }
  }
}
