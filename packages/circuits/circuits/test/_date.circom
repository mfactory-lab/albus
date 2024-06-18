pragma circom 2.1.6;

include "../utils/date.circom";

template TimestampToDate() {
  signal input in;
  signal output out[3];
  out <-- timestampToDate(in);
}

template DateToTimestamp() {
  signal input in[3];
  signal output out;
  out <-- dateToTimestamp(in[0], in[1], in[2]);
}
