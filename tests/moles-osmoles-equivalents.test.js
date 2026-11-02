import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CalcError } from '../src/scripts/core.js';
import { compounds, amountUnits } from '../src/data/compounds.js';
import { solveMolesOsmolesEquivalents as solve } from '../src/scripts/solvers/moles-osmoles-equivalents.js';

const nacl = { compound: 'NaCl', mw: 58.44, i: 2, ion: 'Na+', ionCount: 1, valence: 1, amount: 1, from: 'g', to: 'mEq' };
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * 1e-12), `${actual} ≠ ${expected}`);
}
function rejects(changes, message) {
  assert.throws(() => solve({ ...nacl, ...changes }), (error) => error instanceof CalcError && message.test(error.message));
}

describe('Moles, milliosmoles and milliequivalents', () => {
  it('calculates independent expected amounts for 1 g NaCl', () => {
    const result = solve(nacl);
    close(result.quantities.mol, 0.01711156741957563);
    close(result.quantities.mmol, 17.11156741957563);
    close(result.quantities.mOsm, 34.22313483915126);
    close(result.quantities.mEq, 17.11156741957563);
    assert.equal(result.answer, '17.112 mEq');
    assert.equal(result.table.rows.length, 6);
    assert.ok(result.steps.some((step) => step.chain?.factors.some((f) => f.den.canceled)));
  });

  it('recovers 1491 mg KCl from 20 mEq potassium', () => {
    const result = solve({ ...nacl, compound: 'KCl', mw: 74.55, ion: 'K+', amount: 20, from: 'mEq', to: 'mg' });
    assert.equal(result.answer, '1491 mg');
    close(result.quantities.mOsm, 40);
    assert.match(result.steps[1].note, /recover the compound/);
  });

  it('distinguishes CaCl2 particle factor 3 from calcium valency 2', () => {
    const result = solve({ ...nacl, compound: 'CaCl2·2H2O', mw: 147.02, i: 3, ion: 'Ca2+', valence: 2, amount: 3, from: 'mOsm' });
    assert.equal(result.answer, '2 mEq');
    close(result.quantities.mmol, 1);
    close(result.quantities.mg, 147.02);
  });

  it('gives 2 mEq chloride for 1 mmol CaCl2 without summing cation and anion charges', () => {
    const result = solve({ ...nacl, compound: 'CaCl2', mw: 110.98, i: 3, ion: 'Cl−', ionCount: 2, amount: 1, from: 'mmol' });
    assert.equal(result.answer, '2 mEq');
    close(result.quantities.mOsm, 3);
    assert.match(result.answerNote, /Cl−/);
  });

  it('counts both sodium ions in sodium sulfate', () => {
    const result = solve({ ...nacl, compound: 'Na2SO4', mw: 142.04, i: 3, ionCount: 2, amount: 1, from: 'mmol' });
    assert.equal(result.answer, '2 mEq');
    close(result.quantities.mOsm, 3);
  });

  it('uses hydrated rather than anhydrous MW for mass conversions', () => {
    const base = { ...nacl, compound: 'Calcium chloride', i: 3, ion: 'Ca2+', valence: 2, amount: 2, from: 'mEq', to: 'mg' };
    assert.equal(solve({ ...base, mw: 110.98 }).answer, '110.98 mg');
    assert.equal(solve({ ...base, mw: 147.02 }).answer, '147.02 mg');
  });

  it('supports a custom compound and noninteger effective particle factor', () => {
    const result = solve({ ...nacl, compound: 'Course example', mw: 100, i: 1.8, amount: 100, from: 'mg', to: 'mOsm' });
    assert.equal(result.answer, '1.8 mOsm');
  });

  it('converts non-electrolytes and marks mEq inapplicable', () => {
    const result = solve({ ...nacl, compound: 'Dextrose monohydrate', mw: 198.17, i: 1, valence: 0, ion: '', ionCount: null, amount: 198.17, from: 'mg', to: 'mOsm' });
    assert.equal(result.answer, '1 mOsm');
    assert.equal(result.table.rows[5][1], 'Not applicable (uncharged)');
    assert.match(result.steps[3].math, /not applicable/);
  });

  it('round-trips every supported pair of units for every compound preset', () => {
    for (const compound of compounds) {
      const v = { ...compound, compound: compound.name };
      const units = amountUnits.filter((unit) => compound.valence > 0 || unit.id !== 'mEq');
      const expected = { g: 0.0025 * v.mw, mg: 2.5 * v.mw, mol: 0.0025, mmol: 2.5, mOsm: 2.5 * v.i, mEq: 2.5 * v.ionCount * v.valence };
      for (const from of units) {
        for (const to of units) {
          const result = solve({ ...v, amount: expected[from.id], from: from.id, to: to.id });
          close(result.quantities[to.id], expected[to.id]);
          assert.ok(result.steps.length >= 3);
          assert.doesNotMatch(result.answer, /NaN|Infinity|undefined/);
        }
      }
    }
  });

  it('keeps full precision between conversion steps', () => {
    const result = solve({ ...nacl, amount: 1.234567891234 });
    close(result.quantities.mEq, 1.234567891234 / 58.44 * 1000);
  });

  it('handles very small amounts without displaying zero', () => {
    const result = solve({ ...nacl, amount: 1e-12, from: 'mol', to: 'mEq' });
    close(result.quantities.mEq, 1e-9);
    assert.notEqual(result.answer, '0 mEq');
  });

  for (const key of ['amount', 'mw', 'i', 'valence']) {
    for (const value of [null, undefined, NaN, Infinity, -Infinity]) {
      it(`rejects invalid ${key}: ${value}`, () => rejects({ [key]: value }, /Enter|value/));
    }
  }
  it('rejects missing compound and ion names', () => {
    rejects({ compound: '  ' }, /compound/);
    rejects({ ion: '' }, /ion/);
  });
  it('rejects unsupported units', () => {
    rejects({ from: 'mEq/L' }, /unit/);
    rejects({ to: 'bad' }, /unit/);
  });
  it('rejects negative and zero amounts or molecular weights', () => {
    for (const key of ['amount', 'mw']) for (const value of [0, -1]) rejects({ [key]: value }, /greater than zero/);
  });
  it('rejects invalid particle factors, valencies and ion counts', () => {
    rejects({ i: 0.5 }, /at least 1/);
    rejects({ i: -1 }, /greater than zero/);
    for (const valence of [-1, 1.5]) rejects({ valence }, /whole number/);
    for (const ionCount of [null, NaN, Infinity, 0, -1, 1.5]) rejects({ ionCount }, /whole number|greater than zero|Enter/);
  });
  it('rejects mEq conversions in either direction for non-electrolytes', () => {
    rejects({ valence: 0 }, /non-electrolyte/);
    rejects({ valence: 0, from: 'mEq', to: 'mol' }, /non-electrolyte/);
  });
  it('rejects numeric overflow and underflow', () => {
    rejects({ amount: 1e308 }, /numeric range/);
    rejects({ amount: 1e-300, mw: 1e300 }, /numeric range/);
  });
});
