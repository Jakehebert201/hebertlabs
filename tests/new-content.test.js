import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CalcError } from '../src/scripts/core.js';
import { solveBsa, REFERENCE_BSA } from '../src/scripts/solvers/bsa.js';
import { solveAlligations } from '../src/scripts/solvers/alligations.js';

/** Pull the first finite number out of an answer string like `1.8351 m²`. */
function num(answer) {
  const match = String(answer).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i);
  assert.ok(match, `expected a number in "${answer}"`);
  return Number(match[0]);
}

function approx(actual, expected, eps = 1e-3) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${expected} ± ${eps}, got ${actual}`
  );
}

function throwsCalc(fn, includes) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof CalcError, `expected CalcError, got ${error}`);
    if (includes) {
      assert.match(error.message, includes);
    }
    return true;
  });
}

describe('BSA and BSA-based dosing', () => {
  it('Mosteller BSA from inches and pounds', () => {
    const result = solveBsa({
      mode: 'bsa',
      height: 70,
      heightUnit: 'in',
      weight: 150,
      weightUnit: 'lb',
      bsa: null,
    });
    approx(num(result.answer), 1.8351, 1e-3);
    assert.match(result.answer, /m²/);
    assert.match(result.steps[0].math, /2\.54/);
    assert.match(result.steps[1].math, /2\.2/);
    assert.match(result.answerNote, /1\.73/);
  });

  it('Mosteller BSA from cm and kg', () => {
    const result = solveBsa({
      mode: 'bsa',
      height: 170,
      heightUnit: 'cm',
      weight: 70,
      weightUnit: 'kg',
      bsa: null,
    });
    // √((170×70)/3600) = √3.3056 ≈ 1.8181
    approx(num(result.answer), 1.8181, 1e-3);
  });

  it('dose from known 1.73 m² reference BSA', () => {
    const result = solveBsa({
      mode: 'dose',
      ordered: 75,
      bsa: REFERENCE_BSA,
      height: null,
      weight: null,
    });
    approx(num(result.answer), 75 * REFERENCE_BSA, 1e-6);
    assert.match(result.answer, /mg$/);
  });

  it('dose from height and weight matches Mosteller × order', () => {
    const sized = solveBsa({
      mode: 'bsa',
      height: 70,
      heightUnit: 'in',
      weight: 150,
      weightUnit: 'lb',
      bsa: null,
    });
    const dose = solveBsa({
      mode: 'dose',
      ordered: 75,
      bsa: null,
      height: 70,
      heightUnit: 'in',
      weight: 150,
      weightUnit: 'lb',
    });
    approx(num(dose.answer), num(sized.answer) * 75, 1e-2);
  });

  it('prefers typed BSA over height and weight', () => {
    const result = solveBsa({
      mode: 'dose',
      ordered: 100,
      bsa: 1.73,
      height: 70,
      heightUnit: 'in',
      weight: 150,
      weightUnit: 'lb',
    });
    approx(num(result.answer), 173, 1e-6);
    assert.match(result.answerNote, /ignored/i);
  });

  it('round-trips total dose back to mg/m²', () => {
    const result = solveBsa({
      mode: 'perM2',
      totalDose: 129.75,
      bsa: 1.73,
      height: null,
      weight: null,
    });
    approx(num(result.answer), 75, 1e-3);
  });

  it('rejects missing height for BSA mode', () => {
    throwsCalc(
      () =>
        solveBsa({
          mode: 'bsa',
          height: null,
          weight: 150,
          heightUnit: 'in',
          weightUnit: 'lb',
          bsa: null,
        }),
      /height/i
    );
  });
});

describe('Alligations', () => {
  it('alternate parts for 95% and 50% → 70%', () => {
    const result = solveAlligations({
      mode: 'alternate',
      high: 95,
      low: 50,
      desired: 70,
      total: null,
      strengthUnit: '%',
      qtyUnit: 'mL',
    });
    assert.equal(result.answer, '20 : 25');
    const simplified = result.steps.find((s) => s.title.includes('Simplify'));
    assert.ok(simplified);
    assert.match(simplified.math, /4 : 5/);
  });

  it('scales 95% alcohol + water to a 1000 mL batch of 70%', () => {
    const result = solveAlligations({
      mode: 'alternate',
      high: 95,
      low: 0,
      desired: 70,
      total: 1000,
      strengthUnit: '%',
      qtyUnit: 'mL',
    });
    // 70/95×1000 and 25/95×1000
    assert.match(result.answer, /736\.84 mL of 95%/);
    assert.match(result.answer, /263\.16 mL of 0%/);
  });

  it('rejects desired strength outside the stock range', () => {
    throwsCalc(
      () =>
        solveAlligations({
          mode: 'alternate',
          high: 95,
          low: 50,
          desired: 99,
          total: null,
          strengthUnit: '%',
          qtyUnit: 'mL',
        }),
      /strictly between/i
    );
  });

  it('rejects swapped higher/lower boxes', () => {
    throwsCalc(
      () =>
        solveAlligations({
          mode: 'alternate',
          high: 50,
          low: 95,
          desired: 70,
          total: null,
          strengthUnit: '%',
          qtyUnit: 'mL',
        }),
      /stronger preparation/i
    );
  });

  it('medial weighted average for 300 mL of 40% + 200 mL of 70%', () => {
    const result = solveAlligations({
      mode: 'medial',
      strengthUnit: '%',
      qtyUnit: 'mL',
      rows: [
        { name: '40% alcohol', strength: '40', quantity: '300' },
        { name: '70% alcohol', strength: '70', quantity: '200' },
      ],
    });
    approx(num(result.answer), 52, 1e-6);
  });

  it('medial three-ointment mix including a 0% base', () => {
    const result = solveAlligations({
      mode: 'medial',
      strengthUnit: '%',
      qtyUnit: 'g',
      rows: [
        { name: '1%', strength: '1', quantity: '20' },
        { name: '2.5%', strength: '2.5', quantity: '30' },
        { name: 'base', strength: '0', quantity: '50' },
      ],
    });
    approx(num(result.answer), 0.95, 1e-6);
  });

  it('medial needs at least two components', () => {
    throwsCalc(
      () =>
        solveAlligations({
          mode: 'medial',
          strengthUnit: '%',
          qtyUnit: 'mL',
          rows: [{ name: 'only', strength: '10', quantity: '100' }],
        }),
      /at least two/i
    );
  });
});
