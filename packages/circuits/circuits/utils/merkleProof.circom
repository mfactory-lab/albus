pragma circom 2.1.6;

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
