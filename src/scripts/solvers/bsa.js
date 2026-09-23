import { CalcError, fmt } from '../core.js';

/** Course-standard factors used across the site (see dimensional analysis). */
const LB_PER_KG = 2.2;
const CM_PER_IN = 2.54;

/** Conventional "average adult" BSA used for reference doses. */
export const REFERENCE_BSA = 1.73;

/**
 * Body-surface-area calculator.
 *
 * `v.mode`:
 * - `bsa` — Mosteller BSA from height and weight
 * - `dose` — patient dose from ordered mg/m² × BSA
 * - `perM2` — ordered intensity (mg/m²) from a total dose ÷ BSA
 *
 * For dosing modes, supply either a known `bsa` or height + weight. If both
 * are present, the typed BSA wins and height/weight are ignored with a note.
 */
export function solveBsa(v) {
  const mode = v.mode || 'bsa';

  if (mode === 'dose') return solveDose(v);
  if (mode === 'perM2') return solvePerM2(v);
  return solveSurfaceArea(v);
}

function solveSurfaceArea(v) {
  const { bsa, steps, kg, cm } = computeBsaFromSize(v, { requireSize: true });

  steps.push({
    title: 'Compare to the adult reference',
    math: `reference adult BSA = ${fmt(REFERENCE_BSA)} m²`,
    note: compareToReference(bsa),
  });

  return {
    answer: `${fmt(bsa)} m²`,
    answerLabel: 'Body surface area',
    answerNote: `Mosteller BSA from ${fmt(cm)} cm and ${fmt(kg)} kg. ${compareToReference(bsa)}`,
    steps,
  };
}

function solveDose(v) {
  if (v.ordered === null) {
    throw new CalcError('Enter the ordered dose in mg per m².');
  }
  if (v.ordered <= 0) {
    throw new CalcError('The ordered dose must be greater than zero.');
  }

  const size = resolvePatientBsa(v);
  const dose = v.ordered * size.bsa;

  const steps = [
    ...size.steps,
    {
      title: 'Multiply the order by this patient\'s BSA',
      math: `dose = ${fmt(v.ordered)} mg/m² × ${fmt(size.bsa)} m² = ${fmt(dose)} mg`,
      note: 'The m² cancels. What remains is the milligram amount for this patient.',
    },
  ];

  if (size.source !== 'typed') {
    steps.push({
      title: 'Sanity check against a 1.73 m² adult',
      math: `reference dose = ${fmt(v.ordered)} mg/m² × ${fmt(REFERENCE_BSA)} m² = ${fmt(v.ordered * REFERENCE_BSA)} mg`,
      note: compareDoseToReference(dose, v.ordered * REFERENCE_BSA),
    });
  }

  return {
    answer: `${fmt(dose)} mg`,
    answerLabel: 'Patient dose',
    answerNote: `${fmt(v.ordered)} mg/m² × ${fmt(size.bsa)} m².${size.ignoredSize ? ' Height and weight were ignored because a BSA was already entered.' : ''}`,
    steps,
  };
}

function solvePerM2(v) {
  if (v.totalDose === null) {
    throw new CalcError('Enter the total dose in mg.');
  }
  if (v.totalDose <= 0) {
    throw new CalcError('The total dose must be greater than zero.');
  }

  const size = resolvePatientBsa(v);
  const perM2 = v.totalDose / size.bsa;

  return {
    answer: `${fmt(perM2)} mg/m²`,
    answerLabel: 'Dose intensity',
    answerNote: `${fmt(v.totalDose)} mg spread over ${fmt(size.bsa)} m².${size.ignoredSize ? ' Height and weight were ignored because a BSA was already entered.' : ''}`,
    steps: [
      ...size.steps,
      {
        title: 'Divide the total dose by BSA',
        math: `mg/m² = ${fmt(v.totalDose)} mg ÷ ${fmt(size.bsa)} m² = ${fmt(perM2)} mg/m²`,
        note: 'This is the intensity of the regimen for this patient\'s size. Compare it to the protocol\'s stated mg/m² order.',
      },
    ],
  };
}

/**
 * Prefer an explicitly typed BSA. Otherwise compute Mosteller from height and
 * weight. `requireSize` forces height+weight (used by the BSA-only mode).
 */
