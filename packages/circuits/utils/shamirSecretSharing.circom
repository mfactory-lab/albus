pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";

/**
 * Circuit to generate Shamir's Secret Sharing shares.
 * It takes a secret and splits it into n fragments, of which k are needed to reconstruct the secret.
 *
 * https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing
 *
 * Parameters:
 *   n: number of shares to generate
 *   k: number of shares needed to reconstruct the secret
 */
template ShamirSecretSharing(n, k) {
    // the secret to be shared
    signal input secret;
    // random salt to generate the coefficients of the polynomial, it should be different for each new generation
    signal input salt;

    signal output shares[n];

    // check k <= n, otherwise the secret can not be recovered
    component parameterValidity = LessEqThan(128);
    parameterValidity.in[0] <== k;
    parameterValidity.in[1] <== n;
    parameterValidity.out === 1;

    // Generate the coefficients for the polynomial from the random salt
    component coefGen[k-1];
    for (var i = 0; i < k-1; i++) {
        coefGen[i] = Poseidon(3);
        coefGen[i].inputs[0] <== salt;
        coefGen[i].inputs[1] <== i;
        coefGen[i].inputs[2] <== secret;
    }

    // Generate the shares = points from the polynomial
    component polynomial = Polynomial(k, n);
    // input secret as the first coefficient and the rest from the coefGen
    // meaning that poly(0) = secret
    polynomial.coef[0] <== secret;
    for (var j = 1; j < k; j++) {
        polynomial.coef[j] <== coefGen[j-1].out;
    }
    // calculate shares for each institution, which is identified by it's index
    for (var i = 0; i < n; i++) {
        // input x = i+1 (ensuring that no share is f(0)=secret )
        polynomial.x[i] <== i+1;
    }
    // second loop to pass outputs because outputs are only available after all inputs are set
    for (var i = 0; i < n; i++) {
        shares[i] <== polynomial.y[i];
    }
}

/**
 * Polynomial with k coefficients (degree k-1) computing n points.
 * For each x, it computes y = Sum(coef[i] * x^i)
 *
 * Parameters:
 *   k: number of coefficients
 *   n: number of points to calculate
 */
template Polynomial(k, n) {
    signal input coef[k];
    signal input x[n];
    signal output y[n];

    // Calculate the polynomial by adding up terms
    // We can reduce the number of multiplication by a factor of 2 if we calculate the polynomial from the other side,
    // i.e. f(x) = a_0 + a_1x + a_2x^2 + a_3x^3 = a_0 + x(a_1 + x(a_2 + xa_3))
    signal summingUp[n][k+1];
    for (var pointIndex = 0; pointIndex < n; pointIndex++) {
        summingUp[pointIndex][0] <== coef[k-1];
        for (var i = 1; i < k; i++) {
            summingUp[pointIndex][i] <== summingUp[pointIndex][i-1] * x[pointIndex] + coef[k-i-1];
        }
        y[pointIndex] <== summingUp[pointIndex][k-1];
    }
}

//template Polynomial(k, n) {
//    signal input coef[k];
//    signal input x[n];
//    signal output y[n];
//
//    for (var i = 0; i < n; i++) {
//        var term = coef[k-1];
//        for (var j = k-2; j >= 0; j--) {
//            term = term * x[i] + coef[j];
//        }
//        y[i] <== term;
//    }
//}
