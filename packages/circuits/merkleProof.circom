pragma circom 2.1.4;

include "circomlib/circuits/smt/smtverifier.circom";

template MerkleProof(n, nLevels) {
    signal input root;
    signal input key[n];
    signal input value[n];
    signal input siblings[n][nLevels];

    component smt[n];
    for (var i = 0; i < n; i++) {
      smt[i] = SMTVerifier(nLevels);
      smt[i].enabled <== 1;
      smt[i].fnc <== 0; // Inclusion
      smt[i].root <== root;
      smt[i].siblings <== siblings[i];
      smt[i].oldKey <== 0;
      smt[i].oldValue <== 0;
      smt[i].isOld0 <== 0;
      smt[i].key <== key[i];
      smt[i].value <== value[i];
    }
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
