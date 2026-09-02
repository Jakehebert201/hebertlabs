import { CalcError, fmt } from '../core.js';

/**
 * `v.rows` is the ingredient list the page gathered out of its dynamic rows:
 * `[{ name, amount, unit }]`, all still strings exactly as typed, already
 * filtered down to the rows that have something in them.
 */
export function solveReduceEnlarge(v) {
  if (v.originalYield === null) throw new CalcError('Enter the quantity the formula makes.');
  if (v.originalYield <= 0) throw new CalcError('The original yield must be greater than zero.');
  if (v.desiredYield === null) throw new CalcError('Enter the quantity you want to make.');
  if (v.desiredYield <= 0) throw new CalcError('The desired yield must be greater than zero.');

  const yieldUnit = (v.yieldUnit || '').trim() || 'units';
  const rows = v.rows || [];

  if (!rows.length) throw new CalcError('Add at least one ingredient.');

  rows.forEach((row, index) => {
    const label = row.name || `Ingredient ${index + 1}`;

    if (!row.amount) {
      throw new CalcError(`${label} is missing an amount.`);
    }

    const amount = Number(row.amount);
    if (!Number.isFinite(amount)) {
      throw new CalcError(`${label} has an amount that is not a usable number.`);
    }
    if (amount < 0) {
      throw new CalcError(`${label} has a negative amount. Every quantity in a formula is positive.`);
    }
  });

  const factor = v.desiredYield / v.originalYield;
  const direction = factor < 1 ? 'reducing' : factor > 1 ? 'enlarging' : 'unchanged';

  const scaled = rows.map((row) => ({
    name: row.name || 'Unnamed ingredient',
    unit: row.unit,
    original: Number(row.amount),
    result: Number(row.amount) * factor,
  }));

  const steps = [
    {
      title: 'Work out the scaling factor',
      math: `factor = ${fmt(v.desiredYield)} ${yieldUnit} ÷ ${fmt(v.originalYield)} ${yieldUnit} = ${fmt(factor)}`,
      note:
        direction === 'unchanged'
          ? 'The two yields match, so nothing changes.'
          : `A factor ${direction === 'reducing' ? 'below' : 'above'} 1 means you are ${direction} the formula. The units cancel, so the factor is just a number.`,
    },
    {
      title: 'Multiply every ingredient by that factor',
      math: scaled
        .map(
          (item) =>
            `${item.name}: ${fmt(item.original)} ${item.unit} × ${fmt(factor)} = ${fmt(item.result)} ${item.unit}`
        )
        .join('\n'),
      note: 'The vehicle and any inactive ingredients scale too, not just the active one.',
    },
  ];

  // Only meaningful when the whole formula is measured in the yield's unit.
  const unitsMatch = scaled.every(
    (item) => item.unit.toLowerCase() === yieldUnit.toLowerCase()
  );

  if (unitsMatch) {
    const total = scaled.reduce((sum, item) => sum + item.result, 0);
    const closeEnough = Math.abs(total - v.desiredYield) < v.desiredYield * 0.005;

    steps.push({
      title: 'Add the scaled amounts back up as a check',
      math: `${scaled.map((item) => fmt(item.result)).join(' + ')} = ${fmt(total)} ${yieldUnit}`,
      note: closeEnough
        ? `That matches the ${fmt(v.desiredYield)} ${yieldUnit} you wanted, so nothing was missed.`
        : `This comes to ${fmt(total)} ${yieldUnit} rather than ${fmt(v.desiredYield)} ${yieldUnit}. Either the original formula does not add up to its stated yield, or an ingredient is missing.`,
    });
  }

  return {
    answer: `× ${fmt(factor)}`,
    answerLabel: 'Scaling factor',
    answerNote: `Apply this to all ${scaled.length} ingredient${scaled.length === 1 ? '' : 's'} to go from ${fmt(v.originalYield)} ${yieldUnit} to ${fmt(v.desiredYield)} ${yieldUnit}.`,
    steps,
    table: {
      headers: [
        'Ingredient',
        `Original (per ${fmt(v.originalYield)} ${yieldUnit})`,
        `Scaled (per ${fmt(v.desiredYield)} ${yieldUnit})`,
      ],
      rows: scaled.map((item) => [
        item.name,
        `${fmt(item.original)} ${item.unit}`,
        `${fmt(item.result)} ${item.unit}`,
      ]),
    },
  };
}