function resolvePatientBsa(v) {
  if (v.bsa !== null) {
    if (v.bsa <= 0) {
      throw new CalcError('Body surface area must be greater than zero.');
    }

    const ignoredSize = v.height !== null || v.weight !== null;
    return {
      bsa: v.bsa,
      source: 'typed',
      ignoredSize,
      steps: [
        {
          title: 'Use the BSA you already have',
          math: `BSA = ${fmt(v.bsa)} m²`,
          note: ignoredSize
            ? 'Height and weight boxes were also filled, so they were left unused. Clear the BSA box if you want Mosteller to recalculate it.'
            : 'When the problem already states BSA, there is nothing to derive.',
        },
      ],
    };
  }

  return computeBsaFromSize(v, { requireSize: true });
}

function computeBsaFromSize(v, { requireSize }) {
  if (v.height === null) {
    throw new CalcError(
      requireSize
        ? 'Enter the patient\'s height.'
        : 'Enter a BSA, or fill in height and weight so Mosteller can calculate one.'
    );
  }
  if (v.weight === null) {
    throw new CalcError(
      requireSize
        ? 'Enter the patient\'s weight.'
        : 'Enter a BSA, or fill in height and weight so Mosteller can calculate one.'
    );
  }
  if (v.height <= 0) {
    throw new CalcError('Height must be greater than zero.');
  }
  if (v.weight <= 0) {
    throw new CalcError('Weight must be greater than zero.');
  }

  const heightUnit = v.heightUnit === 'in' ? 'in' : 'cm';
  const weightUnit = v.weightUnit === 'lb' ? 'lb' : 'kg';
  const steps = [];

  let cm = v.height;
  if (heightUnit === 'in') {
    cm = v.height * CM_PER_IN;
    steps.push({
      title: 'Convert height to centimeters',
      math: `${fmt(v.height)} in × ${fmt(CM_PER_IN)} cm/in = ${fmt(cm)} cm`,
      note: 'Mosteller is written for centimeters. 1 in = 2.54 cm.',
    });
  } else {
    steps.push({
      title: 'Height is already in centimeters',
      math: `height = ${fmt(cm)} cm`,
    });
  }

  let kg = v.weight;
  if (weightUnit === 'lb') {
    kg = v.weight / LB_PER_KG;
    steps.push({
      title: 'Convert weight to kilograms',
      math: `${fmt(v.weight)} lb × (1 kg / ${fmt(LB_PER_KG)} lb) = ${fmt(kg)} kg`,
      note: 'Same 2.2 lb/kg factor the rest of this site uses for weight-based dosing.',
    });
  } else {
    steps.push({
      title: 'Weight is already in kilograms',
      math: `weight = ${fmt(kg)} kg`,
    });
  }

  const inside = (cm * kg) / 3600;
  const bsa = Math.sqrt(inside);

  steps.push({
    title: 'Apply the Mosteller formula',
    math: [
      'BSA = √( (height(cm) × weight(kg)) / 3600 )',
      `BSA = √( (${fmt(cm)} × ${fmt(kg)}) / 3600 )`,
      `BSA = √(${fmt(inside)}) = ${fmt(bsa)} m²`,
    ].join('\n'),
    note: 'Mosteller is the formula most pharmacy courses expect. Other equations exist; use the one your lecturer specifies.',
  });

  return { bsa, steps, kg, cm, source: 'mosteller', ignoredSize: false };
}

function compareToReference(bsa) {
  const delta = bsa - REFERENCE_BSA;
  const abs = Math.abs(delta);
  const pct = Math.abs((delta / REFERENCE_BSA) * 100);
  const pctLabel = fmt(Number(pct.toFixed(1)));
  if (abs < REFERENCE_BSA * 0.02) {
    return `That is essentially the conventional adult reference of ${fmt(REFERENCE_BSA)} m².`;
  }
  if (delta > 0) {
    return `About ${pctLabel}% above the conventional adult reference of ${fmt(REFERENCE_BSA)} m².`;
  }
  return `About ${pctLabel}% below the conventional adult reference of ${fmt(REFERENCE_BSA)} m².`;
}

function compareDoseToReference(patientDose, referenceDose) {
  if (Math.abs(patientDose - referenceDose) < referenceDose * 0.02) {
    return `Close to the ${fmt(referenceDose)} mg you would calculate for a ${fmt(REFERENCE_BSA)} m² adult on the same order.`;
  }
  if (patientDose > referenceDose) {
    return `Higher than the ${fmt(referenceDose)} mg a ${fmt(REFERENCE_BSA)} m² adult would receive on the same mg/m² order, which is expected for a larger BSA.`;
  }
  return `Lower than the ${fmt(referenceDose)} mg a ${fmt(REFERENCE_BSA)} m² adult would receive on the same mg/m² order, which is expected for a smaller BSA.`;
}
