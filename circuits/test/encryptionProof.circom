pragma circom 2.1.4;

include "../encryptionProof.circom";

component main{public [trusteePublicKey, nonce]} = EncryptionProof(2, 3, 2);
