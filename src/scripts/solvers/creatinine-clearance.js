import { CalcError, fmt } from '../core.js';

/** Course-standard factors used across the site (see dimensional analysis). */
const LB_PER_KG = 2.2;
const CM_PER_IN = 2.54;

/*
 * Adjusted body weight is not used in this course. Kept commented for later.
 *
 * export const ADJ_BW_FACTOR = 0.4;
 *
 * function adjustedBodyWeight(abwKg, ibwKg) {
 *   const kg = ibwKg + ADJ_BW_FACTOR * (abwKg - ibwKg);
 *   return { kg };
 * }
 */

/**
 * Creatinine clearance via Cockcroft-Gault.
 *
 * Course rule: dosing weight is the lower of actual body weight and Devine
 * ideal body weight. Height and weight are both required.
 *
 * Sex factor is 1 for male and 0.85 for female. Serum creatinine is mg/dL.
 */
export function solveCreatinineClearance(v) {
  const age = requirePositive(v.age, 'age');
  if (age > 120) {
    throw new CalcError('Age looks too high. Enter age in years.');
  }

  const sex = normalizeSex(v.sex);
  const scr = requirePositive(v.scr, 'serum creatinine');
  const abw = resolveActualWeightKg(v);
  const ibw = resolveIbw(v, sex);

  const useIbw = ibw.kg <= abw.kg;
  const dosingKg = useIbw ? ibw.kg : abw.kg;
  const weightLabel = useIbw ? 'ideal body weight' : 'actual body weight';

  const weightSteps = [
    ...abw.steps,
    ...ibw.steps,
    {
      title: 'Pick the lower body weight',
      math: [
        `ABW = ${fmt(abw.kg)} kg`,
        `IBW = ${fmt(ibw.kg)} kg`,
        `dosing weight = min(ABW, IBW) = ${fmt(dosingKg)} kg (${weightLabel})`,
      ].join('\n'),
      note: 'This course uses whichever is lower: actual body weight or ideal body weight.',
    },
  ];

  /*
   * Adjusted body weight path (not used this course):
   *
   * if (basis === 'adj') {
   *   const adj = adjustedBodyWeight(abw.kg, ibw.kg);
   *   dosingKg = adj.kg;
   *   weightLabel = 'adjusted body weight';
   * }
   */

  const sexFactor = sex === 'female' ? 0.85 : 1;
  const numerator = (140 - age) * dosingKg * sexFactor;
  const denominator = 72 * scr;
  const crcl = numerator / denominator;

  const sexNote =
    sex === 'female'
      ? 'Female factor 0.85 is applied in the numerator.'
      : 'Male factor is 1, so the sex multiplier does not change the numerator.';

  return {
    answer: `${fmt(crcl)} mL/min`,
    answerLabel: 'Creatinine clearance',
    answerNote: `Cockcroft-Gault using the lower of ABW and IBW (${fmt(dosingKg)} kg, ${weightLabel}) for a ${age}-year-old ${sex} with Scr ${fmt(scr)} mg/dL.`,
    steps: [
      ...weightSteps,
      {
        title: 'Set up Cockcroft-Gault',
        math: [
          'CrCl (mL/min) = [(140 - age) × weight(kg) × sex] / (72 × Scr)',
          `age = ${fmt(age)} yr, Scr = ${fmt(scr)} mg/dL, weight = ${fmt(dosingKg)} kg (${weightLabel})`,
          sex === 'female' ? 'sex factor = 0.85' : 'sex factor = 1',
        ].join('\n'),
        note: sexNote,
      },
      {
        title: 'Substitute and divide',
        math: [
          `numerator = (140 - ${fmt(age)}) × ${fmt(dosingKg)} × ${fmt(sexFactor)} = ${fmt(numerator)}`,
          `denominator = 72 × ${fmt(scr)} = ${fmt(denominator)}`,
          `CrCl = ${fmt(numerator)} ÷ ${fmt(denominator)} = ${fmt(crcl)} mL/min`,
        ].join('\n'),
      },
    ],
  };
}

