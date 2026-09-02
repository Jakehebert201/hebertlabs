# Golden master — captured BEFORE the solver refactor

Captured from the dev server at http://localhost:4321 by clicking every preset
button in DOM order on a freshly loaded page, then serializing the rendered
worked solution out of the live DOM.

Chains are flattened to text: `value unit` per term, `~` marks a struck-through
(canceled) unit, `(num / den)` is a fraction, `×` separates terms.
`order` records the child element order inside each step `<li>` so a reordering
regression would show up too.

Re-run the identical capture after refactoring and diff against this file.

## /calculators/ratio-strength/

```json
{
 "Example: 1:10,000 epinephrine": {
  "answerLabel": "Concentration",
  "answer": "100 ppm  =  100 mg/L",
  "answerNote": "Also 0.01% w/v, or a ratio strength of 1 : 10000.",
  "error": null,
  "steps": [
   {
    "title": "Read what you were given as a plain statement",
    "math": "A ratio strength of 1 : 10000 w/v means 1 g of ingredient in 10000 mL of preparation.",
    "order": "step__title,step__math"
   },
   {
    "title": "Ask how much sits in 1 L, and cancel your way there",
    "chain": "1 L~ × (1000 mL~ / 1 L~) × (1 g~ / 10000 mL~) × (1000 mg / 1 g~)",
    "note": "Each factor is chosen so the unit you no longer want lands on the bottom. Only mg survives.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Read the surviving number",
    "math": "100 mg in 1 L  =  100 mg/L  =  100 ppm",
    "note": "1 mg/L is one part per million, so the number you just worked out is already the answer in ppm.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Derive the percentage strength the same way",
    "chain": "100 mL~ × (0.1 g / 1000 mL~)",
    "note": "Percent means \"per 100 mL\", so ask how much solute is in 100 mL. The answer, 0.01 g, is the percentage strength: 0.01% w/v.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Derive the ratio strength the same way",
    "chain": "1 g~ × (1000 mL / 0.1 g~)",
    "note": "Ratio strength asks the reverse question: 1 g of ingredient sits in how many mL? That gives 1 : 10000.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Work out how much to measure for 500 mL",
    "chain": "500 mL~ × (0.1 g / 1000 mL~)",
    "note": "You need 0.05 g, which is 50 mg. That is usually too little to weigh directly — you would make it from a stock solution or an aliquot.",
    "order": "step__title,chain,step__note"
   }
  ],
  "table": [
   "Expressed as | Value",
   "Parts per million | 100 ppm",
   "The same thing in mg/L | 100 mg/L",
   "Parts per billion | 100000 ppb",
   "The same thing in mcg/L | 100000 mcg/L",
   "Percentage strength | 0.01 % w/v",
   "Ratio strength | 1 : 10000",
   "Concentration | 0.1 mg/mL",
   "Ingredient in 500 mL | 0.05 g"
  ]
 },
 "Example: 0.9% saline": {
  "answerLabel": "Concentration",
  "answer": "9000 ppm  =  9000 mg/L",
  "answerNote": "Also 0.9% w/v, or a ratio strength of 1 : 111.11.",
  "error": null,
  "steps": [
   {
    "title": "Read what you were given as a plain statement",
    "math": "0.9% w/v means 0.9 g of ingredient in every 100 mL of preparation.",
    "order": "step__title,step__math"
   },
   {
    "title": "Ask how much sits in 1 L, and cancel your way there",
    "chain": "1 L~ × (1000 mL~ / 1 L~) × (0.9 g~ / 100 mL~) × (1000 mg / 1 g~)",
    "note": "Each factor is chosen so the unit you no longer want lands on the bottom. Only mg survives.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Read the surviving number",
    "math": "9000 mg in 1 L  =  9000 mg/L  =  9000 ppm",
    "note": "1 mg/L is one part per million, so the number you just worked out is already the answer in ppm.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Derive the percentage strength the same way",
    "chain": "100 mL~ × (9 g / 1000 mL~)",
    "note": "Percent means \"per 100 mL\", so ask how much solute is in 100 mL. The answer, 0.9 g, is the percentage strength: 0.9% w/v.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Derive the ratio strength the same way",
    "chain": "1 g~ × (1000 mL / 9 g~)",
    "note": "Ratio strength asks the reverse question: 1 g of ingredient sits in how many mL? That gives 1 : 111.11.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Work out how much to measure for 1000 mL",
    "chain": "1000 mL~ × (9 g / 1000 mL~)",
    "note": "You need 9 g.",
    "order": "step__title,chain,step__note"
   }
  ],
  "table": [
   "Expressed as | Value",
   "Parts per million | 9000 ppm",
   "The same thing in mg/L | 9000 mg/L",
   "Parts per billion | 9000000 ppb",
   "The same thing in mcg/L | 9000000 mcg/L",
   "Percentage strength | 0.9 % w/v",
   "Ratio strength | 1 : 111.11",
   "Concentration | 9 mg/mL",
   "Ingredient in 1000 mL | 9 g"
  ]
 },
 "Example: 4 ppm fluoride": {
  "answerLabel": "Concentration",
  "answer": "4 ppm  =  4 mg/L",
  "answerNote": "Also 0.0004% w/v, or a ratio strength of 1 : 250000.",
  "error": null,
  "steps": [
   {
    "title": "Read what you were given as a plain statement",
    "math": "4 ppm means 4 mg in every 1 L — that is what ppm is.",
    "order": "step__title,step__math"
   },
   {
    "title": "Ask how much sits in 1 L, and cancel your way there",
    "chain": "1 L~ × (4 mg / 1 L~)",
    "note": "Each factor is chosen so the unit you no longer want lands on the bottom. Only mg survives.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Read the surviving number",
    "math": "4 mg in 1 L  =  4 mg/L  =  4 ppm",
    "note": "1 mg/L is one part per million, so the number you just worked out is already the answer in ppm.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Derive the percentage strength the same way",
    "chain": "100 mL~ × (0.004 g / 1000 mL~)",
    "note": "Percent means \"per 100 mL\", so ask how much solute is in 100 mL. The answer, 0.0004 g, is the percentage strength: 0.0004% w/v.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Derive the ratio strength the same way",
    "chain": "1 g~ × (1000 mL / 0.004 g~)",
    "note": "Ratio strength asks the reverse question: 1 g of ingredient sits in how many mL? That gives 1 : 250000.",
    "order": "step__title,chain,step__note"
   }
  ],
  "table": [
   "Expressed as | Value",
   "Parts per million | 4 ppm",
   "The same thing in mg/L | 4 mg/L",
   "Parts per billion | 4000 ppb",
   "The same thing in mcg/L | 4000 mcg/L",
   "Percentage strength | 0.0004 % w/v",
   "Ratio strength | 1 : 250000",
   "Concentration | 0.004 mg/mL"
  ]
 },
 "Example: 50 ppb contaminant": {
  "answerLabel": "Concentration",
  "answer": "50 ppb  =  50 mcg/L",
  "answerNote": "Also 0.000005% w/v, or a ratio strength of 1 : 20000000.",
  "error": null,
  "steps": [
   {
    "title": "Read what you were given as a plain statement",
    "math": "50 ppb means 50 mcg in every 1 L — that is what ppb is.",
    "order": "step__title,step__math"
   },
   {
    "title": "Ask how much sits in 1 L, and cancel your way there",
    "chain": "1 L~ × (50 mcg / 1 L~)",
    "note": "Each factor is chosen so the unit you no longer want lands on the bottom. Only mcg survives.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Read the surviving number",
    "math": "50 mcg in 1 L  =  50 mcg/L  =  50 ppb",
    "note": "1 mcg/L is one part per billion, so the number you just worked out is already the answer in ppb.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Derive the percentage strength the same way",
    "chain": "100 mL~ × (0.00005 g / 1000 mL~)",
    "note": "Percent means \"per 100 mL\", so ask how much solute is in 100 mL. The answer, 0.000005 g, is the percentage strength: 0.000005% w/v.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Derive the ratio strength the same way",
    "chain": "1 g~ × (1000 mL / 0.00005 g~)",
    "note": "Ratio strength asks the reverse question: 1 g of ingredient sits in how many mL? That gives 1 : 20000000.",
    "order": "step__title,chain,step__note"
   }
  ],
  "table": [
   "Expressed as | Value",
   "Parts per million | 0.05 ppm",
   "The same thing in mg/L | 0.05 mg/L",
   "Parts per billion | 50 ppb",
   "The same thing in mcg/L | 50 mcg/L",
   "Percentage strength | 0.000005 % w/v",
   "Ratio strength | 1 : 20000000",
   "Concentration | 0.00005 mg/mL"
  ]
 }
}
```

