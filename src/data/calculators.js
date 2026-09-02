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
    href: '/calculators/colligative-properties/',
    title: "Colligative properties & Van't Hoff",
    tag: 'Physical pharmacy',
    desc: 'Osmolarity, freezing point depression, boiling point elevation and vapor pressure lowering, all driven by the number of particles in solution.',
  },
];