function normalizeSex(raw) {
  const sex = String(raw || '').toLowerCase();
  if (sex === 'male' || sex === 'm') return 'male';
  if (sex === 'female' || sex === 'f') return 'female';
  throw new CalcError(
    'Choose male or female. Cockcroft-Gault applies a 0.85 factor for females.'
  );
}

function requirePositive(value, label) {
  if (value === null || value === undefined) {
    throw new CalcError(`Enter the patient's ${label}.`);
  }
  if (value <= 0) {
    throw new CalcError(`${label.charAt(0).toUpperCase()}${label.slice(1)} must be greater than zero.`);
  }
  return value;
}

function resolveActualWeightKg(v) {
  if (v.weight === null) {
    throw new CalcError("Enter the patient's weight.");
  }
  if (v.weight <= 0) {
    throw new CalcError('Weight must be greater than zero.');
  }

  const weightUnit = v.weightUnit === 'lb' ? 'lb' : 'kg';
  const steps = [];
  let kg = v.weight;

  if (weightUnit === 'lb') {
    kg = v.weight / LB_PER_KG;
    steps.push({
      title: 'Convert actual weight to kilograms',
      math: `${fmt(v.weight)} lb × (1 kg / ${fmt(LB_PER_KG)} lb) = ${fmt(kg)} kg`,
      note: 'Same 2.2 lb/kg factor the rest of this site uses.',
    });
  } else {
    steps.push({
      title: 'Actual weight is already in kilograms',
      math: `ABW = ${fmt(kg)} kg`,
    });
  }

  return { kg, steps };
}

/**
 * Devine ideal body weight. Height must reach the formula in inches.
 * Below 60 in (5 ft) the linear term is still applied; coursework varies here.
 */
function resolveIbw(v, sex) {
  if (v.height === null) {
    throw new CalcError('Enter height so ideal body weight can be compared with actual weight.');
  }
  if (v.height <= 0) {
    throw new CalcError('Height must be greater than zero.');
  }

  const heightUnit = v.heightUnit === 'cm' ? 'cm' : 'in';
  const steps = [];
  let inches = v.height;

  if (heightUnit === 'cm') {
    inches = v.height / CM_PER_IN;
    steps.push({
      title: 'Convert height to inches',
      math: `${fmt(v.height)} cm ÷ ${fmt(CM_PER_IN)} cm/in = ${fmt(inches)} in`,
      note: 'Devine IBW is written for inches above 5 feet. 1 in = 2.54 cm.',
    });
  } else {
    steps.push({
      title: 'Height is already in inches',
      math: `height = ${fmt(inches)} in`,
    });
  }

  const base = sex === 'female' ? 45.5 : 50;
  const baseLabel = sex === 'female' ? '45.5 kg' : '50 kg';
  const inchesOver5ft = inches - 60;
  const kg = base + 2.3 * inchesOver5ft;

  if (kg <= 0) {
    throw new CalcError(
      'That height produces a non-positive ideal body weight. Check the height.'
    );
  }

  steps.push({
    title: 'Apply the Devine ideal body weight formula',
    math: [
      sex === 'female'
        ? 'IBW (female) = 45.5 kg + 2.3 kg × (height(in) - 60)'
        : 'IBW (male) = 50 kg + 2.3 kg × (height(in) - 60)',
      `IBW = ${baseLabel} + 2.3 × (${fmt(inches)} - 60)`,
      `IBW = ${baseLabel} + 2.3 × (${fmt(inchesOver5ft)}) = ${fmt(kg)} kg`,
    ].join('\n'),
    note:
      inchesOver5ft < 0
        ? 'Height is under 5 feet, so the inches term is negative. Some lecturers handle short stature differently; use the rule your course states.'
        : 'Devine is the IBW equation most pharmacy courses expect for Cockcroft-Gault weight selection.',
  });

  return { kg, steps, inches };
}
