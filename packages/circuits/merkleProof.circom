pragma circom 2.1.4;

include "circomlib/circuits/smt/smtverifier.circom";

template MerkleProof(nLevels) {
    signal input key;
    signal input value;
    signal input root;
    signal input siblings[nLevels];

    component smt = SMTVerifier(nLevels);
    smt.enabled <== 1;
    smt.fnc <== 0; // Inclusion
    smt.root <== root;
    smt.siblings <== siblings;
    smt.oldKey <== 0;
    smt.oldValue <== 0;
    smt.isOld0 <== 0;
    smt.key <== key;
    smt.value <== value;
}

template NonMembershipProof(nLevels) {
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input key;
    signal input root;
    signal input siblings[nLevels];

    component smt = SMTVerifier(nLevels);
    smt.enabled <== 1;
    smt.fnc <== 1; // Non-inclusion
    smt.root <== root;
    smt.siblings <== siblings;
    smt.oldKey <== oldKey;
    smt.oldValue <== oldValue;
    smt.isOld0 <== isOld0;
    smt.key <== key;
    smt.value <== 0;
}
