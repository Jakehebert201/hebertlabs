import { CalcError, fmt } from '../core.js';

/**
 * `show` takes the internal concentration and turns it back into whatever the
 * user is reading. For every unit except ratio strength the internal number
 * and the typed number are the same thing.
 */
const concUnits = {
  percent: { show: (c) => `${fmt(c)}%` },
  mgml: { show: (c) => `${fmt(c)} mg/mL` },
  molar: { show: (c) => `${fmt(c)} M` },
  ratio: { show: (c) => `1 : ${fmt(1 / c)}` },
};

const boxName = {
  m1: 'starting strength (M1)',
  v1: 'starting volume (V1)',
  m2: 'final strength (M2)',
  v2: 'final volume (V2)',
};

export function solveConcentrationDilution(v) {
  const unitKey = concUnits[v.concUnit] ? v.concUnit : 'percent';
  const conc = concUnits[unitKey];
  const isRatio = unitKey === 'ratio';
  const volUnit = v.volUnit === 'L' ? 'L' : 'mL';

  const keys = ['m1', 'v1', 'm2', 'v2'];
  const missing = keys.filter((key) => v[key] === null);

  if (missing.length === 0) {
    throw new CalcError(
      'All four boxes are filled. Clear the one you want to solve for.'
    );
  }
  if (missing.length > 1) {
    throw new CalcError(
      `Fill in three of the four boxes — ${missing.length} are currently empty.`
    );
  }

  const unknown = missing[0];

  // Every supplied box has to be positive. That is also what keeps the
  // division below safe, whichever box was left empty.
  for (const key of keys) {
    if (key === unknown) continue;
    if (v[key] <= 0) {
      throw new CalcError(
        `The ${boxName[key]} must be greater than zero. A strength or a volume of zero leaves nothing to dilute.`
      );
    }
  }

  // A ratio strength is entered as the X of 1 : X, and 1 : 1000 is weaker
  // than 1 : 100. Those numbers run the wrong way, so they have to become
  // concentrations before the algebra touches them.
  if (isRatio) {
    for (const key of ['m1', 'm2']) {
      if (key === unknown) continue;
      if (v[key] < 1) {
        throw new CalcError(
          `A ratio strength of 1 : X needs X to be at least 1, because it means one part of ingredient in X parts of preparation. Enter just the X, so 1 : 1000 is entered as 1000. Check the ${boxName[key]} box.`
        );
      }
    }
  }

  const toConc = (typed) => (isRatio ? 1 / typed : typed);

  const known = {
    m1: unknown === 'm1' ? null : toConc(v.m1),
    v1: v.v1,
    m2: unknown === 'm2' ? null : toConc(v.m2),
    v2: v.v2,
  };

  let answerConc = null;
  let answerVol = null;
  let isolation;
  let substitution;

  if (unknown === 'm1') {
    answerConc = (known.m2 * known.v2) / known.v1;
    isolation = 'M1 = (M2 × V2) ÷ V1';
    substitution = `M1 = (${fmt(known.m2)} × ${fmt(known.v2)} ${volUnit}) ÷ ${fmt(known.v1)} ${volUnit}`;
  } else if (unknown === 'v1') {
    answerVol = (known.m2 * known.v2) / known.m1;
    isolation = 'V1 = (M2 × V2) ÷ M1';
    substitution = `V1 = (${fmt(known.m2)} × ${fmt(known.v2)} ${volUnit}) ÷ ${fmt(known.m1)}`;
  } else if (unknown === 'm2') {
    answerConc = (known.m1 * known.v1) / known.v2;
    isolation = 'M2 = (M1 × V1) ÷ V2';
    substitution = `M2 = (${fmt(known.m1)} × ${fmt(known.v1)} ${volUnit}) ÷ ${fmt(known.v2)} ${volUnit}`;
  } else {
    answerVol = (known.m1 * known.v1) / known.m2;
    isolation = 'V2 = (M1 × V1) ÷ M2';
    substitution = `V2 = (${fmt(known.m1)} × ${fmt(known.v1)} ${volUnit}) ÷ ${fmt(known.m2)}`;
  }

  const raw = answerConc === null ? answerVol : answerConc;
  if (!Number.isFinite(raw) || raw <= 0) {
    throw new CalcError(
      'Those numbers do not produce a usable answer. Check that each box holds a sensible value.'
    );
  }

  const m1 = unknown === 'm1' ? answerConc : known.m1;
  const m2 = unknown === 'm2' ? answerConc : known.m2;
  const v1 = unknown === 'v1' ? answerVol : known.v1;
  const v2 = unknown === 'v2' ? answerVol : known.v2;

  const factor = v2 / v1;
  // Float noise turns an exact match into something like 1e-13, which would
  // otherwise read as a diluent volume, so pin it to zero before anything
  // downstream formats it.
  const gap = v2 - v1;
  const unchanged = Math.abs(gap) < v2 * 1e-9;
  const diluent = unchanged ? 0 : gap;
  const concentrating = diluent < 0;

  const answer =
    answerConc === null ? `${fmt(answerVol)} ${volUnit}` : conc.show(answerConc);

  const notes = [];

  // Ratio strengths are checked on the way in, so only a derived one can come
  // out below 1 : 1. Computed rather than blocked: the arithmetic is sound and
  // the student still wants to see where the numbers led.
  if (isRatio) {
    const tooStrong = [m1, m2].find((c) => 1 / c < 1);
    if (tooStrong !== undefined) {
      notes.push(
        `Careful: 1 : ${fmt(1 / tooStrong)} sits below 1 : 1, which reads as one part of ingredient in less than one part of preparation, so the ingredient outweighs the whole preparation. That is why a strength box will not accept an X below 1 either. Check the figures.`
      );
    }
  }

  if (unitKey === 'percent') {
    const strongest = Math.max(m1, m2);
    if (strongest > 100) {
      notes.push(
        `Careful: ${fmt(strongest)}% is above 100%, which says there is more ingredient than finished preparation. That only holds together if the ingredient is weighed and the preparation measured by volume, and even then it needs a preparation much denser than water. Double-check the figures.`
      );
    }
  }

  if (concentrating) {
    // Not blocked: the same equation describes evaporating a solution down,
    // and a student may be checking exactly that. But on a page called
    // dilution it is far more often a swapped M1 and M2.
    notes.push(
      `Careful: the final strength is higher than the starting strength, so this concentrates rather than dilutes. The equation still holds (it says ${fmt(-diluent)} ${volUnit} would have to be evaporated off), but on a dilution problem this usually means M1 and M2 were entered the wrong way round.`
    );
    notes.push(`The preparation is concentrated by a factor of ${fmt(1 / factor)}.`);
  } else if (unchanged) {
    notes.push(
      'The two strengths are the same, so the volume does not change and there is no diluent to add. Nothing has been diluted.'
    );
  } else {
    notes.push(
      `Add ${fmt(diluent)} ${volUnit} of diluent to ${fmt(v1)} ${volUnit} of the ${conc.show(m1)} stock to reach ${fmt(v2)} ${volUnit} of ${conc.show(m2)}.`
    );
    notes.push(`The preparation is diluted by a factor of ${fmt(factor)}.`);
  }

  const steps = [
    {
      title: 'The drug does not go anywhere',
      math: 'strength × volume  =  amount of drug',
      note: 'Adding diluent spreads the same amount of drug through a bigger volume. It does not create or destroy any of it, so the amount you had before and the amount you have after are the same number.',
    },
    {
      title: 'So set the two amounts equal',
      math: 'M1 × V1  =  M2 × V2',
      note: 'The left side is the amount of drug in the stock you measure out. The right side is the amount in the finished preparation. Same drug, same amount, written two ways. That is the whole formula.',
    },
  ];

  if (isRatio) {
    const lines = [];
    if (unknown !== 'm1') lines.push(`1 : ${fmt(v.m1)}  =  ${fmt(known.m1)}`);
    if (unknown !== 'm2') lines.push(`1 : ${fmt(v.m2)}  =  ${fmt(known.m2)}`);

    steps.push({
      title: 'First turn each ratio strength into a concentration',
      math: lines.join('\n'),
      note: 'A ratio strength runs backwards: 1 : 1000 is weaker than 1 : 100, so the bigger number is the weaker solution. Divide 1 by X before using it, or the algebra comes out inverted.',
    });
  }

  steps.push(
    {
      title: `Rearrange for ${unknown.toUpperCase()}`,
      math: isolation,
      note: `Divide both sides by whatever is multiplying ${unknown.toUpperCase()}.`,
    },
    {
      title: 'Substitute what you know',
      math: substitution,
    },
    {
      title: 'Solve',
      // A ratio strength stays as the bare decimal here, because the next
      // step is the one that turns it back into 1 : X.
      math: `${unknown.toUpperCase()} = ${
        answerConc === null
          ? `${fmt(answerVol)} ${volUnit}`
          : isRatio
            ? fmt(answerConc)
            : conc.show(answerConc)
      }`,
    }
  );

  if (isRatio && answerConc !== null) {
    steps.push({
      title: 'Then turn it back into a ratio strength',
      math: `${fmt(answerConc)}  =  1 : ${fmt(1 / answerConc)}`,
      note: 'Divide 1 by the concentration to get back to the 1 : X form the question was written in.',
    });
  }

  steps.push({
    title: concentrating
      ? 'Now compare the two volumes'
      : 'Now find the diluent, which is what the question usually wants',
    math: `diluent = V2 − V1\ndiluent = ${fmt(v2)} ${volUnit} − ${fmt(v1)} ${volUnit} = ${fmt(diluent)} ${volUnit}`,
    note: concentrating
      ? `This comes out negative, which is the equation telling you the finished preparation is smaller than what you started with. You would be removing ${fmt(-diluent)} ${volUnit}, not adding anything.`
      : unchanged
        ? 'Nothing to add here, because the volume never changed.'
        : `The formula gives you the total finished volume, but nobody measures out "total". You measure ${fmt(v1)} ${volUnit} of stock and then add ${fmt(diluent)} ${volUnit} of diluent to it.`,
  });

  steps.push({
    title: 'Check the direction before you trust it',
    math: `strength: ${conc.show(m1)}  →  ${conc.show(m2)}\nvolume:   ${fmt(v1)} ${volUnit}  →  ${fmt(v2)} ${volUnit}`,
    note: concentrating
      ? 'A dilution has to move the strength down and the volume up. This one did the opposite, so unless you meant to evaporate the solution, the setup is inverted.'
      : unchanged
        ? 'Neither one moved, so no dilution took place.'
        : 'Strength went down and volume went up. That is what a dilution has to look like. If yours ever moves the other way, you have M1 and M2 swapped.',
  });

  const rows = [
    ['Starting strength (M1)', conc.show(m1)],
    ['Starting volume (V1)', `${fmt(v1)} ${volUnit}`],
    ['Final strength (M2)', conc.show(m2)],
    ['Final volume (V2)', `${fmt(v2)} ${volUnit}`],
    [
      concentrating ? 'Volume to remove' : 'Diluent to add',
      `${fmt(Math.abs(diluent))} ${volUnit}`,
    ],
    unchanged
      ? ['Dilution factor', 'None, the strength did not change']
      : concentrating
        ? ['Concentration factor', `${fmt(1 / factor)} times stronger`]
        : ['Dilution factor', `${fmt(factor)} times weaker`],
  ];

  return {
    answer,
    answerLabel: `Solved for ${boxName[unknown]}`,
    answerNote: notes.join(' '),
    steps,
    table: { headers: ['Quantity', 'Value'], rows },
  };
}
