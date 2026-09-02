/* ==========================================================================
   Pure helpers shared by every solver.

   Nothing in this file touches the DOM, so a solver that depends on it can be
   imported and exercised in plain Node. `calc.js` re-exports all of it, so the
   browser-side engine and the solvers are always using the same CalcError
   class — an `instanceof` check across the two has to keep working.
   ========================================================================== */

export class CalcError extends Error {}

/** Format a number for display: sensible significant figures, no float noise. */
export function fmt(value, sig = 5) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  if (abs >= 1e9 || abs < 1e-9) return value.toExponential(3);

  const rounded = Number(value.toPrecision(sig));

  // String() flips to scientific notation below 1e-6; expand it by hand.
  if (Math.abs(rounded) < 1e-6) {
    return rounded.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
  }

  return String(rounded);
}

/** Format with a fixed number of decimal places, trailing zeros trimmed. */
export function fmtFixed(value, places = 2) {
  if (!Number.isFinite(value)) return '—';
  return Number(value.toFixed(places)).toString();
}

/** Throw unless `value` is a usable number. */
export function need(value, label) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new CalcError(`Enter a value for ${label}.`);
  }
  return value;
}

/** Throw unless `value` is a usable, non-zero, positive number. */
export function needPositive(value, label) {
  need(value, label);
  if (value <= 0) {
    throw new CalcError(`${label} must be greater than zero.`);
  }
  return value;
}
