pragma circom 2.1.6;

include "../utils/date.circom";

template Date() {
  signal input timestamp;
  signal output out[3];

  out <-- timestampToDate(timestamp);
}

component main { public [timestamp] } = Date();
