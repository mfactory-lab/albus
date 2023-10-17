pragma circom 2.1.4;

include "../ageProof.circom";

component main { public [currentDate, minAge, maxAge] } = AgeProof();