## /calculators/percentage-strength/

```json
{
 "Example: D5W 500 mL": {
  "answerLabel": "Solved for amount",
  "answer": "25 g",
  "answerNote": "That strength is 50 mg/mL.",
  "error": null,
  "steps": [
   {
    "title": "Turn the percentage into a conversion factor",
    "math": "5% w/v  means  5 g per 100 mL",
    "note": "In other words, grams of ingredient in every 100 mL of finished preparation.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply, with the unwanted unit on the bottom",
    "chain": "500 mL~ × (5 g / 100 mL~)",
    "note": "mL goes on the bottom of the factor so it cancels against the 500 mL you started with, leaving g.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Do the arithmetic",
    "math": "(500 × 5) ÷ 100  =  25 g",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: ointment % w/w": {
  "answerLabel": "Solved for percent",
  "answer": "3.3333 % w/w",
  "answerNote": null,
  "error": null,
  "steps": [
   {
    "title": "Work out what the percentage is asking for",
    "math": "? % w/w  means  ? g per 100 g",
    "note": "The percentage is the number of g in 100 g. You do not have a factor to multiply by yet — you are building one.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply, with the unwanted unit on the bottom",
    "chain": "100 g~ × (2 g / 60 g~)",
    "note": "Percent is asking how much ingredient sits in 100 g, so start with 100 g and cancel down to g.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Both units are g — keep track of which is which",
    "math": "g of preparation cancels\ng of ingredient survives",
    "note": "In a w/w problem the grams on the bottom are grams of finished preparation, and the grams on top are grams of active ingredient. They cancel because they are both g, but they are not the same thing.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Do the arithmetic",
    "math": "(100 × 2) ÷ 60  =  3.3333 g per 100 g",
    "order": "step__title,step__math"
   },
   {
    "title": "Read it as a percentage",
    "math": "3.3333 g per 100 g  =  3.3333% w/w",
    "note": "Anything measured per 100 is already a percentage — there is no final conversion to do.",
    "order": "step__title,step__math,step__note"
   }
  ]
 },
 "Example: normal saline volume": {
  "answerLabel": "Solved for total quantity",
  "answer": "500 mL",
  "answerNote": "That strength is 9 mg/mL.",
  "error": null,
  "steps": [
   {
    "title": "Turn the percentage into a conversion factor",
    "math": "0.9% w/v  means  0.9 g per 100 mL",
    "note": "In other words, grams of ingredient in every 100 mL of finished preparation.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply, with the unwanted unit on the bottom",
    "chain": "4.5 g~ × (100 mL / 0.9 g~)",
    "note": "This time the factor is flipped, so g lands on the bottom and cancels, leaving mL.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Do the arithmetic",
    "math": "(4.5 × 100) ÷ 0.9  =  500 mL",
    "order": "step__title,step__math"
   }
  ]
 }
}
```

