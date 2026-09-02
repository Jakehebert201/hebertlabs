import { CalcError, fmt } from '../core.js';

const kinds = {
  'w/v': {
    amountUnit: 'g',
    totalUnit: 'mL',
    meaning: 'grams of ingredient in every 100 mL of finished preparation',
  },
  'w/w': {
    amountUnit: 'g',
    totalUnit: 'g',
    meaning: 'grams of ingredient in every 100 g of finished preparation',
  },
  'v/v': {
    amountUnit: 'mL',
    totalUnit: 'mL',
    meaning: 'milliliters of ingredient in every 100 mL of finished preparation',
  },
};

export function solvePercentageStrength(v) {
  const kind = kinds[v.kind] ? v.kind : 'w/v';
  const { amountUnit, totalUnit, meaning } = kinds[kind];

  const keys = ['percent', 'amount', 'total'];
  const provided = keys.filter((k) => v[k] !== null);

  if (provided.length < 2) throw new CalcError('Fill in two of the three boxes.');
  if (provided.length === 3) {
    throw new CalcError(
      'All three boxes are filled. Clear the one you want to solve for.'
    );
  }

  const unknown = keys.find((k) => v[k] === null);
  const sameUnits = amountUnit === totalUnit;

  // Each supplied box must be positive. This also keeps the divisions
  // below safe whichever box was left empty.
  const boxName = {
    percent: 'percentage strength',
    amount: 'amount of active ingredient',
    total: 'total quantity of preparation',
  };
  for (const key of keys) {
    if (key === unknown) continue;
    if (v[key] <= 0) {
      throw new CalcError(`The ${boxName[key]} must be greater than zero.`);
    }
  }

  let answer;
  let answerUnit;
  let chain;
  let setupNote;
  let arithmetic;

  if (unknown === 'amount') {
    answer = (v.percent / 100) * v.total;
    answerUnit = amountUnit;
    chain = {
      start: { value: fmt(v.total), unit: totalUnit, canceled: true },
      factors: [
        {
          num: { value: fmt(v.percent), unit: amountUnit },
          den: { value: '100', unit: totalUnit, canceled: true },
        },
      ],
    };
    setupNote = `${totalUnit} goes on the bottom of the factor so it cancels against the ${fmt(v.total)} ${totalUnit} you started with, leaving ${amountUnit}.`;
    arithmetic = `(${fmt(v.total)} × ${fmt(v.percent)}) ÷ 100  =  ${fmt(answer)} ${amountUnit}`;
  } else if (unknown === 'total') {
    answer = (v.amount * 100) / v.percent;
    answerUnit = totalUnit;
    chain = {
      start: { value: fmt(v.amount), unit: amountUnit, canceled: true },
      factors: [
        {
          num: { value: '100', unit: totalUnit },
          den: { value: fmt(v.percent), unit: amountUnit, canceled: true },
        },
      ],
    };
    setupNote = `This time the factor is flipped, so ${amountUnit} lands on the bottom and cancels, leaving ${totalUnit}.`;
    arithmetic = `(${fmt(v.amount)} × 100) ÷ ${fmt(v.percent)}  =  ${fmt(answer)} ${totalUnit}`;
  } else {
    answer = (v.amount / v.total) * 100;
    answerUnit = `% ${kind}`;
    chain = {
      start: { value: '100', unit: totalUnit, canceled: true },
      factors: [
        {
          num: { value: fmt(v.amount), unit: amountUnit },
          den: { value: fmt(v.total), unit: totalUnit, canceled: true },
        },
      ],
    };
    setupNote = `Percent is asking how much ingredient sits in 100 ${totalUnit}, so start with 100 ${totalUnit} and cancel down to ${amountUnit}.`;
    arithmetic = `(100 × ${fmt(v.amount)}) ÷ ${fmt(v.total)}  =  ${fmt(answer)} ${amountUnit} per 100 ${totalUnit}`;
  }

  const finalPercent = unknown === 'percent' ? answer : v.percent;
  const finalAmount = unknown === 'amount' ? answer : v.amount;

  const notes = [];

  // Computed rather than blocked: the arithmetic is still sound, and a
  // student may well be checking exactly this case.
  if (finalPercent > 100) {
    notes.push(
      kind === 'w/v'
        ? `Careful: ${fmt(finalPercent)}% w/v means more than 100 g in 100 mL, which needs a preparation much denser than water. Double-check the figures.`
        : `Careful: ${fmt(finalPercent)}% ${kind} is not physically possible — it says there is more ingredient than finished preparation.`
    );
  }

  if (kind === 'w/v') notes.push(`That strength is ${fmt(finalPercent * 10)} mg/mL.`);
  if (finalAmount !== null && finalAmount < 1) {
    // v/v measures the ingredient as a volume, so the small unit is µL not mg.
    const smallUnit = amountUnit === 'mL' ? 'µL' : 'mg';
    notes.push(`${fmt(finalAmount * 1000)} ${smallUnit} is usually the easier way to measure it.`);
  }

  const steps = [
    unknown === 'percent'
      ? {
          title: 'Work out what the percentage is asking for',
          math: `? % ${kind}  means  ? ${amountUnit} per 100 ${totalUnit}`,
          note: `The percentage is the number of ${amountUnit} in 100 ${totalUnit}. You do not have a factor to multiply by yet — you are building one.`,
        }
      : {
          title: 'Turn the percentage into a conversion factor',
          math: `${fmt(finalPercent)}% ${kind}  means  ${fmt(finalPercent)} ${amountUnit} per 100 ${totalUnit}`,
          note: `In other words, ${meaning}.`,
        },
    {
      title: 'Multiply, with the unwanted unit on the bottom',
      chain,
      note: setupNote,
    },
  ];

  if (sameUnits) {
    const unitWord = amountUnit === 'mL' ? 'milliliters' : 'grams';
    steps.push({
      title: `Both units are ${amountUnit} — keep track of which is which`,
      math: `${amountUnit} of preparation cancels\n${amountUnit} of ingredient survives`,
      note: `In a ${kind} problem the ${unitWord} on the bottom are ${unitWord} of finished preparation, and the ${unitWord} on top are ${unitWord} of active ingredient. They cancel because they are both ${amountUnit}, but they are not the same thing.`,
    });
  }

  steps.push({
    title: 'Do the arithmetic',
    math: arithmetic,
  });

  if (unknown === 'percent') {
    steps.push({
      title: 'Read it as a percentage',
      math: `${fmt(answer)} ${amountUnit} per 100 ${totalUnit}  =  ${fmt(answer)}% ${kind}`,
      note: 'Anything measured per 100 is already a percentage — there is no final conversion to do.',
    });
  }

  return {
    answer: `${fmt(answer)} ${answerUnit}`,
    answerLabel: `Solved for ${unknown === 'total' ? 'total quantity' : unknown}`,
    answerNote: notes.join(' ') || undefined,
    steps,
  };
}
