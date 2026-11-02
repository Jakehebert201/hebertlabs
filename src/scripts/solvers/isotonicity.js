import { CalcError, fmt } from '../core.js';

/** Isotonic reference: 0.9% w/v NaCl = 0.9 g per 100 mL. */
export const ISOTONIC_NACL_PER_100ML = 0.9;
export const ISOTONIC_NACL_PER_ML = ISOTONIC_NACL_PER_100ML / 100;

/**
 * Common sodium chloride equivalent (E) values from pharmacy tables.
 * E = grams of NaCl with the same osmotic effect as 1 gram of solute.
 */
export const E_PRESETS = [
  { id: 'custom', label: 'Type E value', e: null },
  { id: 'nacl', label: 'Sodium chloride', e: 1.0 },
  { id: 'kcl', label: 'Potassium chloride', e: 0.76 },
  { id: 'dextrose', label: 'Dextrose (hydrous)', e: 0.18 },
  { id: 'dextrose-mono', label: 'Dextrose monohydrate', e: 0.16 },
  { id: 'boric-acid', label: 'Boric acid', e: 0.52 },
  { id: 'atropine', label: 'Atropine sulfate', e: 0.16 },
  { id: 'epinephrine', label: 'Epinephrine HCl', e: 0.23 },
  { id: 'phenylephrine', label: 'Phenylephrine HCl', e: 0.32 },
  { id: 'procaine', label: 'Procaine HCl', e: 0.18 },
  { id: 'cocaine', label: 'Cocaine HCl', e: 0.17 },
  { id: 'tetracycline', label: 'Tetracycline HCl', e: 0.14 },
  { id: 'urea', label: 'Urea', e: 0.42 },
  { id: 'mgso4', label: 'Magnesium sulfate', e: 0.41 },
  { id: 'znso4', label: 'Zinc sulfate (heptahydrate)', e: 0.12 },
];

/**
 * Isotonicity via sodium chloride equivalents (E values).
 *
 * `v.mode`:
 * - `equivalent` — NaCl equivalent for one solute (mass × E)
 * - `recipe` — NaCl to add so a multi-ingredient formula reaches isotonicity
 */
export function solveIsotonicity(v) {
  const mode = v.mode || 'equivalent';
  if (mode === 'recipe') return solveRecipe(v);
  return solveEquivalent(v);
}

function resolveE(value, label) {
  if (value === null || value === undefined) {
    throw new CalcError(`Enter the E value for ${label}.`);
  }
  if (value < 0) {
    throw new CalcError(`The E value for ${label} cannot be negative.`);
  }
  return value;
}

function parseMass(raw, label) {
  if (raw === '' || raw === undefined || raw === null) {
    throw new CalcError(`${label} is missing a mass.`);
  }
  const mass = Number(raw);
  if (!Number.isFinite(mass)) {
    throw new CalcError(`${label} has a mass that is not a usable number.`);
  }
  if (mass <= 0) {
    throw new CalcError(`${label} needs a mass greater than zero.`);
  }
  return mass;
}

function parseE(raw, label) {
  if (raw === '' || raw === undefined || raw === null) {
    throw new CalcError(`${label} is missing an E value.`);
  }
  const e = Number(raw);
  if (!Number.isFinite(e)) {
    throw new CalcError(`${label} has an E value that is not a usable number.`);
  }
  return resolveE(e, label);
}

function isotonicTargetGrams(volumeMl) {
  return ISOTONIC_NACL_PER_ML * volumeMl;
}

function solveEquivalent(v) {
  if (v.mass === null) {
    throw new CalcError('Enter the mass of solute.');
  }
  if (v.mass <= 0) {
    throw new CalcError('The mass of solute must be greater than zero.');
  }

  const e = resolveE(v.e, 'this solute');
  const equivalent = v.mass * e;

  return {
    answer: `${fmt(equivalent)} g NaCl equivalent`,
    answerLabel: 'Sodium chloride equivalent',
    answerNote: `${fmt(v.mass)} g of solute × E value ${fmt(e)} = ${fmt(equivalent)} g of NaCl with the same osmotic effect.`,
    steps: [
      {
        title: 'Read the E value',
        math: `E = ${fmt(e)}`,
        note: 'E is the grams of sodium chloride that match the osmotic effect of 1 gram of this solute at the stated concentration.',
      },
      {
        title: 'Multiply mass by E',
        math: `NaCl equivalent = ${fmt(v.mass)} g × ${fmt(e)} = ${fmt(equivalent)} g`,
        note: 'The result is expressed as grams of NaCl, not grams of the original drug.',
      },
    ],
  };
}