## /calculators/dimensional-analysis/

```json
{
 "Example: grams to mg": {
  "answerLabel": "Result",
  "answer": "500 mg",
  "answerNote": "The units canceled down to mg, which is exactly what you were aiming for.",
  "error": null,
  "steps": [
   {
    "title": "Write the chain out",
    "chain": "0.5 g~ × (1000 mg / 1 g~)",
    "note": "Struck-through units cancel against each other.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Check what survives",
    "math": "Everything cancels except mg.",
    "note": "A single surviving unit is a good sign that the setup is right.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply everything on top",
    "math": "0.5 × 1000 = 500",
    "order": "step__title,step__math"
   },
   {
    "title": "Multiply everything on the bottom",
    "math": "1 = 1",
    "order": "step__title,step__math"
   },
   {
    "title": "Divide",
    "math": "500 ÷ 1 = 500 mg",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: weight-based dose": {
  "answerLabel": "Result",
  "answer": "136.36 mg",
  "answerNote": "The units canceled down to mg, which is exactly what you were aiming for.",
  "error": null,
  "steps": [
   {
    "title": "Write the chain out",
    "chain": "150 lb~ × (1 kg~ / 2.2 lb~) × (2 mg / 1 kg~)",
    "note": "Struck-through units cancel against each other.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Check what survives",
    "math": "Everything cancels except mg.",
    "note": "A single surviving unit is a good sign that the setup is right.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply everything on top",
    "math": "150 × 1 × 2 = 300",
    "order": "step__title,step__math"
   },
   {
    "title": "Multiply everything on the bottom",
    "math": "2.2 × 1 = 2.2",
    "order": "step__title,step__math"
   },
   {
    "title": "Divide",
    "math": "300 ÷ 2.2 = 136.36 mg",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: teaspoons to mg": {
  "answerLabel": "Result",
  "answer": "500 mg",
  "answerNote": "The units canceled down to mg, which is exactly what you were aiming for.",
  "error": null,
  "steps": [
   {
    "title": "Write the chain out",
    "chain": "2 tsp~ × (5 mL~ / 1 tsp~) × (250 mg / 5 mL~)",
    "note": "Struck-through units cancel against each other.",
    "order": "step__title,chain,step__note"
   },
   {
    "title": "Check what survives",
    "math": "Everything cancels except mg.",
    "note": "A single surviving unit is a good sign that the setup is right.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply everything on top",
    "math": "2 × 5 × 250 = 2500",
    "order": "step__title,step__math"
   },
   {
    "title": "Multiply everything on the bottom",
    "math": "1 × 5 = 5",
    "order": "step__title,step__math"
   },
   {
    "title": "Divide",
    "math": "2500 ÷ 5 = 500 mg",
    "order": "step__title,step__math"
   }
  ]
 }
}
```

