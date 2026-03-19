function reduceNumber(num) {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split('').reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

function parseDOB(dob) {
  const [day, month, year] = dob.split('-').map(Number);
  return { day, month, year };
}

function getFullNumerology(dob) {
  const { day, month, year } = parseDOB(dob);

  const birth = reduceNumber(day);

  const destiny = reduceNumber(
    `${day}${month}${year}`.split('').reduce((a, b) => a + Number(b), 0)
  );

  const attitude = reduceNumber(day + month);
  const maturity = reduceNumber(birth + destiny);

  const now = new Date();
  const personalYear = reduceNumber(
    `${day}${month}${now.getFullYear()}`
      .split('')
      .reduce((a, b) => a + Number(b), 0)
  );

  const personalMonth = reduceNumber(personalYear + (now.getMonth() + 1));
  const personalDay = reduceNumber(personalMonth + now.getDate());

  return {
    birth,
    destiny,
    attitude,
    maturity,
    personalYear,
    personalMonth,
    personalDay
  };
}

module.exports = { getFullNumerology };
