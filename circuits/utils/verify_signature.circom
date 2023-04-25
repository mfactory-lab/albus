pragma circom 2.1.4;

include "circomlib/circuits/eddsaposeidon.circom";

template VerifySignature() {
    signal input sig[3]; // R8x, R8y, S
    signal input pubkey[2]; // [X, Y]
    signal input msg;

    // signature verification
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;

    sigVerifier.Ax <== pubkey[0];
    sigVerifier.Ay <== pubkey[1];

    sigVerifier.R8x <== sig[0];
    sigVerifier.R8y <== sig[1];
    sigVerifier.S <== sig[2];

    sigVerifier.M <== msg;
}

component main { public [ sig, pubkey ] } = VerifySignature();

/* INPUT = {"msg":"82069835506912659191815602240020612091293426632003209944305452141634334903565","sig":["5952523584392218201248144884555402669547419417576177636503341932143249234768","12335068115304283061076263509944654785202324930920094198847713422080918272907","2151695345395609168943575027378697058721888680115355344568673365181869869006"],"pubkey":["18105913904999972663281946061462853260907117580454436032442961065974227457811","6627540747126442455293798142077918452378818338467457275471195179600351157521"]} */