## /calculators/proportions/

```json
{
 "Example: stock solution": {
  "answerLabel": "Solved for d",
  "answer": "8 mL",
  "answerNote": "The unknown was the right-hand amount in the second ratio.",
  "error": null,
  "steps": [
   {
    "title": "Write the two ratios with units in matching positions",
    "math": "250 mg per 5 mL   =   400 mg per d mL",
    "note": "mg sits on top on both sides and mL underneath on both sides. Check this before any arithmetic — it is the step that goes wrong.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Cross-multiply",
    "math": "250 × d  =  5 × 400",
    "note": "Multiply diagonally across the equals sign. The two products are equal.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Isolate d",
    "math": "d = (b × c) ÷ a",
    "note": "Divide both sides by whatever is multiplying d.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Substitute and solve",
    "math": "d = (5 × 400) ÷ 250\nd = 8 mL",
    "order": "step__title,step__math"
   },
   {
    "title": "The same problem as dimensional analysis",
    "chain": "400 mg~ × (5 mL / 250 mg~)",
    "note": "Same numbers, same answer of 8 mL — but here the known ratio is used as a conversion factor, turned so that mg cancels. If you had it upside down, you would be left with the wrong unit instead of a plausible wrong number.",
    "order": "step__title,chain,step__note"
   }
  ]
 },
 "Example: tablets": {
  "answerLabel": "Solved for d",
  "answer": "2500 mg",
  "answerNote": "The unknown was the right-hand amount in the second ratio.",
  "error": null,
  "steps": [
   {
    "title": "Write the two ratios with units in matching positions",
    "math": "3 tablets per 1500 mg   =   5 tablets per d mg",
    "note": "tablets sits on top on both sides and mg underneath on both sides. Check this before any arithmetic — it is the step that goes wrong.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Cross-multiply",
    "math": "3 × d  =  1500 × 5",
    "note": "Multiply diagonally across the equals sign. The two products are equal.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Isolate d",
    "math": "d = (b × c) ÷ a",
    "note": "Divide both sides by whatever is multiplying d.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Substitute and solve",
    "math": "d = (1500 × 5) ÷ 3\nd = 2500 mg",
    "order": "step__title,step__math"
   },
   {
    "title": "The same problem as dimensional analysis",
    "chain": "5 tablets~ × (1500 mg / 3 tablets~)",
    "note": "Same numbers, same answer of 2500 mg — but here the known ratio is used as a conversion factor, turned so that tablets cancels. If you had it upside down, you would be left with the wrong unit instead of a plausible wrong number.",
    "order": "step__title,chain,step__note"
   }
  ]
 }
}
```

## /calculators/specific-gravity/

