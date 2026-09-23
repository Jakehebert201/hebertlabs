import { CalcError, fmt } from '../core.js';

/**
 * Molarity, molality, osmolarity and osmolality.
 *
 * `v.mode`:
 * - `molarity` — M from mass, MW, and solution volume
 * - `osmolarity` — mOsmol/L from mass, MW, volume, and i
 * - `molality` — m from mass, MW, and solvent mass
 * - `osmolality` — mOsmol/kg from mass, MW, solvent mass, and i
 * - `convert` — M ↔ mOsmol/L or m ↔ mOsmol/kg given i
 *   (`v.convertBasis` is `liter` or `kg`)
 */
export function solveMolarityOsmolarity(v) {
  const mode = v.mode || 'molarity';

  if (mode === 'osmolarity') return solveOsmolarityFromMass(v);
  if (mode === 'molality') return solveMolality(v);
  if (mode === 'osmolality') return solveOsmolalityFromMass(v);
  if (mode === 'convert') return solveConvert(v);
  return solveMolarity(v);
}

function needI(v) {
  if (v.i === null) throw new CalcError("Enter a Van't Hoff factor.");
  if (v.i < 1) {
    throw new CalcError(
      "The Van't Hoff factor cannot be below 1. A molecule dissolves into at least one particle. Use 1 for a non-electrolyte like dextrose."
    );
  }
  return v.i;
}

function molesFromMassAndMw(v) {
  if (v.mass === null) throw new CalcError('Enter the mass of solute.');
  if (v.mass <= 0) throw new CalcError('The mass of solute must be greater than zero.');
  if (v.mw === null) throw new CalcError('Enter the molecular weight of the solute.');
  if (v.mw <= 0) throw new CalcError('Molecular weight must be greater than zero.');
  return v.mass / v.mw;
}

function molesFromMass(v) {
  const n = molesFromMassAndMw(v);
  if (v.volume === null) throw new CalcError('Enter the final volume of the solution.');
  if (v.volume <= 0) throw new CalcError('Volume must be greater than zero.');

  const liters = v.volume / 1000;
  const molarity = n / liters;

  return { n, liters, molarity };
}

function molesFromSolvent(v) {
  const n = molesFromMassAndMw(v);
  if (v.solventMass === null) throw new CalcError('Enter the mass of solvent.');
  if (v.solventMass <= 0) throw new CalcError('Mass of solvent must be greater than zero.');

  const kg = v.solventMass / 1000;
  const molality = n / kg;

  return { n, kg, molality };
}

function solveMolarity(v) {
  const { n, liters, molarity } = molesFromMass(v);

  return {
    answer: `${fmt(molarity)} M`,
    answerLabel: 'Molarity',
    answerNote: `${fmt(molarity)} mol of compound per liter of solution. This counts molecules, not the particles they split into.`,
    steps: [
      {
        title: 'Convert the solute mass to moles',
        math: `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
      },
      {
        title: 'Convert the volume to liters',
        math: `${fmt(v.volume)} mL ÷ 1000 = ${fmt(liters)} L`,
        note: 'Molarity is defined per liter of solution.',
      },
      {
        title: 'Divide moles by liters',
        math: `M = ${fmt(n)} mol ÷ ${fmt(liters)} L = ${fmt(molarity)} M`,
      },
    ],
  };
}

function solveOsmolarityFromMass(v) {
  const i = needI(v);
  const { n, liters, molarity } = molesFromMass(v);
  const osmolarity = molarity * i * 1000;

  return {
    answer: `${fmt(osmolarity)} mOsmol/L`,
    answerLabel: 'Osmolarity',
    answerNote: tonicityNote(osmolarity, 'L'),
    steps: [
      {
        title: 'Find the molarity first',
        math: [
          `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
          `${fmt(v.volume)} mL ÷ 1000 = ${fmt(liters)} L`,
          `M = ${fmt(n)} mol ÷ ${fmt(liters)} L = ${fmt(molarity)} M`,
        ].join('\n'),
        note: 'Osmolarity starts from molarity. You need the molecule count before you can multiply by particles per molecule.',
      },
      {
        title: "Multiply by the Van't Hoff factor and by 1000",
        math: `mOsmol/L = ${fmt(molarity)} M × ${fmt(i)} × 1000 = ${fmt(osmolarity)} mOsmol/L`,
        note: particleScaleNote(i, 'osmolarity', 'molarity'),
      },
    ],
  };
}

function solveMolality(v) {
  const { n, kg, molality } = molesFromSolvent(v);

  return {
    answer: `${fmt(molality)} mol/kg`,
    answerLabel: 'Molality',
    answerNote: `${fmt(molality)} mol of compound per kilogram of solvent. The denominator is solvent only, not the whole solution.`,
    steps: [
      {
        title: 'Convert the solute mass to moles',
        math: `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
      },
      {
        title: 'Convert the solvent mass to kilograms',
        math: `${fmt(v.solventMass)} g ÷ 1000 = ${fmt(kg)} kg`,
        note: 'Molality is defined per kilogram of solvent, not per liter of solution.',
      },
      {
        title: 'Divide moles by kilograms of solvent',
        math: `m = ${fmt(n)} mol ÷ ${fmt(kg)} kg = ${fmt(molality)} mol/kg`,
      },
    ],
  };
}

function solveOsmolalityFromMass(v) {
  const i = needI(v);
  const { n, kg, molality } = molesFromSolvent(v);
  const osmolality = molality * i * 1000;

  return {
    answer: `${fmt(osmolality)} mOsmol/kg`,
    answerLabel: 'Osmolality',
    answerNote: tonicityNote(osmolality, 'kg'),
    steps: [
      {
        title: 'Find the molality first',
        math: [
          `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
          `${fmt(v.solventMass)} g ÷ 1000 = ${fmt(kg)} kg`,
          `m = ${fmt(n)} mol ÷ ${fmt(kg)} kg = ${fmt(molality)} mol/kg`,
        ].join('\n'),
        note: 'Osmolality starts from molality, the same way osmolarity starts from molarity.',
      },
      {
        title: "Multiply by the Van't Hoff factor and by 1000",
        math: `mOsmol/kg = ${fmt(molality)} mol/kg × ${fmt(i)} × 1000 = ${fmt(osmolality)} mOsmol/kg`,
        note: particleScaleNote(i, 'osmolality', 'molality'),
      },
    ],
  };
}

