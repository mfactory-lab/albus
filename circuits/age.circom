pragma circom 2.1.4;

include "circomlib/circuits/comparators.circom";

template VerifyAge() {
  signal input birthDate[3];
  signal input currentDate[3];
  signal input minAge;
  signal input maxAge;

  assert(birthDate[0] > 1900);

  // Data integrity check
  // component smt=SMTVerifier(10);
  // smt.enabled<==1;
  // smt.root<==credentialRoot;
  // smt.siblings<==siblings;
  // smt.key<==key;
  // smt.oldKey<==0;
  // smt.oldValue<==0;
  // smt.isOld0<==0;
  // smt.value<==attributes[1];
  // smt.fnc<==0;

  component date = calculateAge();
  date.currentDate <== currentDate;
  date.birthDate <== birthDate;

  component isGreater = GreaterEqThan(8);
  isGreater.in[0] <== date.age;
  isGreater.in[1] <== minAge;
  isGreater.out === 1;

  component isLess = LessEqThan(8);
  isLess.in[0] <== date.age;
  isLess.in[1] <== maxAge;
  isLess.out === 1;
}

template calculateAge() {
  signal input currentDate[3];
  signal input birthDate[3];
  signal output age;

  component gteY = GreaterEqThan(32);
  gteY.in[0] <== currentDate[0];
  gteY.in[1] <== birthDate[0];
  gteY.out === 1;

  var yearDiff = currentDate[0] - birthDate[0];

  component ltM = LessThan(32);
  ltM.in[0] <== currentDate[1] * 100 + currentDate[2];
  ltM.in[1] <== birthDate[1] * 100 + birthDate[2];

  component gte0 = GreaterEqThan(32);
  gte0.in[0] <== yearDiff - ltM.out;
  gte0.in[1] <== 0;
  gte0.out === 1;

  age <== yearDiff - ltM.out;
}

component main{public [
  currentDate,
  minAge,
  maxAge
]} = VerifyAge();


/* INPUT = {
  "currentDate": ["2023", "03", "08"],
  "birthDate": ["2002", "03", "09"],
  "minAge": 18,
  "maxAge": 100
} */
