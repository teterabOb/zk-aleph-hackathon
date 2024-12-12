pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

template BalanceProof() {
    signal input balance, treshold;
    signal output result;

    signal diff;

    diff <== balance - treshold;

    component ge = GreaterEqThan(32);
    ge.in[0] <== diff;
    ge.in[1] <== 0;

    // Validamos que diff sea mayor que o igual que 0
    ge.out === 1;

    // Retornamos el resultado
    result <== ge.out;
}

component main = BalanceProof();