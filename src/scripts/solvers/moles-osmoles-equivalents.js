import { CalcError, fmt, need, needPositive } from '../core.js';
import { amountUnits } from '../../data/compounds.js';

/** Convert total amounts via mmol of compound, without rounding intermediate values. */
export function solveMolesOsmolesEquivalents(v) {
  const from = amountUnits.find((unit) => unit.id === v.from);
  const to = amountUnits.find((unit) => unit.id === v.to);
  if (!from || !to) throw new CalcError('Choose a known unit and a unit to solve for.');
  const compound = v.compound?.trim();
  if (!compound) throw new CalcError('Enter the compound name or formula.');
  const amount = needPositive(v.amount, 'Known amount');
  const mw = needPositive(v.mw, 'Molecular weight');
  const i = needPositive(v.i, "Particle factor (i)");
  if (i < 1) throw new CalcError('Particle factor (i) must be at least 1.');
  const valence = need(v.valence, 'Valency');
  if (!Number.isInteger(valence) || valence < 0) {
    throw new CalcError('Valency must be a whole number of 0 or greater. Use the absolute charge, such as 2 for Ca2+ or SO4 2−.');
  }
  let ionCount = 1;
  const ion = v.ion?.trim();
  if (valence > 0) {
    if (!ion) throw new CalcError('Name the ion whose milliequivalents you are calculating.');
    ionCount = needPositive(v.ionCount, 'Selected ions per formula unit');
    if (!Number.isInteger(ionCount)) throw new CalcError('Selected ions per formula unit must be a whole number.');
  } else if (v.from === 'mEq' || v.to === 'mEq') {
    throw new CalcError('Milliequivalents require a charged ion. A non-electrolyte with valency 0 cannot be converted to or from mEq.');
  }
  const chargeFactor = ionCount * valence;
  const steps = [{
    title: 'Identify what each unit is counting',
    math: `${compound}: MW = ${fmt(mw)} g/mol; i = ${fmt(i)}${valence > 0 ? `; ${fmt(ionCount)} ${ion} per formula unit; |z| = ${fmt(valence)}` : '; non-electrolyte (valency 0)'}`,
    note: 'mol and mmol count compound formula units. mOsm counts dissolved particles. mEq counts charge carried by the selected ion, without adding cations and anions together.',
  }];

  // A factor has the unit wanted on top and the canceled unit on the bottom.
  const factor = (n, nu, d, du) => ({
    num: { value: fmt(n), unit: nu },
    den: { value: fmt(d), unit: du, canceled: true },
  });
  let mmol;
  let inputFactors;
  switch (v.from) {
    case 'g':
      mmol = amount / mw * 1000;
      inputFactors = [factor(1, 'mol', mw, 'g'), factor(1000, 'mmol', 1, 'mol')];
      inputFactors[0].num.canceled = true;
      break;
    case 'mg':
      mmol = amount / mw;
      inputFactors = [factor(1, 'mmol', mw, 'mg')];
      break;
    case 'mol':
      mmol = amount * 1000;
      inputFactors = [factor(1000, 'mmol', 1, 'mol')];
      break;
    case 'mmol':
      mmol = amount;
      inputFactors = [];
      break;
    case 'mOsm':
      mmol = amount / i;
      inputFactors = [factor(1, 'mmol', i, 'mOsm')];
      break;
    case 'mEq':
      mmol = amount / chargeFactor;
      inputFactors = [factor(1, 'mmol', chargeFactor, 'mEq')];
      break;
  }
  steps.push({
    title: v.from === 'mmol' ? 'Start with the millimoles of compound' : 'Convert the known amount to millimoles of compound',
    chain: { start: { value: fmt(amount), unit: v.from, canceled: inputFactors.length > 0 }, factors: inputFactors },
    math: `${fmt(mmol)} mmol of ${compound}`,
    note: v.from === 'mEq' ? `Divide by ${fmt(ionCount)} × ${fmt(valence)} = ${fmt(chargeFactor)} mEq per mmol of compound to recover the compound amount.` : v.from === 'mOsm' ? 'Divide out the particle factor to recover compound formula units.' : '1 mol = 1000 mmol. Numerically, MW in g/mol also equals MW in mg/mmol.',
  });

  const quantities = { g: mmol / 1000 * mw, mg: mmol * mw, mol: mmol / 1000, mmol, mOsm: mmol * i, mEq: mmol * chargeFactor };
  if (!Number.isFinite(chargeFactor) || Object.entries(quantities).some(([key, value]) => !Number.isFinite(value) || (value <= 0 && !(key === 'mEq' && valence === 0)))) {
    throw new CalcError('Those amounts are outside the supported numeric range. Use smaller or less extreme values.');
  }
  const outputFactors = {
    g: [factor(mw, 'g', 1000, 'mmol')],
    mg: [factor(mw, 'mg', 1, 'mmol')],
    mol: [factor(1, 'mol', 1000, 'mmol')],
    mmol: [],
    mOsm: [factor(i, 'mOsm', 1, 'mmol')],
    mEq: [factor(chargeFactor, 'mEq', 1, 'mmol')],
  };
  steps.push({
    title: `Convert millimoles to ${to.label.toLowerCase()}`,
    chain: { start: { value: fmt(mmol), unit: 'mmol', canceled: outputFactors[v.to].length > 0 }, factors: outputFactors[v.to] },
    math: `${fmt(quantities[v.to])} ${v.to}${v.to === 'mEq' ? ` of ${ion}` : ''}`,
    note: v.to === 'mEq' ? `Each mmol of compound supplies ${fmt(ionCount)} mmol of ${ion}, with ${fmt(valence)} mEq per mmol of that ion.` : v.to === 'mOsm' ? `Each mmol of compound contributes ${fmt(i)} mOsm of particles under the stated dissociation assumption.` : 'Only the requested unit survives after canceling.',
  });
  steps.push({
    title: 'Compare particles with charge',
    math: `mOsm = ${fmt(mmol)} mmol × ${fmt(i)} = ${fmt(quantities.mOsm)} mOsm\n${valence > 0 ? `mEq of ${ion} = ${fmt(mmol)} mmol × ${fmt(ionCount)} × ${fmt(valence)} = ${fmt(quantities.mEq)} mEq` : 'mEq: not applicable to an uncharged non-electrolyte'}`,
    note: 'These are total amounts. mOsm/L and mEq/L are concentrations and require a solution volume.',
  });

  return {
    answer: `${fmt(quantities[v.to])} ${v.to}`,
    answerLabel: to.title,
    answerNote: `${compound}${valence > 0 ? `; mEq refers to ${ion}` : '; mEq is not applicable'}. Uses i = ${fmt(i)}. Presets assume ideal complete dissociation; use the factor stated in your problem.`,
    steps,
    table: {
      headers: ['Expressed as', 'Equivalent amount'],
      rows: amountUnits.map((unit) => [unit.id === 'mEq' && valence > 0 ? `Milliequivalents of ${ion}` : unit.label, unit.id === 'mEq' && valence === 0 ? 'Not applicable (uncharged)' : `${fmt(quantities[unit.id])} ${unit.id}`]),
    },
    quantities,
  };
}