function solveConvert(v) {
  const basis = v.convertBasis === 'kg' ? 'kg' : 'liter';
  const i = needI(v);

  if (basis === 'kg') {
    return convertPair(v, {
      aKey: 'molality',
      bKey: 'osmolality',
      aLabel: 'molality',
      bLabel: 'osmolality',
      aUnit: 'mol/kg',
      bUnit: 'mOsmol/kg',
      aShort: 'm',
      bothFilled: 'Both molality and osmolality are filled. Clear the one you want to solve for.',
      neitherFilled: 'Fill in either molality or osmolality, and leave the other blank.',
    }, i);
  }

  return convertPair(v, {
    aKey: 'molarity',
    bKey: 'osmolarity',
    aLabel: 'molarity',
    bLabel: 'osmolarity',
    aUnit: 'M',
    bUnit: 'mOsmol/L',
    aShort: 'M',
    bothFilled: 'Both molarity and osmolarity are filled. Clear the one you want to solve for.',
    neitherFilled: 'Fill in either molarity or osmolarity, and leave the other blank.',
  }, i);
}

function convertPair(v, labels, i) {
  const hasA = v[labels.aKey] !== null;
  const hasB = v[labels.bKey] !== null;

  if (hasA && hasB) throw new CalcError(labels.bothFilled);
  if (!hasA && !hasB) throw new CalcError(labels.neitherFilled);

  if (hasA) {
    if (v[labels.aKey] <= 0) {
      throw new CalcError(`${capitalize(labels.aLabel)} must be greater than zero.`);
    }
    const b = v[labels.aKey] * i * 1000;
    const per = labels.bUnit.endsWith('/kg') ? 'kg' : 'L';
    return {
      answer: `${fmt(b)} ${labels.bUnit}`,
      answerLabel: capitalize(labels.bLabel),
      answerNote: tonicityNote(b, per),
      steps: [
        {
          title: `Start from the ${labels.aLabel} you already have`,
          math: `${labels.aShort} = ${fmt(v[labels.aKey])} ${labels.aUnit}`,
        },
        {
          title: "Scale by i and convert to milliosmoles",
          math: `${labels.bUnit} = ${fmt(v[labels.aKey])} × ${fmt(i)} × 1000 = ${fmt(b)}`,
          note: particleScaleNote(i, labels.bLabel, labels.aLabel),
        },
      ],
    };
  }

  if (v[labels.bKey] <= 0) {
    throw new CalcError(`${capitalize(labels.bLabel)} must be greater than zero.`);
  }
  const a = v[labels.bKey] / (i * 1000);
  return {
    answer: `${fmt(a)} ${labels.aUnit}`,
    answerLabel: capitalize(labels.aLabel),
    answerNote: `${fmt(v[labels.bKey])} ${labels.bUnit} of a solute with i = ${fmt(i)} corresponds to ${fmt(a)} ${labels.aUnit} of compound.`,
    steps: [
      {
        title: `Start from the ${labels.bLabel} you already have`,
        math: `${labels.bLabel} = ${fmt(v[labels.bKey])} ${labels.bUnit}`,
      },
      {
        title: 'Divide out the particle factor and the milliscale',
        math: `${labels.aShort} = ${fmt(v[labels.bKey])} ÷ (${fmt(i)} × 1000) = ${fmt(a)} ${labels.aUnit}`,
        note: 'This recovers moles of compound, not moles of particles.',
      },
    ],
  };
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function particleScaleNote(i, osmoWord, moleWord) {
  if (i === 1) {
    return `i = 1, so each molecule stays as one particle and ${osmoWord} in Osmol units equals ${moleWord}.`;
  }
  return `Each molecule contributes ${fmt(i)} particles. The ×1000 turns Osmol into the milliosmole units used clinically.`;
}

function tonicityNote(mOsmol, per) {
  const unit = per === 'kg' ? 'mOsmol/kg' : 'mOsmol/L';
  // Same 250–310 band used on the colligative page for isotonic IV fluids.
  // For osmolality the comparison is approximate: dilute aqueous fluids have
  // nearly equal osmolarity and osmolality.
  if (mOsmol < 250) {
    return `Below the roughly 250–310 ${unit} of the isotonic IV fluids, so this would behave as hypotonic.`;
  }
  if (mOsmol > 310) {
    return `Above the roughly 250–310 ${unit} of the isotonic IV fluids, so this would behave as hypertonic.`;
  }
  return `This sits inside the roughly 250–310 ${unit} spanned by the isotonic IV fluids, so it is close to iso-osmotic with blood.`;
}
