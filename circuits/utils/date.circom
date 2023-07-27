pragma circom 2.1.4;

/*
 Parse numerical date `20220101` to { y: 2022, m: 1, d: 1 }
*/
template ParseDate() {
  signal input date;
  signal output y;
  signal output m;
  signal output d;
  y <-- (date \ 10000) | 0;
  m <-- ((date \ 100) % 100) | 0;
  d <-- (date % 100) | 0;
}
