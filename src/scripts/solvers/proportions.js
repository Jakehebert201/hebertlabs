import { CalcError, fmt } from '../core.js';

export function solveProportions(v) {
  const unitA = v.unitA || 'units A';
  const unitB = v.unitB || 'units B';

  const slots = ['a', 'b', 'c', 'd'];
  const missing = slots.filter((key) => v[key] === null);

  if (missing.length === 0) {
    throw new CalcError(
      'All four boxes are filled. Clear the one you want to solve for.'
    );
  }
  if (missing.length > 1) {
    throw new CalcError(
      `Fill in three of the four amounts — ${missing.length} are currently empty.`
    );
  }

  const unknown = missing[0];
  const { a, b, c, d } = v;

  let answer;
  let isolation;
  let substitution;

  // Every known amount has to be positive. That also guarantees the value
  // we divide by below is never zero, whichever box was left empty.
  const position = { a: 'first', b: 'second', c: 'third', d: 'fourth' };
  for (const key of slots) {
    if (key === unknown) continue;
    if (v[key] <= 0) {
      throw new CalcError(
        `The ${position[key]} amount must be greater than zero — a ratio built on zero or a negative quantity has no meaning.`
      );
    }
  }

  if (unknown === 'a') {
    answer = (b * c) / d;
    isolation = 'a = (b × c) ÷ d';
    substitution = `a = (${fmt(b)} × ${fmt(c)}) ÷ ${fmt(d)}`;
  } else if (unknown === 'b') {
    answer = (a * d) / c;
    isolation = 'b = (a × d) ÷ c';
    substitution = `b = (${fmt(a)} × ${fmt(d)}) ÷ ${fmt(c)}`;
  } else if (unknown === 'c') {
    answer = (a * d) / b;
    isolation = 'c = (a × d) ÷ b';
    substitution = `c = (${fmt(a)} × ${fmt(d)}) ÷ ${fmt(b)}`;
  } else {
    answer = (b * c) / a;
    isolation = 'd = (b × c) ÷ a';
    substitution = `d = (${fmt(b)} × ${fmt(c)}) ÷ ${fmt(a)}`;
  }

  const answerUnit = unknown === 'a' || unknown === 'c' ? unitA : unitB;
  const show = (key) => (key === unknown ? key : fmt(v[key]));

  // The same problem as a DA chain: take the known half of the incomplete
  // ratio, and multiply by the complete ratio oriented so units cancel.
  const asChain = {
    a: { start: [b, unitB], num: [c, unitA], den: [d, unitB] },
    b: { start: [a, unitA], num: [d, unitB], den: [c, unitA] },
    c: { start: [d, unitB], num: [a, unitA], den: [b, unitB] },
    d: { start: [c, unitA], num: [b, unitB], den: [a, unitA] },
  }[unknown];

  return {
    answer: `${fmt(answer)} ${answerUnit}`,
    answerLabel: `Solved for ${unknown}`,
    answerNote: `The unknown was the ${
      unknown === 'a' || unknown === 'c' ? 'left' : 'right'
    }-hand amount in the ${
      unknown === 'a' || unknown === 'b' ? 'first' : 'second'
    } ratio.`,
    steps: [
      {
        title: 'Write the two ratios with units in matching positions',
        math: `${show('a')} ${unitA} per ${show('b')} ${unitB}   =   ${show('c')} ${unitA} per ${show('d')} ${unitB}`,
        note: `${unitA} sits on top on both sides and ${unitB} underneath on both sides. Check this before any arithmetic — it is the step that goes wrong.`,
      },
      {
        title: 'Cross-multiply',
        math: `${show('a')} × ${show('d')}  =  ${show('b')} × ${show('c')}`,
        note: 'Multiply diagonally across the equals sign. The two products are equal.',
      },
      {
        title: `Isolate ${unknown}`,
        math: isolation,
        note: `Divide both sides by whatever is multiplying ${unknown}.`,
      },
      {
        title: 'Substitute and solve',
        math: `${substitution}\n${unknown} = ${fmt(answer)} ${answerUnit}`,
      },
      {
        title: 'The same problem as dimensional analysis',
        chain: {
          start: { value: fmt(asChain.start[0]), unit: asChain.start[1], canceled: true },
          factors: [
            {
              num: { value: fmt(asChain.num[0]), unit: asChain.num[1] },
              den: { value: fmt(asChain.den[0]), unit: asChain.den[1], canceled: true },
            },
          ],
        },
        note: `Same numbers, same answer of ${fmt(answer)} ${answerUnit} — but here the known ratio is used as a conversion factor, turned so that ${asChain.den[1]} cancels. If you had it upside down, you would be left with the wrong unit instead of a plausible wrong number.`,
      },
    ],
  };
}
