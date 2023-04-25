pragma circom 2.1.4;

include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/poseidon.circom";

// k is length of preimage
template VerifyEdDSAPoseidon(k) {
    signal input from_x;
    signal input from_y;
    signal input R8x;
    signal input R8y;
    signal input S;
    // message that was signed is the hashed preimage
    signal input preimage[k];

    // hashing the preimage to generate the message
    component M = Poseidon(k);
    for (var i = 0; i < k; i++) {
        M.inputs[i] <== preimage[i];
    }

    component verifier = EdDSAPoseidonVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== from_x;
    verifier.Ay <== from_y;
    verifier.R8x <== R8x;
    verifier.R8y <== R8y;
    verifier.S <== S;
    verifier.M <== M.out;
}

// component main {public [from_x, from_y, R8x, R8y, S, M]} = VerifyEdDSAPoseidon();
