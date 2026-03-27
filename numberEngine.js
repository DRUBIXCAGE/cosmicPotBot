function reduceNumber(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num
      .toString()
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

// 🧿 FLEXIBLE DOB PARSER
function parseDOB(dob) {
  const cleaned = dob.replace(/[\/\s]/g, '-');
  const parts = cleaned.split('-');

  if (parts.length !== 3) return null;

  let [day, month, year] = parts;

  if (year.length === 2) year = "19" + year;

  if (day.length === 1) day = "0" + day;
  if (month.length === 1) month = "0" + month;

  return {
    day: Number(day),
    month: Number(month),
    year: Number(year),
    raw: `${day}-${month}-${year}`
  };
}

// 🧿 MAIN ENGINE
function getFullNumerology(dob) {
  const parsed = parseDOB(dob);

  if (!parsed) return null;

  const { day, month, year } = parsed;

  // 🔢 Birth Number
  const birth = reduceNumber(day);

  // 🔢 Destiny Number (FIXED)
  const fullDOB = `${day.toString().padStart(2, '0')}${month
    .toString()
    .padStart(2, '0')}${year}`;

  const destiny = reduceNumber(
    fullDOB.split('').reduce((a, b) => a + Number(b), 0)
  );

  // 🔢 Attitude & Maturity
  const attitude = reduceNumber(day + month);
  const maturity = reduceNumber(birth + destiny);

  // 🕒 Time Energy
  const now = new Date();

  const currentYear = now.getFullYear();

  const personalYear = reduceNumber(
    `${day}${month}${currentYear}`
      .split('')
      .reduce((a, b) => a + Number(b), 0)
  );

  const personalMonth = reduceNumber(
    personalYear + (now.getMonth() + 1)
  );

  const personalDay = reduceNumber(
    personalMonth + now.getDate()
  );

  return {
    birth,
    destiny,
    attitude,
    maturity,
    personalYear,
    personalMonth,
    personalDay,
    formattedDOB: parsed.raw
  };
}

module.exports = { getFullNumerology };
