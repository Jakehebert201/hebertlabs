import { CalcError, fmt } from '../core.js';

/**
 * Alligation calculator.
 *
 * `v.mode` is `alternate` (mix two strengths to hit a desired one) or
 * `medial` (weighted average of known quantities at known strengths).
 *
 * For medial, `v.rows` is gathered by the page from its dynamic list:
 * `[{ name, strength, quantity }]`, still strings, already filtered to
 * rows that have something typed.
 */
export function solveAlligations(v) {
  const mode = v.mode || 'alternate';

  if (mode === 'medial') return solveMedial(v);
  return solveAlternate(v);
}

function unitLabel(raw, fallback) {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || fallback;
}

/** Percentages read as `70%`; every other unit keeps a space (`70 mL`). */
function withUnit(value, unit) {
  const shown = fmt(value);
  return unit === '%' ? `${shown}%` : `${shown} ${unit}`;
}

function solveAlternate(v) {
  const strengthUnit = unitLabel(v.strengthUnit, '%');
  const qtyUnit = unitLabel(v.qtyUnit, 'mL');

  if (v.high === null) {
    throw new CalcError('Enter the higher strength.');
  }
  if (v.low === null) {
    throw new CalcError('Enter the lower strength.');
  }
  if (v.desired === null) {
    throw new CalcError('Enter the desired strength.');
  }

  if (v.high < 0) {
    throw new CalcError('The higher strength cannot be negative.');
  }
  if (v.low < 0) {
    throw new CalcError(
      'The lower strength cannot be negative. Use 0 when the weaker component is a diluent with no active ingredient, like purified water.'
    );
  }
  if (v.desired < 0) {
    throw new CalcError('The desired strength cannot be negative.');
  }

  if (v.high === v.low) {
    throw new CalcError(
      'The higher and lower strengths are the same. Alligation alternate needs two different strengths to mix.'
    );
  }

  // Courses always put the stronger stock on top. If the boxes are swapped,
  // say so rather than silently rearranging, so the student sees the setup.
  if (v.high < v.low) {
    throw new CalcError(
      `The higher strength (${withUnit(v.high, strengthUnit)}) is below the lower strength (${withUnit(v.low, strengthUnit)}). Put the stronger preparation in the higher box.`
    );
  }

  if (v.desired >= v.high || v.desired <= v.low) {
    throw new CalcError(
      `The desired strength has to sit strictly between ${withUnit(v.low, strengthUnit)} and ${withUnit(v.high, strengthUnit)}. Mixing those two cannot produce ${withUnit(v.desired, strengthUnit)}.`
    );
  }

  if (v.total !== null && v.total <= 0) {
    throw new CalcError(
      'The total quantity must be greater than zero when you want the volumes (or masses) scaled to a batch size.'
    );
  }

  const partsHigh = v.desired - v.low;
  const partsLow = v.high - v.desired;
  const partsTotal = partsHigh + partsLow;

  const highLabel = withUnit(v.high, strengthUnit);
  const lowLabel = withUnit(v.low, strengthUnit);
  const desiredLabel = withUnit(v.desired, strengthUnit);

  const steps = [
    {
      title: 'Set up the alligation alternate grid',
      math: [
        `${highLabel.padEnd(12)}${fmt(partsHigh)} parts of the ${highLabel}`,
        '         \\   /',
        `          ${desiredLabel}`,
        '         /   \\',
        `${lowLabel.padEnd(12)}${fmt(partsLow)} parts of the ${lowLabel}`,
      ].join('\n'),
      note: 'Each stock contributes the absolute difference between the desired strength and the other stock. That is the whole method.',
    },
    {
      title: 'Read the parts off the diagonals',
      math: [
        `parts of ${highLabel} = ${fmt(v.desired)} − ${fmt(v.low)} = ${fmt(partsHigh)}`,
        `parts of ${lowLabel} = ${fmt(v.high)} − ${fmt(v.desired)} = ${fmt(partsLow)}`,
        `total parts = ${fmt(partsHigh)} + ${fmt(partsLow)} = ${fmt(partsTotal)}`,
      ].join('\n'),
      note: `In every ${fmt(partsTotal)} parts of the finished preparation, ${fmt(partsHigh)} come from the stronger stock and ${fmt(partsLow)} from the weaker one.`,
    },
  ];

  const ratioNote = simplifyRatio(partsHigh, partsLow);

  if (ratioNote) {
    steps.push({
      title: 'Simplify the ratio if it helps',
      math: `${fmt(partsHigh)} : ${fmt(partsLow)}  =  ${ratioNote.a} : ${ratioNote.b}`,
      note: 'Same proportion, smaller numbers. Handy when you are measuring by parts rather than scaling to a fixed total.',
    });
  }

  const tableRows = [
    [`${highLabel} stock`, `${fmt(partsHigh)} parts`, ''],
    [`${lowLabel} stock`, `${fmt(partsLow)} parts`, ''],
    ['Total', `${fmt(partsTotal)} parts`, ''],
  ];

  let answer = `${fmt(partsHigh)} : ${fmt(partsLow)}`;
  let answerLabel = 'Parts (higher : lower)';
  let answerNote = `Use ${fmt(partsHigh)} parts of the ${highLabel} stock for every ${fmt(partsLow)} parts of the ${lowLabel} stock.`;

  if (v.total !== null) {
    const qtyHigh = (partsHigh / partsTotal) * v.total;
    const qtyLow = (partsLow / partsTotal) * v.total;
    const totalLabel = withUnit(v.total, qtyUnit);
    const qtyHighLabel = withUnit(qtyHigh, qtyUnit);
    const qtyLowLabel = withUnit(qtyLow, qtyUnit);

    steps.push({
      title: `Scale the parts to ${totalLabel}`,
      math: [
        `${highLabel}: (${fmt(partsHigh)} ÷ ${fmt(partsTotal)}) × ${totalLabel} = ${qtyHighLabel}`,
        `${lowLabel}: (${fmt(partsLow)} ÷ ${fmt(partsTotal)}) × ${totalLabel} = ${qtyLowLabel}`,
      ].join('\n'),
      note: `Check: ${fmt(qtyHigh)} + ${fmt(qtyLow)} = ${fmt(qtyHigh + qtyLow)} ${qtyUnit}, which matches the batch you asked for.`,
    });

    tableRows[0][2] = qtyHighLabel;
    tableRows[1][2] = qtyLowLabel;
    tableRows[2][2] = totalLabel;

    answer = `${qtyHighLabel} of ${highLabel} + ${qtyLowLabel} of ${lowLabel}`;
    answerLabel = 'Quantities to mix';
    answerNote = `That is still ${fmt(partsHigh)} : ${fmt(partsLow)} by parts, scaled to a ${totalLabel} batch.`;
  }

  return {
    answer,
    answerLabel,
    answerNote,
    steps,
    table: {
      headers: v.total !== null
        ? ['Component', 'Parts', `Quantity (${qtyUnit})`]
        : ['Component', 'Parts'],
      rows: tableRows.map((row) => (v.total !== null ? row : [row[0], row[1]])),
    },
  };
}

