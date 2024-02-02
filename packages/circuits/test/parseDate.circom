pragma circom 2.1.6;

include "../utils/date.circom";

template Date() {
  signal input date;
  signal output out[3];
  out <== ParseDate()(date);
}

component main { public [date] } = Date();
