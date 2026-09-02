import { CalcError, fmt } from '../core.js';

export function solveSpecificGravity(v) {
  const keys = ['sg', 'mass', 'volume'];
  const provided = keys.filter((k) => v[k] !== null);

  if (provided.length < 2) throw new CalcError('Fill in two of the three boxes.');
  if (provided.length === 3) {
    throw new CalcError('All three boxes are filled. Clear the one you want to solve for.');
  }

  const unknown = keys.find((k) => v[k] === null);

  let answer;
  let answerUnit;
  let isolation;
  let substitution;

  if (unknown === 'mass') {
    if (v.volume <= 0) throw new CalcError('Volume must be greater than zero.');
    if (v.sg <= 0) throw new CalcError('Specific gravity must be greater than zero.');
    answer = v.sg * v.volume;
    answerUnit = 'g';
    isolation = 'mass = sg × volume';
    substitution = `mass = ${fmt(v.sg)} × ${fmt(v.volume)} mL`;
  } else if (unknown === 'volume') {
    if (v.sg <= 0) throw new CalcError('Specific gravity must be greater than zero.');
    if (v.mass <= 0) throw new CalcError('Mass must be greater than zero.');
    answer = v.mass / v.sg;
    answerUnit = 'mL';
    isolation = 'volume = mass ÷ sg';
    substitution = `volume = ${fmt(v.mass)} g ÷ ${fmt(v.sg)}`;
  } else {
    if (v.volume <= 0) throw new CalcError('Volume must be greater than zero.');
    if (v.mass <= 0) throw new CalcError('Mass must be greater than zero.');
    answer = v.mass / v.volume;
    answerUnit = '(no units)';
    isolation = 'sg = mass ÷ volume';
    substitution = `sg = ${fmt(v.mass)} g ÷ ${fmt(v.volume)} mL`;
  }

  const sg = unknown === 'sg' ? answer : v.sg;

  const comparison =
    sg > 1
      ? `An sg of ${fmt(sg)} means it is ${fmt(sg)} times as heavy as the same volume of water, so it sinks in water.`
      : sg < 1
        ? `An sg of ${fmt(sg)} means it is lighter than water — the same volume weighs only ${fmt(sg * 100)}% as much — so it floats.`
        : 'An sg of exactly 1 means it has the same density as water.';

  return {
    answer: unknown === 'sg' ? fmt(answer) : `${fmt(answer)} ${answerUnit}`,
    answerLabel: `Solved for ${unknown}`,
    answerNote: comparison,
    steps: [
      {
        title: 'Start from the definition',
        math: 'sg = density of substance ÷ density of water',
        note: 'Water is 1 g/mL, and dividing by 1 changes nothing.',
      },
      {
        title: 'Which reduces to grams over milliliters',
        math: 'sg = mass (g) ÷ volume (mL)',
      },
      {
        title: `Rearrange for ${unknown}`,
        math: isolation,
      },
      {
        title: 'Substitute',
        math: substitution,
      },
      {
        title: 'Solve',
        math: `${unknown} = ${fmt(answer)}${unknown === 'sg' ? '' : ` ${answerUnit}`}`,
        note:
          unknown === 'sg'
            ? 'Notice the grams and milliliters cancel conceptually — the answer carries no unit.'
            : undefined,
      },
    ],
  };
}
