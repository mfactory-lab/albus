pragma circom 2.1.6;

include "../utils/claim.circom";
include "../utils/country.circom";
include "../utils/string.circom";
include "../utils/date.circom";

template Test() {
  signal input in;

  var ts = Str2Timestamp()(in);
  log(ts);
}

component main { public [in] } = Test();
