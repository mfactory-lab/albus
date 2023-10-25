pragma circom 2.1.4;

/**
 * Convert number date `20220101` to date array `[2022, 01, 01]`
 */
function numToDate(date) {
  return [(date \ 10000) | 0, ((date \ 100) % 100) | 0, (date % 100) | 0];
}

/**
 * Convert date array `[2022, 01, 01]` to a number `20220101`
 */
function dateToNum(d) {
  return d[0] * 10000 + d[1] * 100 + d[2];
}

/**
 * Convert date to unix timestamp
 */
function dateToTimestamp(year, month, day) {
  var secondsInDay = 86400;
  var totalSeconds = 0;

  // Calculate seconds for years
  for (var y = 1970; y < year; y++) {
    totalSeconds += secondsInYear(y);
  }

  // Calculate seconds for months
  for (var m = 1; m < month; m++) {
    totalSeconds += daysInMonth(m, year) * secondsInDay;
  }

  // Calculate seconds for days
  totalSeconds += (day - 1) * secondsInDay;

  return totalSeconds;
}

/**
 * Convert unix timestamp to date
 */
function timestampToDate(timestamp) {
  var seconds = timestamp;
  var year = 1970;
  var month = 1;
  var day = 1;

  assert(timestamp < 4294967295);

  var secondsInDay = 86400;

  var _secondsInYear = 0;
  while (seconds >= _secondsInYear) {
      _secondsInYear = secondsInYear(year);
      if (seconds >= _secondsInYear) {
        seconds -= _secondsInYear;
        year++;
      }
  }

  var _secondsInMonth = 0;
  while (seconds >= _secondsInMonth) {
      _secondsInMonth = daysInMonth(month, year) * secondsInDay;
      if (seconds >= _secondsInMonth) {
        seconds -= _secondsInMonth;
        month++;
      }
  }

  if (seconds >= secondsInDay) {
      day = (seconds \ secondsInDay) + 1;
  }

  return [year, month, day];
}

function isLeapYear(year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

function secondsInYear(year) {
  return 31536000 + isLeapYear(year) * 86400;
}

function daysInMonth(month, year) {
  var daysPerMonth[12] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(year)) {
    daysPerMonth[1] = 29;
  }
  return daysPerMonth[month-1];
}