```json
{
 "Example: glycerin": {
  "answerLabel": "Solved for mass",
  "answer": "125 g",
  "answerNote": "An sg of 1.25 means it is 1.25 times as heavy as the same volume of water, so it sinks in water.",
  "error": null,
  "steps": [
   {
    "title": "Start from the definition",
    "math": "sg = density of substance ÷ density of water",
    "note": "Water is 1 g/mL, and dividing by 1 changes nothing.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Which reduces to grams over milliliters",
    "math": "sg = mass (g) ÷ volume (mL)",
    "order": "step__title,step__math"
   },
   {
    "title": "Rearrange for mass",
    "math": "mass = sg × volume",
    "order": "step__title,step__math"
   },
   {
    "title": "Substitute",
    "math": "mass = 1.25 × 100 mL",
    "order": "step__title,step__math"
   },
   {
    "title": "Solve",
    "math": "mass = 125 g",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: alcohol by weight": {
  "answerLabel": "Solved for volume",
  "answer": "612.75 mL",
  "answerNote": "An sg of 0.816 means it is lighter than water — the same volume weighs only 81.6% as much — so it floats.",
  "error": null,
  "steps": [
   {
    "title": "Start from the definition",
    "math": "sg = density of substance ÷ density of water",
    "note": "Water is 1 g/mL, and dividing by 1 changes nothing.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Which reduces to grams over milliliters",
    "math": "sg = mass (g) ÷ volume (mL)",
    "order": "step__title,step__math"
   },
   {
    "title": "Rearrange for volume",
    "math": "volume = mass ÷ sg",
    "order": "step__title,step__math"
   },
   {
    "title": "Substitute",
    "math": "volume = 500 g ÷ 0.816",
    "order": "step__title,step__math"
   },
   {
    "title": "Solve",
    "math": "volume = 612.75 mL",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: find the sg": {
  "answerLabel": "Solved for sg",
  "answer": "1.2",
  "answerNote": "An sg of 1.2 means it is 1.2 times as heavy as the same volume of water, so it sinks in water.",
  "error": null,
  "steps": [
   {
    "title": "Start from the definition",
    "math": "sg = density of substance ÷ density of water",
    "note": "Water is 1 g/mL, and dividing by 1 changes nothing.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Which reduces to grams over milliliters",
    "math": "sg = mass (g) ÷ volume (mL)",
    "order": "step__title,step__math"
   },
   {
    "title": "Rearrange for sg",
    "math": "sg = mass ÷ volume",
    "order": "step__title,step__math"
   },
   {
    "title": "Substitute",
    "math": "sg = 60 g ÷ 50 mL",
    "order": "step__title,step__math"
   },
   {
    "title": "Solve",
    "math": "sg = 1.2",
    "note": "Notice the grams and milliliters cancel conceptually — the answer carries no unit.",
    "order": "step__title,step__math,step__note"
   }
  ]
 }
}
```

## /calculators/reduce-enlarge/

```json
{
 "Example: reduce to 120 mL": {
  "answerLabel": "Scaling factor",
  "answer": "× 0.12",
  "answerNote": "Apply this to all 4 ingredients to go from 1000 mL to 120 mL.",
  "error": null,
  "steps": [
   {
    "title": "Work out the scaling factor",
    "math": "factor = 120 mL ÷ 1000 mL = 0.12",
    "note": "A factor below 1 means you are reducing the formula. The units cancel, so the factor is just a number.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply every ingredient by that factor",
    "math": "Active drug: 25 g × 0.12 = 3 g\nGlycerin: 100 mL × 0.12 = 12 mL\nSyrup: 300 mL × 0.12 = 36 mL\nPurified water: 600 mL × 0.12 = 72 mL",
    "note": "The vehicle and any inactive ingredients scale too, not just the active one.",
    "order": "step__title,step__math,step__note"
   }
  ],
  "table": [
   "Ingredient | Original (per 1000 mL) | Scaled (per 120 mL)",
   "Active drug | 25 g | 3 g",
   "Glycerin | 100 mL | 12 mL",
   "Syrup | 300 mL | 36 mL",
   "Purified water | 600 mL | 72 mL"
  ]
 },
 "Example: enlarge to 1 lb": {
  "answerLabel": "Scaling factor",
  "answer": "× 4.54",
  "answerNote": "Apply this to all 3 ingredients to go from 100 g to 454 g.",
  "error": null,
  "steps": [
   {
    "title": "Work out the scaling factor",
    "math": "factor = 454 g ÷ 100 g = 4.54",
    "note": "A factor above 1 means you are enlarging the formula. The units cancel, so the factor is just a number.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Multiply every ingredient by that factor",
    "math": "Hydrocortisone: 1 g × 4.54 = 4.54 g\nLiquid petrolatum: 5 g × 4.54 = 22.7 g\nWhite petrolatum: 94 g × 4.54 = 426.76 g",
    "note": "The vehicle and any inactive ingredients scale too, not just the active one.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Add the scaled amounts back up as a check",
    "math": "4.54 + 22.7 + 426.76 = 454 g",
    "note": "That matches the 454 g you wanted, so nothing was missed.",
    "order": "step__title,step__math,step__note"
   }
  ],
  "table": [
   "Ingredient | Original (per 100 g) | Scaled (per 454 g)",
   "Hydrocortisone | 1 g | 4.54 g",
   "Liquid petrolatum | 5 g | 22.7 g",
   "White petrolatum | 94 g | 426.76 g"
  ]
 }
}
```

