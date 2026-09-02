import { CalcError, fmt } from '../core.js';

// Strip a plural 's' only when at least two characters survive. That keeps
// lbs/lb, tabs/tab and tsps/tsp cancelling, without letting 'ms' collapse
// onto 'm' or 's' collapse to nothing.
const normalize = (unit) => {
  const base = unit.trim().toLowerCase();
  return base.length > 2 && base.endsWith('s') ? base.slice(0, -1) : base;
};

/**
 * `v.factors` is the conversion-factor list the page gathered out of its
 * dynamic rows: `[{ numValue, numUnit, denValue, denUnit }]`, all still
 * strings exactly as typed, already filtered down to the non-blank rows.
 */
export function solveDimensionalAnalysis(v) {
  const startValue = v.startValue;
  const startUnit = (v.startUnit || '').trim();

  if (startValue === null) throw new CalcError('Enter the amount you are starting with.');
  if (startValue < 0) {
    throw new CalcError('The starting amount cannot be negative.');
  }
  if (!startUnit) throw new CalcError('Enter the unit you are starting with.');

  const factors = v.factors || [];
  if (!factors.length) {
    throw new CalcError('Add at least one conversion factor.');
  }

  factors.forEach((factor, index) => {
    const position = `Factor ${index + 1}`;
    if (!factor.numValue || !factor.numUnit) {
      throw new CalcError(`${position} is missing its top amount or unit.`);
    }
    if (!factor.denValue || !factor.denUnit) {
      throw new CalcError(`${position} is missing its bottom amount or unit.`);
    }
    const top = Number(factor.numValue);
    const bottom = Number(factor.denValue);

    if (!Number.isFinite(top) || !Number.isFinite(bottom)) {
      throw new CalcError(`${position} has an amount that is not a usable number.`);
    }
    if (bottom === 0) {
      throw new CalcError(`${position} has zero on the bottom — that would divide by zero.`);
    }
    if (top <= 0 || bottom < 0) {
      throw new CalcError(
        `${position} needs positive amounts on both sides. A conversion factor says two quantities are the same, so neither can be zero or negative.`
      );
    }
  });

  // Work out which units cancel against which.
  const numerators = [
    { unit: startUnit, key: 'start' },
    ...factors.map((f, i) => ({ unit: f.numUnit, key: `num:${i}` })),
  ];
  const denominators = factors.map((f, i) => ({ unit: f.denUnit, key: `den:${i}` }));

  const canceled = new Set();
  for (const den of denominators) {
    const match = numerators.find(
      (n) => !canceled.has(n.key) && normalize(n.unit) === normalize(den.unit)
    );
    if (match) {
      canceled.add(match.key);
      canceled.add(den.key);
    }
  }

  const survivingNum = numerators.filter((n) => !canceled.has(n.key)).map((n) => n.unit);
  const survivingDen = denominators.filter((d) => !canceled.has(d.key)).map((d) => d.unit);

  let finalUnit = survivingNum.join('·') || '1';
  if (survivingDen.length) finalUnit += `/${survivingDen.join('·')}`;

  // Do the arithmetic.
  const topNumbers = [startValue, ...factors.map((f) => Number(f.numValue))];
  const bottomNumbers = factors.map((f) => Number(f.denValue));

  const topProduct = topNumbers.reduce((acc, n) => acc * n, 1);
  const bottomProduct = bottomNumbers.reduce((acc, n) => acc * n, 1);
  const answer = topProduct / bottomProduct;

  const target = (v.targetUnit || '').trim();
  const matchesTarget = target
    ? normalize(target) === normalize(finalUnit)
    : null;

  let answerNote;
  if (matchesTarget === true) {
    answerNote = `The units canceled down to ${finalUnit}, which is exactly what you were aiming for.`;
  } else if (matchesTarget === false) {
    answerNote = `Heads up: you asked for ${target}, but these factors leave you with ${finalUnit}. One of them is probably upside down, or you need another conversion.`;
  }

  const steps = [
    {
      title: 'Write the chain out',
      chain: {
        start: { value: fmt(startValue), unit: startUnit, canceled: canceled.has('start') },
        factors: factors.map((factor, index) => ({
          num: {
            value: fmt(Number(factor.numValue)),
            unit: factor.numUnit,
            canceled: canceled.has(`num:${index}`),
          },
          den: {
            value: fmt(Number(factor.denValue)),
            unit: factor.denUnit,
            canceled: canceled.has(`den:${index}`),
          },
        })),
      },
      note: 'Struck-through units cancel against each other.',
    },
    {
      title: 'Check what survives',
      math:
        survivingDen.length || survivingNum.length > 1
          ? `Left on top: ${survivingNum.join(', ') || 'nothing'}\nLeft on bottom: ${survivingDen.join(', ') || 'nothing'}\nFinal unit: ${finalUnit}`
          : `Everything cancels except ${finalUnit}.`,
      note:
        survivingNum.length + survivingDen.length > 1
          ? 'More than one unit survived. That usually means a factor is flipped or one is missing.'
          : 'A single surviving unit is a good sign that the setup is right.',
    },
    {
      title: 'Multiply everything on top',
      math: `${topNumbers.map((n) => fmt(n)).join(' × ')} = ${fmt(topProduct)}`,
    },
    {
      title: 'Multiply everything on the bottom',
      math: `${bottomNumbers.map((n) => fmt(n)).join(' × ')} = ${fmt(bottomProduct)}`,
    },
    {
      title: 'Divide',
      math: `${fmt(topProduct)} ÷ ${fmt(bottomProduct)} = ${fmt(answer)} ${finalUnit}`,
    },
  ];

  return {
    answer: `${fmt(answer)} ${finalUnit}`,
    answerLabel: 'Result',
    answerNote,
    steps,
  };
}
