pragma circom 2.1.4;

include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/poseidon.circom";

// n - is length of preimage
template VerifyEdDSAPoseidon(n) {
    signal input from_x;
    signal input from_y;
    signal input R8x;
    signal input R8y;
    signal input S;

    // message that was signed is the hashed preimage
    signal input preimage[n];

    // hashing the preimage to generate the message
    component M = Poseidon(n);
    M.inputs <== preimage;

    component verifier = EdDSAPoseidonVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== from_x;
    verifier.Ay <== from_y;
    verifier.R8x <== R8x;
    verifier.R8y <== R8y;
    verifier.S <== S;
    verifier.M <== M.out;
}
