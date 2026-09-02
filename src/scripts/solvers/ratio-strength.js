import { CalcError, fmt } from '../core.js';

// `base` is the unit the concentration is quoted per (1 L or 1 kg).
// `sub` is a thousandth of it, which is what you actually measure with.
const bases = {
  'w/v': { solute: 'g', milli: 'mg', micro: 'mcg', base: 'L', sub: 'mL' },
  'w/w': { solute: 'g', milli: 'mg', micro: 'mcg', base: 'kg', sub: 'g' },
  'v/v': { solute: 'mL', milli: 'µL', micro: 'nL', base: 'L', sub: 'mL' },
};

export function solveRatioStrength(v) {
  const basis = bases[v.basis] ? v.basis : 'w/v';
  const { solute, milli, micro, base, sub } = bases[basis];

  if (v.value === null) throw new CalcError('Enter the value you were given.');
  if (v.value <= 0) throw new CalcError('The value must be greater than zero.');

  const report = v.report === 'ppb' ? 'ppb' : 'ppm';
  const reportUnit = report === 'ppm' ? milli : micro;
  const reportLabel = `${reportUnit}/${base}`;

  // Everything normalizes to solute base units per prep base unit (g/L).
  let perBase;
  let meaning;

  if (v.known === 'ratio') {
    if (v.value < 1) {
      throw new CalcError(
        'A ratio strength of 1 : X needs X to be at least 1, because it means one part of ingredient in X parts of preparation. For anything stronger than 1 : 1, use percentage strength instead.'
      );
    }
    perBase = 1000 / v.value;
    meaning = `A ratio strength of 1 : ${fmt(v.value)} ${basis} means 1 ${solute} of ingredient in ${fmt(v.value)} ${sub} of preparation.`;
  } else if (v.known === 'percent') {
    perBase = v.value * 10;
    meaning = `${fmt(v.value)}% ${basis} means ${fmt(v.value)} ${solute} of ingredient in every 100 ${sub} of preparation.`;
  } else if (v.known === 'ppm') {
    perBase = v.value / 1000;
    meaning = `${fmt(v.value)} ppm means ${fmt(v.value)} ${milli} in every 1 ${base} — that is what ppm is.`;
  } else if (v.known === 'ppb') {
    perBase = v.value / 1e6;
    meaning = `${fmt(v.value)} ppb means ${fmt(v.value)} ${micro} in every 1 ${base} — that is what ppb is.`;
  } else {
    perBase = v.value;
    meaning = `${fmt(v.value)} ${milli}/${sub} means ${fmt(v.value)} ${milli} in every 1 ${sub} of preparation.`;
  }

  if (!Number.isFinite(perBase) || perBase <= 0) {
    throw new CalcError('That value does not produce a usable concentration.');
  }

  const ppm = perBase * 1000;
  const ppb = perBase * 1e6;
  const percent = perBase / 10;
  const ratioX = 1000 / perBase;
  const reportValue = report === 'ppm' ? ppm : ppb;

  // Build the factor chain that turns 1 base unit into the reporting unit.
  // Every denominator cancels, and every numerator cancels except the last.
  const factors = [];
  const perThousand = { value: '1000 ', unit: sub };
  const oneBase = { value: '1 ', unit: base };

  if (v.known === 'ratio') {
    factors.push({ num: perThousand, den: oneBase });
    factors.push({
      num: { value: '1 ', unit: solute },
      den: { value: `${fmt(v.value)} `, unit: sub },
    });
    factors.push({
      num: { value: `${report === 'ppm' ? '1000' : '1000000'} `, unit: reportUnit },
      den: { value: '1 ', unit: solute },
    });
  } else if (v.known === 'percent') {
    factors.push({ num: perThousand, den: oneBase });
    factors.push({
      num: { value: `${fmt(v.value)} `, unit: solute },
      den: { value: '100 ', unit: sub },
    });
    factors.push({
      num: { value: `${report === 'ppm' ? '1000' : '1000000'} `, unit: reportUnit },
      den: { value: '1 ', unit: solute },
    });
  } else if (v.known === 'conc') {
    factors.push({ num: perThousand, den: oneBase });
    factors.push({
      num: { value: `${fmt(v.value)} `, unit: milli },
      den: { value: '1 ', unit: sub },
    });
    if (report === 'ppb') {
      factors.push({
        num: { value: '1000 ', unit: micro },
        den: { value: '1 ', unit: milli },
      });
    }
  } else if (v.known === 'ppm') {
    factors.push({
      num: { value: `${fmt(v.value)} `, unit: milli },
      den: oneBase,
    });
    if (report === 'ppb') {
      factors.push({
        num: { value: '1000 ', unit: micro },
        den: { value: '1 ', unit: milli },
      });
    }
  } else {
    factors.push({
      num: { value: `${fmt(v.value)} `, unit: micro },
      den: oneBase,
    });
    if (report === 'ppm') {
      factors.push({
        num: { value: '1 ', unit: milli },
        den: { value: '1000 ', unit: micro },
      });
    }
  }

  const marked = factors.map((factor, index) => ({
    num: { ...factor.num, canceled: index < factors.length - 1 },
    den: { ...factor.den, canceled: true },
  }));

  const steps = [
    {
      title: 'Read what you were given as a plain statement',
      math: meaning,
    },
    {
      title: `Ask how much sits in 1 ${base}, and cancel your way there`,
      chain: { start: { value: '1 ', unit: base, canceled: true }, factors: marked },
      note: `Each factor is chosen so the unit you no longer want lands on the bottom. Only ${reportUnit} survives.`,
    },
    {
      title: 'Read the surviving number',
      math: `${fmt(reportValue)} ${reportUnit} in 1 ${base}  =  ${fmt(reportValue)} ${reportLabel}  =  ${fmt(reportValue)} ${report}`,
      note: `1 ${reportLabel} is one part per ${report === 'ppm' ? 'million' : 'billion'}, so the number you just worked out is already the answer in ${report}.`,
    },
    {
      title: 'Derive the percentage strength the same way',
      chain: {
        start: { value: '100 ', unit: sub, canceled: true },
        factors: [
          {
            num: { value: `${fmt(perBase)} `, unit: solute },
            den: { value: '1000 ', unit: sub, canceled: true },
          },
        ],
      },
      note: `Percent means "per 100 ${sub}", so ask how much solute is in 100 ${sub}. The answer, ${fmt(percent)} ${solute}, is the percentage strength: ${fmt(percent)}% ${basis}.`,
    },
    {
      title: 'Derive the ratio strength the same way',
      chain: {
        start: { value: `1 `, unit: solute, canceled: true },
        factors: [
          {
            num: { value: '1000 ', unit: sub },
            den: { value: `${fmt(perBase)} `, unit: solute, canceled: true },
          },
        ],
      },
      note: `Ratio strength asks the reverse question: 1 ${solute} of ingredient sits in how many ${sub}? That gives 1 : ${fmt(ratioX)}.`,
    },
  ];

  const rows = [
    ['Parts per million', `${fmt(ppm)} ppm`],
    [`The same thing in ${milli}/${base}`, `${fmt(ppm)} ${milli}/${base}`],
    ['Parts per billion', `${fmt(ppb)} ppb`],
    [`The same thing in ${micro}/${base}`, `${fmt(ppb)} ${micro}/${base}`],
    ['Percentage strength', `${fmt(percent)} % ${basis}`],
    ['Ratio strength', `1 : ${fmt(ratioX)}`],
    ['Concentration', `${fmt(perBase)} ${milli}/${sub}`],
  ];

  if (v.quantity !== null) {
    if (v.quantity <= 0) {
      throw new CalcError('Total quantity must be greater than zero.');
    }

    const active = (v.quantity * perBase) / 1000;

    steps.push({
      title: `Work out how much to measure for ${fmt(v.quantity)} ${sub}`,
      chain: {
        start: { value: `${fmt(v.quantity)} `, unit: sub, canceled: true },
        factors: [
          {
            num: { value: `${fmt(perBase)} `, unit: solute },
            den: { value: '1000 ', unit: sub, canceled: true },
          },
        ],
      },
      note:
        active < 1
          ? `You need ${fmt(active)} ${solute}, which is ${fmt(active * 1000)} ${milli}. That is usually too little to weigh directly — you would make it from a stock solution or an aliquot.`
          : `You need ${fmt(active)} ${solute}.`,
    });

    rows.push([`Ingredient in ${fmt(v.quantity)} ${sub}`, `${fmt(active)} ${solute}`]);
  }

  return {
    answer: `${fmt(reportValue)} ${report}  =  ${fmt(reportValue)} ${reportLabel}`,
    answerLabel: 'Concentration',
    answerNote:
      percent > 100
        ? `Careful: this works out to ${fmt(percent)}% ${basis}, which is more ingredient than preparation. Check the value you entered.`
        : `Also ${fmt(percent)}% ${basis}, or a ratio strength of 1 : ${fmt(ratioX)}.`,
    steps,
    table: { headers: ['Expressed as', 'Value'], rows },
  };
}
