// Rounded classroom molecular weights. Hydrates are separate substances:
// water of crystallization changes MW, but does not add solute particles to i.
export const compounds = [
  { id: 'nacl', name: 'Sodium chloride (NaCl)', mw: 58.44, i: 2, ion: 'Na+', ionCount: 1, valence: 1 },
  { id: 'kcl', name: 'Potassium chloride (KCl)', mw: 74.55, i: 2, ion: 'K+', ionCount: 1, valence: 1 },
  { id: 'cacl2', name: 'Calcium chloride, anhydrous (CaCl₂)', mw: 110.98, i: 3, ion: 'Ca2+', ionCount: 1, valence: 2 },
  { id: 'cacl2-2h2o', name: 'Calcium chloride dihydrate (CaCl₂·2H₂O)', mw: 147.02, i: 3, ion: 'Ca2+', ionCount: 1, valence: 2 },
  { id: 'mgso4-7h2o', name: 'Magnesium sulfate heptahydrate (MgSO₄·7H₂O)', mw: 246.47, i: 2, ion: 'Mg2+', ionCount: 1, valence: 2 },
  { id: 'na2so4', name: 'Sodium sulfate, anhydrous (Na₂SO₄)', mw: 142.04, i: 3, ion: 'Na+', ionCount: 2, valence: 1 },
  { id: 'glucose', name: 'Glucose, anhydrous (C₆H₁₂O₆)', mw: 180.16, i: 1, ion: '', ionCount: 1, valence: 0 },
  { id: 'dextrose-h2o', name: 'Dextrose monohydrate (C₆H₁₂O₆·H₂O)', mw: 198.17, i: 1, ion: '', ionCount: 1, valence: 0 },
];

export const amountUnits = [
  { id: 'g', label: 'Grams (g)', title: 'Mass' },
  { id: 'mg', label: 'Milligrams (mg)', title: 'Mass' },
  { id: 'mol', label: 'Moles (mol)', title: 'Moles of compound' },
  { id: 'mmol', label: 'Millimoles (mmol)', title: 'Millimoles of compound' },
  { id: 'mOsm', label: 'Milliosmoles (mOsm)', title: 'Milliosmoles of particles' },
  { id: 'mEq', label: 'Milliequivalents (mEq)', title: 'Milliequivalents of selected ion' },
];