function solveMedial(v) {
  const strengthUnit = unitLabel(v.strengthUnit, '%');
  const qtyUnit = unitLabel(v.qtyUnit, 'mL');
  const rows = v.rows || [];

  if (rows.length < 2) {
    throw new CalcError(
      'Alligation medial needs at least two components. Add another strength and quantity.'
    );
  }

  const parsed = rows.map((row, index) => {
    const label = row.name?.trim() || `Component ${index + 1}`;

    if (row.strength === '' || row.strength === undefined || row.strength === null) {
      throw new CalcError(`${label} is missing a strength.`);
    }
    if (row.quantity === '' || row.quantity === undefined || row.quantity === null) {
      throw new CalcError(`${label} is missing a quantity.`);
    }

    const strength = Number(row.strength);
    const quantity = Number(row.quantity);

    if (!Number.isFinite(strength)) {
      throw new CalcError(`${label} has a strength that is not a usable number.`);
    }
    if (!Number.isFinite(quantity)) {
      throw new CalcError(`${label} has a quantity that is not a usable number.`);
    }
    if (strength < 0) {
      throw new CalcError(`${label} has a negative strength.`);
    }
    if (quantity <= 0) {
      throw new CalcError(
        `${label} needs a quantity greater than zero. A component that contributes nothing does not belong in the average.`
      );
    }

    return {
      label,
      strength,
      quantity,
      product: strength * quantity,
    };
  });

  const totalQty = parsed.reduce((sum, row) => sum + row.quantity, 0);
  const totalProduct = parsed.reduce((sum, row) => sum + row.product, 0);
  const average = totalProduct / totalQty;
  const averageLabel = withUnit(average, strengthUnit);

  const steps = [
    {
      title: 'Multiply each strength by its quantity',
      math: parsed
        .map(
          (row) =>
            `${row.label}: ${withUnit(row.strength, strengthUnit)} × ${withUnit(row.quantity, qtyUnit)} = ${fmt(row.product)}`
        )
        .join('\n'),
      note: 'Each product is the amount of "strength-stuff" that component contributes. The units on the products are whatever strength × quantity makes; they cancel later.',
    },
    {
      title: 'Add the products and add the quantities',
      math: [
        `Σ (strength × quantity) = ${parsed.map((row) => fmt(row.product)).join(' + ')} = ${fmt(totalProduct)}`,
        `Σ quantity = ${parsed.map((row) => fmt(row.quantity)).join(' + ')} = ${withUnit(totalQty, qtyUnit)}`,
      ].join('\n'),
    },
    {
      title: 'Divide to get the average strength',
      math: `average = ${fmt(totalProduct)} ÷ ${withUnit(totalQty, qtyUnit)} = ${averageLabel}`,
      note: 'That is alligation medial: a weighted average, weighted by how much of each component you actually used.',
    },
  ];

  const strengths = parsed.map((row) => row.strength);
  const minS = Math.min(...strengths);
  const maxS = Math.max(...strengths);
  let sanity = '';
  if (average < minS - 1e-9 || average > maxS + 1e-9) {
    sanity =
      ' Careful: the average came out outside the range of the input strengths, which should not happen for a plain mixture. Check the figures.';
  } else {
    sanity = ` It has to land between ${withUnit(minS, strengthUnit)} and ${withUnit(maxS, strengthUnit)}, and it does.`;
  }

  return {
    answer: averageLabel,
    answerLabel: 'Average strength',
    answerNote: `Mixing these ${parsed.length} components gives a preparation at ${averageLabel}.${sanity}`,
    steps,
    table: {
      headers: [
        'Component',
        `Strength (${strengthUnit})`,
        `Quantity (${qtyUnit})`,
        'Strength × quantity',
      ],
      rows: [
        ...parsed.map((row) => [
          row.label,
          fmt(row.strength),
          fmt(row.quantity),
          fmt(row.product),
        ]),
        ['Total', '', fmt(totalQty), fmt(totalProduct)],
      ],
    },
  };
}

/** Greatest common divisor for simplifying part ratios. */
function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Only simplify when both parts are whole numbers (or whole after a light
 * round). Fractional pharmacy percents like 12.5 stay as-is rather than
 * getting mangled by an integer GCD.
 */
function simplifyRatio(a, b) {
  const aWhole = Math.abs(a - Math.round(a)) < 1e-9;
  const bWhole = Math.abs(b - Math.round(b)) < 1e-9;
  if (!aWhole || !bWhole) return null;

  const ai = Math.round(a);
  const bi = Math.round(b);
  const g = gcd(ai, bi);
  if (g <= 1) return null;

  return { a: ai / g, b: bi / g };
}