## /calculators/colligative-properties/

All four modes are exercised; each preset switches its own mode via `onPreset`.
`mode`, `iPreset`, `visiblePanels` and `pressed` capture the presentation state
that the mode switcher and dropdown syncing are responsible for.

```json
{
 "Example: 0.9% sodium chloride [osmolarity]": {
  "mode": "osmolarity",
  "iPreset": "2",
  "visiblePanels": "osmolarity",
  "pressed": "osmolarity",
  "answerLabel": "Osmolarity",
  "answer": "308.01 mOsmol/L",
  "answerNote": "This sits inside the roughly 250–310 mOsmol/L spanned by the isotonic IV fluids, so it is close to iso-osmotic with blood.",
  "error": null,
  "steps": [
   {
    "title": "Convert the solute mass to moles",
    "math": "n = 9 g ÷ 58.44 g/mol = 0.154 mol",
    "note": "Moles of compound, before it dissociates into anything.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Apply the Van't Hoff factor to get osmoles",
    "math": "osmol = 0.154 mol × 2 = 0.30801 osmol",
    "note": "Each molecule contributes 2 particles, so the particle count rises.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Convert to milliosmoles",
    "math": "0.30801 osmol × 1000 = 308.01 mOsmol",
    "order": "step__title,step__math"
   },
   {
    "title": "Divide by the volume in liters",
    "math": "1000 mL ÷ 1000 = 1 L\n308.01 mOsmol ÷ 1 L = 308.01 mOsmol/L",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: 5% dextrose (monohydrate) [osmolarity]": {
  "mode": "osmolarity",
  "iPreset": "1",
  "visiblePanels": "osmolarity",
  "pressed": "osmolarity",
  "answerLabel": "Osmolarity",
  "answer": "252.31 mOsmol/L",
  "answerNote": "This sits inside the roughly 250–310 mOsmol/L spanned by the isotonic IV fluids, so it is close to iso-osmotic with blood.",
  "error": null,
  "steps": [
   {
    "title": "Convert the solute mass to moles",
    "math": "n = 50 g ÷ 198.17 g/mol = 0.25231 mol",
    "note": "Moles of compound, before it dissociates into anything.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Apply the Van't Hoff factor to get osmoles",
    "math": "osmol = 0.25231 mol × 1 = 0.25231 osmol",
    "note": "i = 1, so each molecule stays as a single particle and the count is unchanged.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Convert to milliosmoles",
    "math": "0.25231 osmol × 1000 = 252.31 mOsmol",
    "order": "step__title,step__math"
   },
   {
    "title": "Divide by the volume in liters",
    "math": "1000 mL ÷ 1000 = 1 L\n252.31 mOsmol ÷ 1 L = 252.31 mOsmol/L",
    "order": "step__title,step__math"
   }
  ]
 },
 "Example: 0.9% sodium chloride [freezing]": {
  "mode": "freezing",
  "iPreset": "2",
  "visiblePanels": "freezing",
  "pressed": "freezing",
  "answerLabel": "Freezing point of the solution",
  "answer": "-0.5729 °C",
  "answerNote": "That is close to the −0.52 °C of blood, so this solution counts as iso-osmotic with plasma.",
  "error": null,
  "steps": [
   {
    "title": "Convert the solute mass to moles",
    "math": "n = 0.9 g ÷ 58.44 g/mol = 0.0154 mol",
    "order": "step__title,step__math"
   },
   {
    "title": "Convert the solvent mass to kilograms",
    "math": "100 g ÷ 1000 = 0.1 kg",
    "note": "Freezing point depression uses molality — moles per kilogram of solvent, not per liter of solution.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Work out the molality",
    "math": "m = 0.0154 mol ÷ 0.1 kg = 0.154 mol/kg",
    "order": "step__title,step__math"
   },
   {
    "title": "Apply the freezing point depression equation",
    "math": "ΔTf = Kf × m × i\nΔTf = 1.86 × 0.154 × 2 = 0.5729 °C",
    "order": "step__title,step__math"
   },
   {
    "title": "Subtract from the freezing point of pure water",
    "math": "0 °C − 0.5729 °C = -0.5729 °C",
    "note": "Dissolved particles get in the way of the orderly structure ice needs, so the solution has to be colder before it will freeze.",
    "order": "step__title,step__math,step__note"
   }
  ]
 },
 "Example: 1 molal sodium chloride [boiling]": {
  "mode": "boiling",
  "iPreset": "2",
  "visiblePanels": "boiling",
  "pressed": "boiling",
  "answerLabel": "Boiling point of the solution",
  "answer": "101.03 °C",
  "answerNote": "The boiling point rises by 1.0251 °C compared with pure water.",
  "error": null,
  "steps": [
   {
    "title": "Convert the solute mass to moles",
    "math": "n = 5.85 g ÷ 58.44 g/mol = 0.1001 mol",
    "order": "step__title,step__math"
   },
   {
    "title": "Convert the solvent mass to kilograms",
    "math": "100 g ÷ 1000 = 0.1 kg",
    "note": "Boiling point elevation uses molality — moles per kilogram of solvent, not per liter of solution.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Work out the molality",
    "math": "m = 0.1001 mol ÷ 0.1 kg = 1.001 mol/kg",
    "order": "step__title,step__math"
   },
   {
    "title": "Apply the boiling point elevation equation",
    "math": "ΔTb = Kb × m × i\nΔTb = 0.512 × 1.001 × 2 = 1.0251 °C",
    "order": "step__title,step__math"
   },
   {
    "title": "Add to the boiling point of pure water",
    "math": "100 °C + 1.0251 °C = 101.03 °C",
    "note": "Solute particles at the surface make it harder for solvent molecules to escape, so more heat is needed to boil.",
    "order": "step__title,step__math,step__note"
   }
  ]
 },
 "Example: dextrose monohydrate in water [vapor]": {
  "mode": "vapor",
  "iPreset": "1",
  "visiblePanels": "vapor",
  "pressed": "vapor",
  "answerLabel": "Vapor pressure of the solution",
  "answer": "23.417 mmHg",
  "answerNote": "Lowered by 0.38328 mmHg from the 23.8 mmHg of the pure solvent.",
  "error": null,
  "steps": [
   {
    "title": "Convert the solute to moles of particles",
    "math": "n = 18 g ÷ 198.17 g/mol = 0.090831 mol\nparticles = 0.090831 × 1 = 0.090831 mol",
    "order": "step__title,step__math"
   },
   {
    "title": "Convert the solvent to moles",
    "math": "n(solvent) = 100 g ÷ 18.02 g/mol = 5.5494 mol",
    "order": "step__title,step__math"
   },
   {
    "title": "Work out the mole fraction of solute",
    "math": "X(solute) = 0.090831 ÷ (0.090831 + 5.5494) = 0.016104",
    "note": "The solvent makes up the rest, X(solvent) = 0.9839. Mole fractions always sum to 1.",
    "order": "step__title,step__math,step__note"
   },
   {
    "title": "Apply Raoult's law",
    "math": "ΔP = X(solute) × P°\nΔP = 0.016104 × 23.8 = 0.38328 mmHg",
    "order": "step__title,step__math"
   },
   {
    "title": "Subtract from the pure solvent",
    "math": "23.8 − 0.38328 = 23.417 mmHg",
    "note": "Solute particles occupy part of the surface, so fewer solvent molecules can evaporate.",
    "order": "step__title,step__math,step__note"
   }
  ]
 }
}
```
