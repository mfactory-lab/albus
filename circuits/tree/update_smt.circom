pragma circom 2.1.4;

include "circomlib/circuits/eddsaposeidon.circom";
include "circomlib/circuits/smt/smtprocessor.circom";

template UpdateSmt(nLevels) {
    // Signature verification

    signal input pubkey[2]; // [X, Y]
    signal input sig[3]; // R8x, R8y, S
    signal input msg;

    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== pubkey[0];
    sigVerifier.Ay <== pubkey[1];
    sigVerifier.R8x <== sig[0];
    sigVerifier.R8y <== sig[1];
    sigVerifier.S <== sig[2];
    sigVerifier.M <== msg;

    // SMT update

    signal input oldRoot;
    signal input siblings[nLevels];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input newKey;
    signal input newValue;
    signal input newRoot;
    // signal output newRoot;

    component processor = SMTProcessor(nLevels);
    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newValue;

    // Table processor functions:
    // | func[0] | func[1] | Function |
    // |:-------:|:-------:|:--------:|
    // |    0    |    0    |   NOP    |
    // |    0    |    1    |  UPDATE  |
    // |    1    |    0    |  INSERT  |
    // |    1    |    1    |  DELETE  |

    processor.fnc[0] <== 1;
    processor.fnc[1] <== 0;

    processor.newRoot === newRoot;
}

component main { public [ newRoot, oldRoot ] } = UpdateSmt(10);

/* INPUT = {"msg":"91872656076256184680616041791457496951526353349983489972176832065911493339689","sig":["20986539734375926324490786828213736996191916798486946342916390348990532730805","17137839493911804612090616990786185865621565147531088434468000672025852552848","894413178458815922828478453398509978890915140881792958043060071710228827230"],"pubkey":["14689536537325923785288586270905679364284135552565329566314727795448915442369","5523144577134423566248557522839171638650161446531028888796431702820798256603"],"oldRoot":"3108394280857290448796042949317662357879960495408018998613518544538624657019","newRoot":"1196248602710096152905934331233600096186331132814769184665175482114192852953","oldKey":"0","oldValue":"0","newKey":1,"newValue":"3437574522461586532991739822679610523679196174348657301010685412714741789804","siblings":[0,0,0,0,0,0,0,0,0,0],"isOld0":0} */
