pragma circom 2.1.4;

include "../utils/date.circom";

template Date() {
  signal input year;
  signal input month;
  signal input day;
  signal output out;

  out <-- dateToTimestamp(year, month, day);
}

component main { public [year, month, day] } = Date();
