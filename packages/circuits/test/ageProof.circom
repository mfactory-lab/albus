pragma circom 2.1.6;

include "../ageProof.circom";

component main { public [currentDate, minAge, maxAge] } = AgeProof();
