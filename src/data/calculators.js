/**
 * Single source of truth for the calculator list, so the home page, the
 * calculators index and the sitemap never drift apart.
 */
export const calculators = [
  {
    href: '/calculators/proportions/',
    title: 'Ratio & proportion',
    tag: 'Foundations',
    desc: 'Cross-multiply to find the missing piece. The method most courses teach first, shown alongside the same problem in dimensional analysis so you can see why the latter is harder to get wrong.',
  },
  {
    href: '/calculators/dimensional-analysis/',
    title: 'Dimensional analysis',
    tag: 'Foundations',
    desc: 'Chain conversion factors together and watch the units cancel. Useful when you know the answer needs different units but not how to get there.',
  },
  {
    href: '/calculators/percentage-strength/',
    title: 'Percentage strength',
    tag: 'Concentration',
    desc: 'Read a percentage as a conversion factor, then cancel units to find the amount of ingredient, the total quantity, or the strength itself.',
  },
  {
    href: '/calculators/ratio-strength/',
    title: 'Ratio strength, ppm & ppb',
    tag: 'Concentration',
    desc: 'ppm is just mg/L and ppb is just mcg/L. Convert between those, percentage strength and ratio strength by canceling units rather than memorizing formulas.',
  },
  {
    href: '/calculators/concentration-dilution/',
    title: 'Concentration and dilution',
    tag: 'Concentration',
    desc: 'Solve M1V1 = M2V2 for whichever value is missing, then find the number the question is really asking for: how much diluent to add.',
  },
  {
    href: '/calculators/specific-gravity/',
    title: 'Specific gravity',
    tag: 'Concentration',
    desc: 'Move between mass, volume and specific gravity, and understand why the number has no units.',
  },
  {
    href: '/calculators/reduce-enlarge/',
    title: 'Reducing & enlarging formulas',
    tag: 'Compounding',
    desc: 'Scale a whole compounding formula up or down by yield, and get every ingredient recalculated at once.',
  },
  {
    href: '/calculators/alligations/',
    title: 'Alligations',
    tag: 'Compounding',
    desc: 'Alligation alternate for mixing two strengths to hit a target, and alligation medial for the average strength of a known mix.',
  },
  {
    href: '/calculators/bsa/',
    title: 'BSA and BSA-based dosing',
    tag: 'Dosing',
    desc: 'Mosteller body surface area from height and weight, with lb→kg and in→cm conversions, then mg/m² orders turned into patient doses against the 1.73 m² adult reference.',
  },
  {
    href: '/calculators/creatinine-clearance/',
    title: 'Creatinine clearance',
    tag: 'Dosing',
    desc: 'Cockcroft-Gault CrCl from age, sex, height, weight and serum creatinine, using the lower of actual body weight and Devine ideal body weight.',
  },
  {
    href: '/calculators/colligative-properties/',
    title: "Colligative properties & Van't Hoff",
    tag: 'Physical pharmacy',
    desc: 'Osmolarity, freezing point depression, boiling point elevation and vapor pressure lowering, all driven by the number of particles in solution.',
  },
  {
    href: '/calculators/molarity-osmolarity/',
    title: 'Molarity, molality and osmoles',
    tag: 'Physical pharmacy',
    desc: 'Molarity and osmolarity per liter of solution, molality and osmolality per kg of solvent, plus conversions within each pair using the Van\'t Hoff factor.',
  },
  {
    href: '/calculators/isotonicity/',
    title: 'Isotonicity and E values',
    tag: 'Physical pharmacy',
    desc: 'Sodium chloride equivalents from E values, then how much NaCl to add so a multi-ingredient formula reaches the 0.9% isotonic reference.',
  },
];