function solveRecipe(v) {
  const rows = v.rows || [];
  if (rows.length < 1) {
    throw new CalcError('Add at least one ingredient to the formula.');
  }

  if (v.volume === null) {
    throw new CalcError('Enter the final volume of the preparation.');
  }
  if (v.volume <= 0) {
    throw new CalcError('Final volume must be greater than zero.');
  }

  const parsed = rows.map((row, index) => {
    const label = row.name?.trim() || `Ingredient ${index + 1}`;
    const mass = parseMass(row.mass, label);
    const e = parseE(row.e, label);
    const contribution = mass * e;
    return { label, mass, e, contribution };
  });

  const totalEquivalent = parsed.reduce((sum, row) => sum + row.contribution, 0);
  const target = isotonicTargetGrams(v.volume);
  const naclToAdd = target - totalEquivalent;

  const steps = [
    {
      title: 'Find the NaCl equivalent of each ingredient',
      math: parsed
        .map((row) => `${row.label}: ${fmt(row.mass)} g × ${fmt(row.e)} = ${fmt(row.contribution)} g`)
        .join('\n'),
      note: 'Each line is mass × E. Include every dissolved solid that contributes to tonicity, including any sodium chloride already in the formula.',
    },
    {
      title: 'Add the equivalents',
      math: `Σ (mass × E) = ${parsed.map((row) => fmt(row.contribution)).join(' + ')} = ${fmt(totalEquivalent)} g NaCl equivalent`,
    },
    {
      title: 'Compare to the isotonic NaCl target for this volume',
      math: [
        `isotonic NaCl = ${fmt(ISOTONIC_NACL_PER_100ML)} g per 100 mL`,
        `target = ${fmt(ISOTONIC_NACL_PER_100ML)} × (${fmt(v.volume)} / 100) = ${fmt(target)} g NaCl equivalent`,
      ].join('\n'),
      note: '0.9% w/v sodium chloride is the usual isotonic reference in coursework.',
    },
    {
      title: 'Subtract to find additional NaCl needed',
      math: `NaCl to add = ${fmt(target)} - ${fmt(totalEquivalent)} = ${fmt(naclToAdd)} g`,
      note: tonicityNote(naclToAdd, target, totalEquivalent),
    },
  ];

  const hypertonic = naclToAdd < -1e-9;
  const isotonic = Math.abs(naclToAdd) <= 1e-9;

  let answer;
  let answerLabel;
  let answerNote;

  if (isotonic) {
    answer = '0 g NaCl to add';
    answerLabel = 'Already isotonic';
    answerNote = `The ingredients already supply ${fmt(totalEquivalent)} g of NaCl equivalent, matching the ${fmt(target)} g target for ${fmt(v.volume)} mL.`;
  } else if (hypertonic) {
    const excess = totalEquivalent - target;
    answer = 'Hypertonic as written';
    answerLabel = 'No NaCl to add';
    answerNote = `The formula is ${fmt(excess)} g above the isotonic NaCl equivalent for ${fmt(v.volume)} mL. Do not add sodium chloride; dilution or reformulation would be needed in practice.`;
  } else {
    answer = `${fmt(naclToAdd)} g NaCl`;
    answerLabel = 'NaCl to add for isotonicity';
    answerNote = `Add this much sodium chloride to reach the isotonic target of ${fmt(target)} g NaCl equivalent in ${fmt(v.volume)} mL.`;
  }

  return {
    answer,
    answerLabel,
    answerNote,
    steps,
    table: {
      headers: ['Ingredient', 'Mass (g)', 'E', 'NaCl equivalent (g)'],
      rows: [
        ...parsed.map((row) => [row.label, fmt(row.mass), fmt(row.e), fmt(row.contribution)]),
        ['Total from ingredients', '', '', fmt(totalEquivalent)],
        ['Isotonic target', '', '', fmt(target)],
        ['NaCl to add', '', '', fmt(Math.max(naclToAdd, 0))],
      ],
    },
  };
}

function tonicityNote(naclToAdd, target, totalEquivalent) {
  if (Math.abs(naclToAdd) <= 1e-9) {
    return 'The total equivalent matches the isotonic target. No sodium chloride needs to be added.';
  }
  if (naclToAdd > 0) {
    return `The formula is ${fmt(target - totalEquivalent)} g short of isotonic. Add that much NaCl.`;
  }
  return `The result is negative, so the preparation is hypertonic: it already carries ${fmt(totalEquivalent - target)} g more NaCl equivalent than an isotonic ${fmt(target)} g reference.`;
}
