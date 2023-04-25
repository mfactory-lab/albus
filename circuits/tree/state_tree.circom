pragma circom 2.1.4;

include "circomlib/circuits/smt/smtprocessor.circom";
include "circomlib/circuits/smt/smtverifier.circom";

template Membership(nLevels) {
    signal input key;
    signal input value;
    signal input root;
    signal input enabled;
    signal input siblings[nLevels];

    var i;
    // VERIFY Inclusion
    component smtverifier = SMTVerifier(nLevels);
    smtverifier.enabled <== enabled;
    smtverifier.root <== root;
    for (i=0; i<nLevels; i++) {
        smtverifier.siblings[i] <== siblings[i];
    }
    smtverifier.oldKey <== 0;
    smtverifier.oldValue <== 0;
    smtverifier.isOld0 <== 0;
    smtverifier.key <== key;
    smtverifier.value <== value;
    smtverifier.fnc <== 0;
}

template NonMembershipUpdate(nLevels) {
    signal input oldRoot;
    signal input newRoot;
    signal input siblings[nLevels];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input newKey;
    signal input newValue;

    assert(nLevels > 2);
    // VERIFY Exclusion
    component smtverifier = SMTVerifier(nLevels);
    smtverifier.enabled <== 1;
    smtverifier.root <== oldRoot;
    var i;
    for (i=0; i<nLevels;i++) {
        smtverifier.siblings[i] <== siblings[i];
    }
    smtverifier.oldKey <== oldKey;
    smtverifier.oldValue <== oldValue;
    smtverifier.isOld0 <== isOld0;
    smtverifier.key <== newKey;
    smtverifier.value <== 0;
    smtverifier.fnc <== 1;

    // insert
    component processor = SMTProcessor(nLevels);
    processor.oldRoot <== oldRoot;
    for (i=0; i<nLevels; i++) {
        processor.siblings[i] <== siblings[i];
    }
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newValue;
    processor.fnc[0] <== 1;
    processor.fnc[1] <== 0;

    processor.newRoot === newRoot;
}
