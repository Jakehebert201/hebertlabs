import { CalcError, fmt } from '../core.js';

function moles(v) {
  if (v.mass === null) throw new CalcError('Enter the mass of solute.');
  if (v.mass <= 0) throw new CalcError('The mass of solute must be greater than zero.');
  if (v.mw === null) throw new CalcError('Enter the molecular weight of the solute.');
  if (v.mw <= 0) throw new CalcError('Molecular weight must be greater than zero.');
  if (v.i === null) throw new CalcError("Enter a Van't Hoff factor.");
  if (v.i < 1) {
    throw new CalcError(
      "The Van't Hoff factor cannot be below 1 — a molecule dissolves into at least one particle. Use 1 for a non-electrolyte like dextrose."
    );
  }
  return v.mass / v.mw;
}

function molalitySteps(v, solventGrams, label) {
  // Solute first, so the first complaint names the first empty box on the
  // page — same order the osmolarity and vapor pressure branches use.
  const n = moles(v);

  if (solventGrams === null) throw new CalcError('Enter the mass of solvent.');
  if (solventGrams <= 0) throw new CalcError('Mass of solvent must be greater than zero.');

  const kg = solventGrams / 1000;
  const m = n / kg;

  return {
    n,
    kg,
    m,
    steps: [
      {
        title: 'Convert the solute mass to moles',
        math: `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
      },
      {
        title: 'Convert the solvent mass to kilograms',
        math: `${fmt(solventGrams)} g ÷ 1000 = ${fmt(kg)} kg`,
        note: `${label} uses molality — moles per kilogram of solvent, not per liter of solution.`,
      },
      {
        title: 'Work out the molality',
        math: `m = ${fmt(n)} mol ÷ ${fmt(kg)} kg = ${fmt(m)} mol/kg`,
      },
    ],
  };
}

/** `v.mode` picks the property: osmolarity, freezing, boiling or vapor. */
export function solveColligative(v) {
  const mode = v.mode || 'osmolarity';

  if (mode === 'osmolarity') {
    const n = moles(v);
    if (v.volume === null) throw new CalcError('Enter the final volume of the solution.');
    if (v.volume <= 0) throw new CalcError('Volume must be greater than zero.');

    const liters = v.volume / 1000;
    const osmoles = n * v.i;
    const mOsmolTotal = osmoles * 1000;
    const perLiter = mOsmolTotal / liters;

    // Banded to the isotonic IV fluids rather than to plasma alone, so that
    // D5W at 252 and normal saline at 308 both read as iso-osmotic.
    const tone =
      perLiter < 250
        ? 'Below the roughly 250–310 mOsmol/L of the isotonic IV fluids, so this would behave as hypotonic.'
        : perLiter > 310
          ? 'Above the roughly 250–310 mOsmol/L of the isotonic IV fluids, so this would behave as hypertonic.'
          : 'This sits inside the roughly 250–310 mOsmol/L spanned by the isotonic IV fluids, so it is close to iso-osmotic with blood.';

    return {
      answer: `${fmt(perLiter)} mOsmol/L`,
      answerLabel: 'Osmolarity',
      answerNote: tone,
      steps: [
        {
          title: 'Convert the solute mass to moles',
          math: `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol`,
          note: 'Moles of compound, before it dissociates into anything.',
        },
        {
          title: "Apply the Van't Hoff factor to get osmoles",
          math: `osmol = ${fmt(n)} mol × ${fmt(v.i)} = ${fmt(osmoles)} osmol`,
          note:
            v.i === 1
              ? 'i = 1, so each molecule stays as a single particle and the count is unchanged.'
              : `Each molecule contributes ${fmt(v.i)} particles, so the particle count rises.`,
        },
        {
          title: 'Convert to milliosmoles',
          math: `${fmt(osmoles)} osmol × 1000 = ${fmt(mOsmolTotal)} mOsmol`,
        },
        {
          title: 'Divide by the volume in liters',
          math: `${fmt(v.volume)} mL ÷ 1000 = ${fmt(liters)} L\n${fmt(mOsmolTotal)} mOsmol ÷ ${fmt(liters)} L = ${fmt(perLiter)} mOsmol/L`,
        },
      ],
    };
  }

  if (mode === 'freezing') {
    const kf = v.kf === null ? 1.86 : v.kf;
    if (kf <= 0) {
      throw new CalcError('The freezing point constant Kf must be greater than zero.');
    }
    const { m, steps } = molalitySteps(v, v.solventMass, 'Freezing point depression');

    const deltaT = kf * m * v.i;
    const freezingPoint = 0 - deltaT;
    const isotonicGap = deltaT - 0.52;

    const comparison =
      Math.abs(isotonicGap) < 0.06
        ? 'That is close to the −0.52 °C of blood, so this solution counts as iso-osmotic with plasma.'
        : isotonicGap < 0
          ? `Blood freezes at −0.52 °C. This depression is ${fmt(Math.abs(isotonicGap))} °C short of that, so the solution is hypotonic and would need a tonicity adjuster.`
          : `Blood freezes at −0.52 °C. This depression overshoots by ${fmt(isotonicGap)} °C, so the solution is hypertonic.`;

    return {
      answer: `${fmt(freezingPoint)} °C`,
      answerLabel: 'Freezing point of the solution',
      answerNote: comparison,
      steps: [
        ...steps,
        {
          title: 'Apply the freezing point depression equation',
          math: `ΔTf = Kf × m × i\nΔTf = ${fmt(kf)} × ${fmt(m)} × ${fmt(v.i)} = ${fmt(deltaT)} °C`,
        },
        {
          title: 'Subtract from the freezing point of pure water',
          math: `0 °C − ${fmt(deltaT)} °C = ${fmt(freezingPoint)} °C`,
          note: 'Dissolved particles get in the way of the orderly structure ice needs, so the solution has to be colder before it will freeze.',
        },
      ],
    };
  }

  if (mode === 'boiling') {
    const kb = v.kb === null ? 0.512 : v.kb;
    if (kb <= 0) {
      throw new CalcError('The boiling point constant Kb must be greater than zero.');
    }
    const { m, steps } = molalitySteps(v, v.solventMassB, 'Boiling point elevation');

    const deltaT = kb * m * v.i;
    const boilingPoint = 100 + deltaT;

    return {
      answer: `${fmt(boilingPoint)} °C`,
      answerLabel: 'Boiling point of the solution',
      answerNote: `The boiling point rises by ${fmt(deltaT)} °C compared with pure water.`,
      steps: [
        ...steps,
        {
          title: 'Apply the boiling point elevation equation',
          math: `ΔTb = Kb × m × i\nΔTb = ${fmt(kb)} × ${fmt(m)} × ${fmt(v.i)} = ${fmt(deltaT)} °C`,
        },
        {
          title: 'Add to the boiling point of pure water',
          math: `100 °C + ${fmt(deltaT)} °C = ${fmt(boilingPoint)} °C`,
          note: 'Solute particles at the surface make it harder for solvent molecules to escape, so more heat is needed to boil.',
        },
      ],
    };
  }

  // Vapor pressure lowering
  const n = moles(v);
  if (v.solventMassV === null) throw new CalcError('Enter the mass of solvent.');
  if (v.solventMassV <= 0) throw new CalcError('Mass of solvent must be greater than zero.');
  if (v.solventMw === null) {
    throw new CalcError('Enter the molecular weight of the solvent.');
  }
  if (v.solventMw <= 0) {
    throw new CalcError('The molecular weight of the solvent must be greater than zero.');
  }
  if (v.p0 === null) {
    throw new CalcError('Enter the vapor pressure of the pure solvent.');
  }
  if (v.p0 <= 0) {
    throw new CalcError('The vapor pressure of the pure solvent must be greater than zero.');
  }

  const particles = n * v.i;
  const nSolvent = v.solventMassV / v.solventMw;
  const xSolute = particles / (particles + nSolvent);
  const xSolvent = 1 - xSolute;
  const deltaP = xSolute * v.p0;
  const pSolution = v.p0 - deltaP;

  return {
    answer: `${fmt(pSolution)} mmHg`,
    answerLabel: 'Vapor pressure of the solution',
    answerNote: `Lowered by ${fmt(deltaP)} mmHg from the ${fmt(v.p0)} mmHg of the pure solvent.`,
    steps: [
      {
        title: 'Convert the solute to moles of particles',
        math: `n = ${fmt(v.mass)} g ÷ ${fmt(v.mw)} g/mol = ${fmt(n)} mol\nparticles = ${fmt(n)} × ${fmt(v.i)} = ${fmt(particles)} mol`,
      },
      {
        title: 'Convert the solvent to moles',
        math: `n(solvent) = ${fmt(v.solventMassV)} g ÷ ${fmt(v.solventMw)} g/mol = ${fmt(nSolvent)} mol`,
      },
      {
        title: 'Work out the mole fraction of solute',
        math: `X(solute) = ${fmt(particles)} ÷ (${fmt(particles)} + ${fmt(nSolvent)}) = ${fmt(xSolute)}`,
        note: `The solvent makes up the rest, X(solvent) = ${fmt(xSolvent)}. Mole fractions always sum to 1.`,
      },
      {
        title: "Apply Raoult's law",
        math: `ΔP = X(solute) × P°\nΔP = ${fmt(xSolute)} × ${fmt(v.p0)} = ${fmt(deltaP)} mmHg`,
      },
      {
        title: 'Subtract from the pure solvent',
        math: `${fmt(v.p0)} − ${fmt(deltaP)} = ${fmt(pSolution)} mmHg`,
        note: 'Solute particles occupy part of the surface, so fewer solvent molecules can evaporate.',
      },
    ],
  };
}
